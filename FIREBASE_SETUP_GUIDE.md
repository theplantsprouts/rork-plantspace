# Firebase Setup Guide

## Current Status
Your Firebase project `plantspace-5a93d` is already configured, but needs proper deployment of security rules and verification of settings.

## Required Actions

### 1. Deploy Firestore Security Rules
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init firestore

# Deploy the updated security rules
firebase deploy --only firestore:rules
```

### 2. Deploy Storage Security Rules
```bash
# Initialize Firebase Storage (if not done)
firebase init storage

# Deploy storage rules
firebase deploy --only storage
```

### 3. Verify Firebase Console Settings

#### Authentication Settings
1. Go to https://console.firebase.google.com/project/plantspace-5a93d/authentication
2. Ensure **Email/Password** is enabled in Sign-in methods
3. Add your domain to authorized domains if needed

#### Firestore Database
1. Go to https://console.firebase.google.com/project/plantspace-5a93d/firestore
2. Ensure database is created in production mode
3. Verify the rules are deployed correctly

#### Storage
1. Go to https://console.firebase.google.com/project/plantspace-5a93d/storage
2. Create a storage bucket if not exists
3. Deploy the storage rules

### 4. Test the Setup
After deploying the rules, test:
- User registration
- User login
- Profile creation
- Post creation
- Image upload

## Current Configuration

### Firebase Config (already in your code)
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

### Security Rules Files
- `firestore.rules` - Firestore database rules (very permissive for development)
- `storage.rules` - Storage rules for image uploads

## Important Notes

1. **Current rules are very permissive for debugging** - Tighten them for production
2. **Push notifications are disabled** in Expo Go SDK 53+ - Use development build for notifications
3. **All backend services removed** - Using Firebase directly now
4. **TypeScript errors fixed** - Proper timeout typing

## Next Steps

1. Deploy the security rules using Firebase CLI
2. Test authentication and data operations
3. Verify image uploads work correctly
4. Tighten security rules for production deployment

## Troubleshooting

If you still get permission errors:
1. Check if rules are properly deployed
2. Verify user authentication state
3. Check Firebase Console logs
4. Ensure proper Firebase project permissions