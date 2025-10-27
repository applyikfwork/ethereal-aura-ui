# Firebase Setup Guide

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

## Step 2: Enable Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click "Get Started"
3. Enable the following sign-in methods:
   - **Email/Password**: Enable this
   - **Google**: Enable this (optional but recommended)

## Step 3: Create Firestore Database

1. Go to **Build** → **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** for development
4. Select a location closest to your users
5. Click "Enable"

## Step 4: Set Up Storage

1. Go to **Build** → **Storage**
2. Click "Get started"
3. Start in **test mode**
4. Click "Done"

## Step 5: Get Your Firebase Config

1. In Firebase Console, click the gear icon ⚙️ → **Project settings**
2. Scroll down to "Your apps"
3. Click the web icon `</>` to add a web app
4. Register your app with a nickname (e.g., "Aura Avatar Studio")
5. Copy the `firebaseConfig` object

## Step 6: Configure Environment Variables

1. Create a `.env` file in the root directory (copy from `.env.example`)
2. Fill in your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Step 7: Update Firestore Security Rules

For development, you can use these rules (update for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Admin settings - only admins can write
    match /settings/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Avatars collection
    match /avatars/{avatarId} {
      allow read: if true; // Public gallery
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

## Step 8: Update Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Admin files
    match /admin/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // User avatars
    match /avatars/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 9: Get Gemini API Key (Optional)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key
5. After logging into the app as admin, go to Admin Panel and paste the key

## Step 10: Admin Access

The admin account is hardcoded as: **xyzapplywork@gmail.com**

To access admin features:
1. Sign up with this exact email address
2. Once logged in, you'll see the "Admin Panel" option in the user menu
3. Configure the Gemini API key and other settings

## Troubleshooting

### Authentication not working
- Check that you've enabled Email/Password in Firebase Console
- Verify environment variables are set correctly
- Clear browser cache and try again

### Database permission denied
- Update Firestore security rules as shown above
- Ensure user is authenticated

### Images not uploading
- Check Storage rules
- Verify user authentication
- Check file size limits (default max: 5MB)

## Production Deployment

Before deploying to production:

1. **Update Security Rules**: Switch from test mode to production rules
2. **Environment Variables**: Set up production environment variables in your hosting platform
3. **Enable reCAPTCHA**: Configure reCAPTCHA in Firebase Console for better security
4. **Set up Budget Alerts**: Configure billing alerts in Google Cloud Console
