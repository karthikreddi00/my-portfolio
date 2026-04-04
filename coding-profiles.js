/* ============================================
   CODING-PROFILES.JS — Live Stats Fetcher
   ============================================
   Fetches live data for CodeChef & LeetCode,
   caches in localStorage, renders instantly,
   and refreshes silently in background.
   ============================================ */

// ==========================================
// CONFIGURATION
// ==========================================
const PROFILE_CONFIG = {
    leetcode: {
        username: 'karthikreddi00',
        solvedEndpoint: 'https://alfa-leetcode-api.onrender.com/',
        contestEndpoint: 'https://alfa-leetcode-api.onrender.com/',
        profileEndpoint: 'https://alfa-leetcode-api.onrender.com/userProfile/',
        calendarEndpoint: 'https://alfa-leetcode-api.onrender.com/',
        cacheKey: 'portfolio_leetcode_stats',
        cacheDuration: 5 * 60 * 1000, // 5 minutes
    },
    codechef: {
        username: 'klu_2300030338',
        cacheKey: 'portfolio_codechef_stats',
        cacheDuration: 30 * 60 * 1000, // 30 minutes
        // Hardcoded known-good values used as immediate placeholders
        // and as ultimate fallback if all APIs fail
        knownGood: {
            rating: 1423,
            starsCount: 2,
            problemsSolved: 158,
        },
    },
    // Smart Interviews — manual config (no public API)
    smartInterviews: {
        status: 'Active Learner',
        focus: 'DSA & Problem Solving',
    },
};

// ==========================================
// UTILITY: localStorage Cache
// ==========================================
function getCachedData(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        const expired = Date.now() - parsed.timestamp > parsed.ttl;
        return { data: parsed.data, expired };
    } catch {
        return null;
    }
}

function setCachedData(key, data, ttl) {
    try {
        localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now(), ttl }));
    } catch { /* localStorage full or unavailable */ }
}

