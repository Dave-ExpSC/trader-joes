# Firebase Cloud Sync Setup Guide

This guide will help you set up Firebase to sync your Trader Joe's product data across all devices.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or use an existing project
3. Enter a project name (e.g., "trader-joes-app")
4. Disable Google Analytics (optional, not needed for this app)
5. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`)
2. Register your app with a nickname (e.g., "Trader Joe's Products")
3. Click "Register app"
4. **Copy the Firebase configuration** - you'll need these values

## Step 3: Set Up Firestore Database

1. In the Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. **Start in test mode** (for development)
   - This allows read/write access for 30 days
   - You can secure it later
4. Choose a location closest to you
5. Click "Enable"

## Step 4: Configure Your App

1. In your project folder, create a file named `.env` (copy from `.env.example`)
2. Paste your Firebase config values:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyC...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Step 5: Deploy to Netlify

1. Add environment variables to Netlify:
   - Go to your Netlify site dashboard
   - Navigate to **Site settings > Environment variables**
   - Add each `REACT_APP_FIREBASE_*` variable from your `.env` file

2. Redeploy your site (Netlify will auto-deploy from GitHub)

## Step 6: Test Cross-Device Sync

1. Open the app on your PC
2. Add or edit products with images
3. Open the app on your phone (same Netlify URL)
4. You should see the same data automatically!

## How It Works

- Each device gets a unique user ID stored in localStorage
- When you first open the app, it loads data from Firebase
- Any changes (products, favorites, cart) are automatically synced to Firebase
- Real-time updates mean changes appear on other devices within seconds

## Security Notes (Production)

For production use, you should:

1. **Update Firestore Rules** in Firebase Console:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if true; // Change this for authentication
    }
  }
}
```

2. Consider adding Firebase Authentication for user-specific data
3. Set up proper security rules based on authenticated users

## Troubleshooting

**Data not syncing?**
- Check browser console for Firebase errors
- Verify environment variables are set in Netlify
- Make sure Firestore is enabled in test mode

**"Permission denied" errors?**
- Check Firestore security rules are in test mode
- Verify the database was created successfully

**Different data on each device?**
- Clear localStorage on both devices
- Reload the app to get fresh data from Firebase
