# 🚀 Deploy Your Portfolio to GitHub Pages

This guide will help you deploy your portfolio website to GitHub Pages for free!

## 📋 Prerequisites

- A GitHub account
- Git installed on your computer
- Your portfolio files ready

## 🎯 Step-by-Step Deployment

### 1. Create a New GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** button in the top right corner
3. Select **"New repository"**
4. Name your repository: `your-username.github.io` (replace `your-username` with your actual GitHub username)
5. Make it **Public**
6. Click **"Create repository"**

### 2. Upload Your Portfolio Files

#### Option A: Upload via GitHub Web Interface (Easiest)
1. In your new repository, click **"uploading an existing file"**
2. Drag and drop all files from your `portfolio__frontend` folder:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `README.md`
3. Click **"Commit changes"**

#### Option B: Upload via Git Commands (Recommended)
1. Open your terminal/command prompt
2. Navigate to your portfolio folder:
   ```bash
   cd "C:\Users\karthik reddy\OneDrive\Documents\BIO\portfolio__frontend"
   ```
3. Initialize Git and add files:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio commit"
   ```
4. Connect to your GitHub repository:
   ```bash
   git remote add origin https://github.com/your-username/your-username.github.io.git
   git branch -M main
   git push -u origin main
   ```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **"Settings"** tab
3. Scroll down to **"Pages"** section (left sidebar)
4. Under **"Source"**, select **"Deploy from a branch"**
5. Choose **"main"** branch
6. Click **"Save"**

### 4. Wait for Deployment

- GitHub will build and deploy your site
- This usually takes 2-5 minutes
- You'll see a green checkmark when it's ready

### 5. Access Your Live Portfolio

Your portfolio will be available at:
```
https://your-username.github.io
```

## 🔄 Updating Your Portfolio

### Via GitHub Web Interface:
1. Go to your repository
2. Click on the file you want to edit
3. Click the pencil icon (Edit)
4. Make your changes
5. Click **"Commit changes"**
6. Your site will automatically update in a few minutes

### Via Git Commands:
```bash
cd "C:\Users\karthik reddy\OneDrive\Documents\BIO\portfolio__frontend"
git add .
git commit -m "Update portfolio content"
git push
```

## 🎨 Customizing Your Portfolio

Before deploying, make sure to update:

1. **Personal Information** in `index.html`:
   - Your name
   - Job title
   - About me section
   - Skills
   - Experience
   - Projects
   - Contact details

2. **Colors and Styling** in `styles.css` (optional)

3. **Functionality** in `script.js` (optional)

## 🌟 Features That Work on GitHub Pages

✅ **All Frontend Features:**
- Responsive design
- Smooth animations
- Interactive elements
- Contact information display
- Mobile navigation
- Smooth scrolling

❌ **Backend Features (Not Available):**
- Contact form submission
- Email sending
- Database storage
- Server-side processing

## 🔧 Contact Information

The portfolio displays your contact information and social media links:

- **Email**: kartheekreddy2605@gmail.com
- **Location**: Vijayawada, Andhra Pradesh
- **LinkedIn**: [karthik-reddy-2k05](https://www.linkedin.com/in/karthik-reddy-2k05/)
- **GitHub**: [karthikreddi00](https://github.com/karthikreddi00)
- **Instagram**: [_kartheek__reddy](https://www.instagram.com/_kartheek__reddy/?hl=en)

Visitors can reach you directly through these channels.

## 🚨 Troubleshooting

### Site Not Loading?
- Check if GitHub Pages is enabled in repository settings
- Wait 5-10 minutes for first deployment
- Check repository name matches exactly: `your-username.github.io`

### Styling Issues?
- Make sure all CSS files are uploaded
- Check file paths in HTML
- Clear browser cache

### JavaScript Not Working?
- Check browser console for errors
- Ensure all JS files are uploaded
- Verify file paths in HTML

## 🎉 Congratulations!

Your portfolio is now live on the internet for free! 

**Next Steps:**
1. Share your portfolio URL with potential employers
2. Add it to your resume
3. Link it on LinkedIn and other professional profiles
4. Keep updating it with new projects and skills

## 📞 Need Help?

- Check [GitHub Pages documentation](https://pages.github.com/)
- Look for errors in your browser's developer console
- Ensure all files are properly uploaded to your repository

---

**Your portfolio is now ready to impress the world! 🌍✨**