// ==========================================
// UTILITY: Subtle timestamp formatter
// ==========================================
function formatTimestamp(date) {
    const diff = Date.now() - date.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ==========================================
// CODECHEF: Star helpers
// ==========================================

/** Returns numeric star count (1–7) from rating */
function deriveStarsCount(rating) {
    if (rating >= 2500) return 7;
    if (rating >= 2200) return 6;
    if (rating >= 2000) return 5;
    if (rating >= 1800) return 4;
    if (rating >= 1600) return 3;
    if (rating >= 1400) return 2;
    return 1;
}

/** Returns clean display string like "2★★" */
function formatStarsDisplay(count) {
    return count + '★'.repeat(count);
}

// ==========================================
// RENDER: Last-updated timestamp (clickable for manual refresh)
// ==========================================
function renderLastUpdated(card, timestamp, onRefreshClick) {
    let el = card.querySelector('.profile-last-updated');
    if (!timestamp) { if (el) el.remove(); return; }

    if (!el) {
        el = document.createElement('p');
        el.className = 'profile-last-updated';
        const btn = card.querySelector('.btn-outline');
        if (btn) btn.parentNode.insertBefore(el, btn);
        else card.querySelector('.profile-content')?.appendChild(el);
    }

    el.innerHTML = `<i class="fas fa-sync-alt"></i> Updated ${formatTimestamp(new Date(timestamp))}`;

    // Make clickable for manual refresh if a handler is provided
    if (onRefreshClick) {
        el.classList.add('profile-last-updated--clickable');
        el.title = 'Click to refresh stats';
        // Remove old listener by replacing node (simple, no leak)
        const newEl = el.cloneNode(true);
        el.parentNode.replaceChild(newEl, el);
        newEl.addEventListener('click', async () => {
            newEl.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Syncing...';
            newEl.style.pointerEvents = 'none';
            await onRefreshClick();
            newEl.style.pointerEvents = '';
        });
    }
}

// ==========================================
// LEETCODE: Fetch & Render
// ==========================================

/**
 * Core fetch logic for LeetCode — separated so it can be called
 * both on page load and on manual refresh click.
 * Returns the fetched stats object, or null if fetch failed.
 */
async function doLeetCodeFetch() {
    const config = PROFILE_CONFIG.leetcode;

    const [solvedRes, contestRes] = await Promise.all([
        fetch(`${config.solvedEndpoint}${config.username}/solved`),
        fetch(`${config.contestEndpoint}${config.username}/contest`),
    ]);
    if (!solvedRes.ok || !contestRes.ok) throw new Error('API error');

    const solvedData = await solvedRes.json();
    const contestData = await contestRes.json();

    const stats = {
        totalSolved: solvedData.solvedProblem || 0,
        easySolved: solvedData.easySolved || 0,
        mediumSolved: solvedData.mediumSolved || 0,
        hardSolved: solvedData.hardSolved || 0,
        contestRating: Math.round(contestData.contestRating || 0),
        contestsAttended: contestData.contestAttend || 0,
        lastUpdated: Date.now(),
    };

    // ── STREAK RESOLUTION ──
    // The current streak (e.g. 161) is ONLY available via LeetCode's
    // authenticated streakCounter GraphQL query. Public APIs cannot access it.
    //
    // What we CAN get:
    //   1) /calendar endpoint → "streak" field = the MAX streak (e.g. 153)
    //   2) /userProfile → submissionCalendar = raw data to calculate from
    //      BUT this calendar has gaps/lag so calculation is unreliable
    //
    // Strategy: fetch the /calendar streak (most reliable public value),
    // also try calculating from the calendar, and use the HIGHER value.
    // This ensures we never show a broken low number.

    let apiStreak = 0;       // from /calendar endpoint
    let calcStreak = 0;      // calculated from submissionCalendar

    try {
        const calRes = await fetch(`${config.calendarEndpoint}${config.username}/calendar`);
        if (calRes.ok) {
            const calData = await calRes.json();
            apiStreak = calData.streak || 0;

            // The calendar endpoint also has submissionCalendar (as a JSON string)
            if (calData.submissionCalendar) {
                const cal = typeof calData.submissionCalendar === 'string'
                    ? JSON.parse(calData.submissionCalendar)
                    : calData.submissionCalendar;
                calcStreak = calculateStreak(cal);
            }
        }
    } catch { /* not critical */ }

    // Fallback: try /userProfile if /calendar didn't give us calendar data
    if (calcStreak === 0) {
        try {
            const profileRes = await fetch(`${config.profileEndpoint}${config.username}`);
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                if (profileData.submissionCalendar) {
                    calcStreak = calculateStreak(profileData.submissionCalendar);
                }
            }
        } catch { /* not critical */ }
    }

    // Use the higher of API streak and calculated streak
    stats.streak = Math.max(apiStreak, calcStreak);

    return stats;
}

/** Manual refresh handler — called when user clicks "Updated Xm ago" on LeetCode card */
async function manualRefreshLeetCode() {
    const config = PROFILE_CONFIG.leetcode;
    const card = document.getElementById('leetcode-card');
    if (!card) return;

    try {
        const stats = await doLeetCodeFetch();
        setCachedData(config.cacheKey, stats, config.cacheDuration);
        renderLeetCodeStats(card, stats, true);
    } catch {
        // Fetch failed — restore the label to current state
        const cached = getCachedData(config.cacheKey);
        const ts = (cached && cached.data) ? cached.data.lastUpdated : Date.now();
        renderLastUpdated(card, ts, manualRefreshLeetCode);
    }
}

