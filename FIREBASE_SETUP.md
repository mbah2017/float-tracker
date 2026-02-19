# Firebase Setup & Deployment Guide

This document outlines the steps to correctly configure Firebase and deploy the application to Vercel.

## 1. Firebase Configuration

### Authentication
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. Navigate to **Authentication** > **Sign-in method**.
4. Enable **Email/Password**.

### Firestore Database
1. Navigate to **Firestore Database**.
2. Click **Create database**.
3. Use the following **Security Rules**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner');
    }
    
    // Business data
    match /businesses/{rootId}/{document=**} {
      allow read: if request.auth != null && (request.auth.uid == rootId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.masterId == rootId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner');
      allow write: if request.auth != null && (request.auth.uid == rootId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.masterId == rootId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner');
    }
  }
}
```

### Firebase Storage
1. Navigate to **Storage**.
2. Click **Get Started**.
3. Use the following **Security Rules**:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 2. Deployment to Vercel

1. Push your code to a GitHub repository.
2. Import the project into [Vercel](https://vercel.com/).
3. Configure the following **Environment Variables** in the Vercel project settings:

| Variable Name | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Your Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Your Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Your Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Your Firebase App ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Your Firebase Measurement ID |

cat .env
VITE_FIREBASE_API_KEY=AIzaSyBXZvD8rqK5KoL4nkUXADJGFw8h0qnLV4s
VITE_FIREBASE_AUTH_DOMAIN=float-manager-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=float-manager-app
VITE_FIREBASE_STORAGE_BUCKET=float-manager-app.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=501141071545
VITE_FIREBASE_APP_ID=1:501141071545:web:aebf4a332f4f9ab9b15d68
VITE_FIREBASE_MEASUREMENT_ID=G-Q784KZ7HGY

4. Click **Deploy**.

## 3. Global Accessibility

Once deployed, your app will be accessible at the Vercel-provided URL (e.g., `https://float-tracker.vercel.app`).

**Important Note:** The application now uses real-time synchronization. Changes made by operators will reflect instantly on the master agent's dashboard across the globe.




## Existing Firebase rule - From Firebase
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}