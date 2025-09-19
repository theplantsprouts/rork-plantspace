# Firebase Setup Guide - Production Mode

## Overview
This guide will help you set up Firebase for your PlantSpace app in production mode with secure authentication and storage.

## Prerequisites
- Firebase project: `plantspace-5a93d`
- Admin access to Firebase Console
- Email/password authentication only

## Step-by-Step Setup

### 1. Firebase Console Access
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **plantspace-5a93d**

### 2. Enable Authentication
1. Navigate to **Authentication** > **Sign-in method**
2. Click on **Email/Password**
3. Enable the first toggle (Email/Password)
4. Click **Save**

### 3. Create Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. **IMPORTANT**: Choose **"Start in production mode"**
4. Select your preferred location (choose closest to your users)
5. Click **Done**

### 4. Enable Firebase Storage
1. Go to **Storage**
2. Click **Get started**
3. **IMPORTANT**: Choose **"Start in production mode"**
4. Select the **same location** as your Firestore database
5. Click **Done**

### 5. Deploy Security Rules

#### Firestore Rules
1. Go to **Firestore Database** > **Rules**
2. Replace the existing rules with the content from `firestore.rules` in your project
3. Click **Publish**

#### Storage Rules
1. Go to **Storage** > **Rules**
2. Replace the existing rules with the content from `storage.rules` in your project
3. Click **Publish**

### 6. Test Your Setup
1. In your app, navigate to `/firebase-test`
2. Enter a test email and password
3. Click "Run All Tests"
4. All tests should pass ✅

## Security Features

### Production-Ready Security Rules
- **Authentication Required**: All operations require user authentication
- **Data Validation**: Strict validation for profiles and posts
- **User Isolation**: Users can only modify their own data
- **File Size Limits**: 10MB limit for image uploads
- **File Type Validation**: Only image files allowed in storage

### What's Protected
- ✅ User profiles (read: any authenticated user, write: owner only)
- ✅ Posts (read: any authenticated user, write: owner only)
- ✅ Comments (read: any authenticated user, write: owner only)
- ✅ File uploads (write: owner only, size/type validated)
- ✅ Push notification tokens (read/write: owner only)

## Configuration Details

### Current Firebase Config
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDzPmgJia4ZKtbuKM6wiSPPK27023HRqFs",
  authDomain: "plantspace-5a93d.firebaseapp.com",
  projectId: "plantspace-5a93d",
  storageBucket: "plantspace-5a93d.firebasestorage.app",
  messagingSenderId: "969912616990",
  appId: "1:969912616990:web:7c9bccb8ca7d7996bbc60f",
  measurementId: "G-W39QPM2BQK"
};
```

### Supported Features
- ✅ Email/Password Authentication
- ✅ User Profiles
- ✅ Posts with Images
- ✅ Real-time Updates
- ✅ File Storage (Images)
- ✅ Analytics (Web only)
- ❌ Push Notifications (Expo Go limitation)

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Ensure security rules are deployed correctly
   - Check that user is authenticated
   - Verify user is trying to access their own data

2. **Authentication Errors**
   - Ensure Email/Password is enabled in Firebase Console
   - Check email format is valid
   - Password must be at least 6 characters

3. **Storage Upload Errors**
   - Check file size (must be < 10MB)
   - Ensure file is an image type
   - Verify user is authenticated

### Test Results
After setup, your Firebase test should show:
- ✅ Firebase Connection: Passed
- ✅ Authentication: Passed
- ✅ Firestore Read: Passed
- ✅ Firestore Write: Passed
- ✅ Firestore Query: Passed

## Next Steps

Once Firebase is set up and tests pass:
1. Your app will work with secure, production-ready backend
2. Users can register and login
3. Posts and profiles will sync in real-time
4. Images can be uploaded to Firebase Storage
5. All data is protected by security rules

## Support

If you encounter issues:
1. Check the Firebase Console for error logs
2. Use the `/firebase-test` screen to diagnose problems
3. Verify all steps in this guide were completed
4. Check that security rules match the files in your project

---

**Status**: Production Ready 🚀
**Security**: Enabled 🔒
**Authentication**: Email/Password ✅
**Storage**: Enabled ✅