async function fetchLeetCodeStats() {
    const config = PROFILE_CONFIG.leetcode;
    const card = document.getElementById('leetcode-card');
    if (!card) return;

    // 1) Render cached data instantly (no skeleton, no delay)
    const cached = getCachedData(config.cacheKey);
    if (cached && cached.data) {
        renderLeetCodeStats(card, cached.data, false);
    }

    // 2) Always refresh in background (even if cache is valid)
    //    This ensures streak and other stats stay fresh
    try {
        const stats = await doLeetCodeFetch();
        setCachedData(config.cacheKey, stats, config.cacheDuration);

        // Only re-render if values actually changed (avoid flicker)
        const hasChanged = !cached || !cached.data ||
            cached.data.totalSolved !== stats.totalSolved ||
            cached.data.contestRating !== stats.contestRating ||
            cached.data.streak !== stats.streak;

        if (hasChanged) {
            renderLeetCodeStats(card, stats, true);
        } else {
            // Just update the timestamp
            renderLastUpdated(card, stats.lastUpdated, manualRefreshLeetCode);
        }
    } catch (err) {
        console.warn('LeetCode fetch failed:', err);
        // If we had no cached data either, show fallback
        if (!cached || !cached.data) {
            renderLeetCodeFallback(card);
        }
    }
}

