# 🚀 Deployment Guide

## GitHub Repository Setup

1. **Create GitHub Repository**:

   - Go to [GitHub](https://github.com) and create a new repository
   - Name it: `nahati-laundry-pwa`
   - Don't initialize with README (we already have one)

2. **Connect Local Repository**:
   ```bash
   git remote add origin https://github.com/najuna-brian/nahati-laundry-pwa.git
   git push -u origin main
   ```

## Firebase Hosting Deployment

### Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project created (you already have: `nahati-laundry-app`)

### Setup Steps

1. **Login to Firebase**:

   ```bash
   firebase login
   ```

2. **Initialize Firebase Hosting**:

   ```bash
   firebase init hosting
   ```

   - Select your existing project: `nahati-laundry-app`
   - Public directory: `build`
   - Single-page app: `Yes`
   - GitHub auto-deploys: `Yes` (optional)

3. **Build and Deploy**:
   ```bash
   npm run build
   firebase deploy
   ```

### Environment Variables for Production

1. **Copy environment template**:

   ```bash
   cp .env.production.template .env.production
   ```

2. **Fill in production values** in `.env.production`:
   - Use your actual Firebase credentials
   - Add production Google Maps API key
   - Verify business contact information

### Custom Domain (Optional)

1. **Add domain in Firebase Console**:

   - Go to Firebase Console > Hosting
   - Add custom domain: `nahati.com` or `app.nahati.com`

2. **Update DNS records** as instructed by Firebase

### Continuous Deployment

Set up GitHub Actions for automatic deployment:

- Create `.github/workflows/deploy.yml`
- Configure Firebase service account
- Auto-deploy on push to main branch

## 📱 PWA Features

Your app will be installable on mobile devices with:

- ✅ Web App Manifest
- ✅ Service Worker
- ✅ HTTPS (automatic with Firebase)
- ✅ Responsive design
- ✅ Offline support

## 🔧 Post-Deployment Checklist

- [ ] Test app installation on mobile
- [ ] Verify WhatsApp integration works
- [ ] Test Google Maps functionality
- [ ] Confirm Firebase authentication
- [ ] Check admin dashboard access
- [ ] Validate order flow end-to-end
- [ ] Test offline functionality

## 📞 Support

For deployment issues:

- Check Firebase Console logs
- Verify environment variables
- Test locally with `npm start`
- Contact: WhatsApp +256 200 981 445
