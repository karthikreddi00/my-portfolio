/**
 * Cloudflare Worker — CodeChef Stats Proxy
 * 
 * Deployment Instructions:
 * 1. Go to https://dash.cloudflare.com → Workers & Pages → Create
 * 2. Name it "codechef-proxy" → Deploy
 * 3. Click "Edit Code" → paste this entire file
 * 4. Save and Deploy
 * 5. Your endpoint will be: https://codechef-proxy.<your-subdomain>.workers.dev/user/<username>
 * 6. Update PROFILE_CONFIG.codechef in coding-profiles.js with your worker URL
 * 
 * Example:
 *   fetch('https://codechef-proxy.myname.workers.dev/user/klu_2300030338')
 *     .then(r => r.json())
 *     .then(data => console.log(data));
 */

export default {
    async fetch(request) {
        const url = new URL(request.url);
        const path = url.pathname;

        // CORS headers for all responses
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=600', // Cache for 10 minutes
        };

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // Extract username from path: /user/<username>
        const match = path.match(/^\/user\/(\w+)$/);
        if (!match) {
            return new Response(
                JSON.stringify({ error: 'Usage: /user/<codechef_username>' }),
                { status: 400, headers: corsHeaders }
            );
        }

        const username = match[1];

        try {
            // Fetch CodeChef profile page
            const profileUrl = `https://www.codechef.com/users/${username}`;
            const res = await fetch(profileUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml',
                },
            });

            if (!res.ok) {
                throw new Error(`CodeChef returned ${res.status}`);
            }

            const html = await res.text();

            // Parse data from HTML
            const stats = parseCodeChefProfile(html, username);

            return new Response(JSON.stringify(stats), {
                status: 200,
                headers: corsHeaders,
            });
        } catch (err) {
            return new Response(
                JSON.stringify({ error: 'Failed to fetch CodeChef data', message: err.message }),
                { status: 502, headers: corsHeaders }
            );
        }
    },
};

function parseCodeChefProfile(html, username) {
    const result = {
        username,
        currentRating: 0,
        highestRating: 0,
        stars: '1★',
        globalRank: 0,
        countryRank: 0,
        problemsSolved: 0,
        fetchedAt: new Date().toISOString(),
    };

    // Extract current rating
    const ratingMatch = html.match(/rating-number[^>]*>(\d+)/);
    if (ratingMatch) {
        result.currentRating = parseInt(ratingMatch[1], 10);
    }

    // Extract highest rating
    const highestMatch = html.match(/Highest Rating.*?(\d{3,4})/s);
    if (highestMatch) {
        result.highestRating = parseInt(highestMatch[1], 10);
    }

    // Derive stars from rating
    const rating = result.currentRating;
    if (rating >= 2500) result.stars = '7★';
    else if (rating >= 2200) result.stars = '6★';
    else if (rating >= 2000) result.stars = '5★';
    else if (rating >= 1800) result.stars = '4★';
    else if (rating >= 1600) result.stars = '3★';
    else if (rating >= 1400) result.stars = '2★';
    else result.stars = '1★';

    // Extract global rank
    const globalRankMatch = html.match(/Global Rank.*?(\d+)/s);
    if (globalRankMatch) {
        result.globalRank = parseInt(globalRankMatch[1], 10);
    }

    // Extract country rank
    const countryRankMatch = html.match(/Country Rank.*?(\d+)/s);
    if (countryRankMatch) {
        result.countryRank = parseInt(countryRankMatch[1], 10);
    }

    // Extract problems solved — look for "Total Problems Solved: N"
    const problemsMatch = html.match(/Total Problems Solved:\s*(\d+)/i);
    if (problemsMatch) {
        result.problemsSolved = parseInt(problemsMatch[1], 10);
    } else {
        // Alternative: count problem links in fully-solved section
        const solvedSectionMatch = html.match(/Fully Solved.*?<\/section>/s);
        if (solvedSectionMatch) {
            const linkMatches = solvedSectionMatch[0].match(/<a /g);
            if (linkMatches) {
                result.problemsSolved = linkMatches.length;
            }
        }
    }

    return result;
}