function calculateStreak(calendar) {
    if (!calendar || typeof calendar !== 'object') return 0;

    const timestamps = Object.keys(calendar)
        .map(ts => parseInt(ts, 10))
        .filter(ts => calendar[ts] > 0)
        .sort((a, b) => b - a);

    if (timestamps.length === 0) return 0;

    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const todayDayNum = Math.floor(todayStart.getTime() / 1000 / 86400);

    const days = [...new Set(timestamps.map(ts => Math.floor(ts / 86400)))].sort((a, b) => b - a);
    if (days.length === 0) return 0;

    const mostRecentDay = days[0];
    if (mostRecentDay < todayDayNum - 1) return 0;

    let streak = 1;
    for (let i = 1; i < days.length; i++) {
        if (days[i] === days[i - 1] - 1) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

function renderLeetCodeStats(card, stats, animate) {
    const statsContainer = card.querySelector('.profile-stats');
    if (!statsContainer) return;

    const streakLabel = (stats.streak !== undefined && stats.streak > 0)
        ? `${stats.streak}`
        : '—';

    statsContainer.innerHTML = `
        <span class="stat-badge" title="Contest Rating">
            <i class="fas fa-trophy"></i> <strong>${stats.contestRating}</strong> Rating
        </span>
        <span class="stat-badge" title="Daily Streak">
            <i class="fas fa-fire"></i> <strong>${streakLabel}</strong> Day Streak
        </span>
        <span class="stat-badge" title="Total Solved">
            <i class="fas fa-check-circle"></i> <strong>${stats.totalSolved}</strong> Solved
        </span>
        <span class="stat-badge stat-badge-easy" title="Easy">
            <i class="fas fa-circle" style="color:#00b8a3;font-size:0.5rem;"></i> <strong>${stats.easySolved}</strong> Easy
        </span>
        <span class="stat-badge stat-badge-medium" title="Medium">
            <i class="fas fa-circle" style="color:#ffc01e;font-size:0.5rem;"></i> <strong>${stats.mediumSolved}</strong> Med
        </span>
        <span class="stat-badge stat-badge-hard" title="Hard">
            <i class="fas fa-circle" style="color:#ff375f;font-size:0.5rem;"></i> <strong>${stats.hardSolved}</strong> Hard
        </span>
    `;

    renderLastUpdated(card, stats.lastUpdated, manualRefreshLeetCode);

    if (animate) {
        statsContainer.style.opacity = '0';
        statsContainer.style.transform = 'translateY(4px)';
        requestAnimationFrame(() => {
            statsContainer.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            statsContainer.style.opacity = '1';
            statsContainer.style.transform = 'translateY(0)';
        });
    }
}

function renderLeetCodeFallback(card) {
    const statsContainer = card.querySelector('.profile-stats');
    if (!statsContainer) return;
    statsContainer.innerHTML = `
        <span class="stat-badge stat-badge-error">
            <i class="fas fa-exclamation-circle"></i> Stats unavailable —
            <a href="https://leetcode.com/u/${PROFILE_CONFIG.leetcode.username}/" target="_blank" rel="noopener" style="color:var(--accent-primary);">visit profile</a>
        </span>
    `;
}

// ==========================================
// CODECHEF: Fetch & Render
// ==========================================
/**
 * Core fetch logic for CodeChef — separated so it can be called
 * both on page load and on manual refresh click.
 * Returns the fetched stats object, or null if all sources failed.
 */
async function doCodeChefFetch() {
    const config = PROFILE_CONFIG.codechef;
    const apis = [
        `https://codechef-api.vercel.app/handle/${config.username}`,
        `https://codechef-api.vercel.app/${config.username}`,
    ];

    // Attempt: Try known CodeChef APIs
    for (const url of apis) {
        try {
            const ctrl = new AbortController();
            const tid = setTimeout(() => ctrl.abort(), 6000);
            const res = await fetch(url, { signal: ctrl.signal });
            clearTimeout(tid);
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    const rating = data.currentRating || data.rating || data.highestRating || 0;
                    return {
                        rating,
                        starsCount: deriveStarsCount(rating),
                        problemsSolved: data.fullySolved || data.problemsSolved || data.totalProblemsSolved || 0,
                        lastUpdated: Date.now(),
                    };
                }
            }
        } catch { /* try next */ }
    }

    // Attempt: Try allorigins CORS proxy
    try {
        const profileUrl = `https://www.codechef.com/users/${config.username}`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(profileUrl)}`;
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 8000);
        const res = await fetch(proxyUrl, { signal: ctrl.signal });
        clearTimeout(tid);
        if (res.ok) {
            const html = await res.text();
            return parseCodeChefHTML(html);
        }
    } catch { /* proxy failed */ }

    return null;
}

/** Manual refresh handler — called when user clicks "Updated Xm ago" */
async function manualRefreshCodeChef() {
    const config = PROFILE_CONFIG.codechef;
    const card = document.getElementById('codechef-card');
    if (!card) return;

    const stats = await doCodeChefFetch();
    if (stats) {
        setCachedData(config.cacheKey, stats, config.cacheDuration);
        renderCodeChefStats(card, stats, true);
    } else {
        // Fetch failed — restore the "Updated" label to current state
        const cached = getCachedData(config.cacheKey);
        const ts = (cached && cached.data) ? cached.data.lastUpdated : Date.now();
        renderLastUpdated(card, ts, manualRefreshCodeChef);
    }
}

async function fetchCodeChefStats() {
    const config = PROFILE_CONFIG.codechef;
    const card = document.getElementById('codechef-card');
    if (!card) return;

    // 1) Render cached or known-good immediately (no visible skeleton)
    const cached = getCachedData(config.cacheKey);
    if (cached && cached.data) {
        renderCodeChefStats(card, cached.data, false);
        if (!cached.expired) return; // Cache still fresh
    } else {
        // No cache — render known-good values immediately
        renderCodeChefStats(card, {
            rating: config.knownGood.rating,
            starsCount: config.knownGood.starsCount,
            problemsSolved: config.knownGood.problemsSolved,
            lastUpdated: null,
        }, false);
    }

    // 2) Try to fetch fresh data in background
    const stats = await doCodeChefFetch();
    if (stats) {
        setCachedData(config.cacheKey, stats, config.cacheDuration);
        renderCodeChefStats(card, stats, true);
    }
}

function parseCodeChefHTML(html) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        let rating = 0;
        const ratingEl = doc.querySelector('.rating-number');
        if (ratingEl) rating = parseInt(ratingEl.textContent.trim(), 10) || 0;
        const ratingHeader = doc.querySelector('.rating-header .rating-number');
        if (ratingHeader) rating = parseInt(ratingHeader.textContent.trim(), 10) || rating;

        let problemsSolved = 0;
        const problemSection = doc.querySelector('.problems-solved h3');
        if (problemSection) {
            const m = problemSection.textContent.match(/(\d+)/);
            if (m) problemsSolved = parseInt(m[1], 10);
        }
        if (problemsSolved === 0) {
            const links = doc.querySelectorAll('.problems-solved article:first-child a');
            problemsSolved = links.length;
        }

        return {
            rating,
            starsCount: deriveStarsCount(rating),
            problemsSolved: problemsSolved || 0,
            lastUpdated: Date.now(),
        };
    } catch {
        return null;
    }
}

function renderCodeChefStats(card, stats, animate) {
    const statsContainer = card.querySelector('.profile-stats');
    if (!statsContainer) return;

    const starsCount = stats.starsCount || deriveStarsCount(stats.rating || 0);
    const starsText = formatStarsDisplay(starsCount);

    // Third badge: show problems if available (> 0), otherwise a clean fallback
    const thirdBadge = (stats.problemsSolved && stats.problemsSolved > 0)
        ? `<i class="fas fa-check-circle"></i> <strong>${stats.problemsSolved}</strong> Problems`
        : `<i class="fas fa-laptop-code"></i> <strong>Active Coder</strong>`;

    statsContainer.innerHTML = `
        <span class="stat-badge stat-badge-stars" title="${starsCount}-Star on CodeChef">
            <strong>${starsText}</strong>
        </span>
        <span class="stat-badge" title="Current Rating">
            <i class="fas fa-trophy"></i> <strong>${stats.rating}</strong> Rating
        </span>
        <span class="stat-badge" title="${stats.problemsSolved > 0 ? 'Problems Solved' : 'Active Profile'}">
            ${thirdBadge}
        </span>
    `;

    if (stats.lastUpdated) {
        renderLastUpdated(card, stats.lastUpdated, manualRefreshCodeChef);
    }

    if (animate) {
        statsContainer.style.opacity = '0';
        statsContainer.style.transform = 'translateY(4px)';
        requestAnimationFrame(() => {
            statsContainer.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            statsContainer.style.opacity = '1';
            statsContainer.style.transform = 'translateY(0)';
        });
    }
}

// ==========================================
// HACKERRANK: Static (no public stats API)
// ==========================================
function renderHackerRankCard() {
    const card = document.getElementById('hackerrank-card');
    if (!card) return;
    const statsContainer = card.querySelector('.profile-stats');
    if (!statsContainer) return;

    statsContainer.innerHTML = `
        <span class="stat-badge" title="Java Certification">
            <i class="fas fa-certificate"></i> <strong>Java (Basic)</strong>
        </span>
        <span class="stat-badge" title="Problem Solving">
            <i class="fas fa-medal"></i> <strong>Problem Solving</strong>
        </span>
    `;
}

// ==========================================
// SMART INTERVIEWS: Manual config
// ==========================================
function renderSmartInterviewsCard() {
    const card = document.getElementById('si-card');
    if (!card) return;
    const config = PROFILE_CONFIG.smartInterviews;
    const statsContainer = card.querySelector('.profile-stats');
    if (!statsContainer) return;

    statsContainer.innerHTML = `
        <span class="stat-badge" title="Status">
            <i class="fas fa-graduation-cap"></i> <strong>${config.status}</strong>
        </span>
        <span class="stat-badge" title="Focus Area">
            <i class="fas fa-book"></i> <strong>${config.focus}</strong>
        </span>
    `;
}

// ==========================================
// INIT
// ==========================================
function initCodingProfiles() {
    const cards = document.querySelectorAll('.profile-card');
    if (cards.length >= 1) cards[0].id = 'codechef-card';
    if (cards.length >= 2) cards[1].id = 'leetcode-card';
    if (cards.length >= 3) cards[2].id = 'hackerrank-card';
    if (cards.length >= 4) cards[3].id = 'si-card';

    // Render static cards + known-good/cached instantly
    renderHackerRankCard();
    renderSmartInterviewsCard();

    // Fetch dynamic data (renders cached first, refreshes in background)
    fetchCodeChefStats();
    fetchLeetCodeStats();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodingProfiles);
} else {
    initCodingProfiles();
}
