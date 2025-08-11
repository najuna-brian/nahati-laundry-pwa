# 🔥 Firebase Setup Guide for Nahati Laundry PWA

## 📋 Quick Setup Checklist

### 1. **Create Firebase Project**

- [ ] Go to [Firebase Console](https://console.firebase.google.com)
- [ ] Create new project: `nahati-laundry-app`
- [ ] Enable Google Analytics (optional)

### 2. **Enable Authentication**

- [ ] Go to Authentication > Sign-in method
- [ ] Enable **Email/Password**
- [ ] Enable **Google** (optional)

### 3. **Create Firestore Database**

- [ ] Go to Firestore Database
- [ ] Create database in **test mode**
- [ ] Choose region closest to Uganda

### 4. **Get Configuration**

- [ ] Go to Project Settings > General
- [ ] Scroll to "Your apps" section
- [ ] Click web icon `</>`
- [ ] Register app: `nahati-pwa`
- [ ] Copy the config object

### 5. **Update Environment Variables**

Replace these values in your `.env` file:

```env
REACT_APP_FIREBASE_API_KEY=your_actual_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 6. **Test Your Setup**

- [ ] Visit: `http://localhost:3000/firebase-setup`
- [ ] Click "Test Connection"
- [ ] Create admin user
- [ ] Run complete setup

### 7. **Security Rules** (Important!)

Copy the rules from `firestore.rules` to Firebase Console > Firestore Database > Rules

## 🎯 Quick Commands

1. **Test Firebase**: Visit `/firebase-setup`
2. **View Data**: Visit `/firebase-demo`
3. **Admin Login**: Visit `/admin/login`

## 🆘 Troubleshooting

### Common Issues:

1. **"Firebase not configured"**

   - Check your `.env` file has actual values (not placeholders)
   - Restart your development server after changing `.env`

2. **"Permission denied"**

   - Make sure Firestore is in "test mode" initially
   - Apply the security rules later

3. **"Auth domain error"**
   - Verify your domain is authorized in Firebase Console
   - Check Authentication > Settings > Authorized domains

### Need Help?

- Visit the Firebase Setup page: `/firebase-setup`
- Check browser console for detailed error messages
- Verify all environment variables are set correctly

## 🚀 After Setup

Once setup is complete, you can:

- Create customer accounts
- Place orders
- View real-time data updates
- Test admin functionality
- Use push notifications (optional)

## 🔐 Security Best Practices

1. Replace test mode with proper security rules
2. Use environment-specific projects (dev/staging/prod)
3. Enable App Check for production
4. Monitor usage and set quotas
5. Regular security audits
