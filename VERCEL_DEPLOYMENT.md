# Vercel Deployment Guide

This guide explains how to deploy the Aura AI Avatar Studio to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Firebase Project**: Must be properly configured (see FIREBASE_SETUP.md)
3. **Firebase Service Account**: Required for backend Firestore access

## Step 1: Get Firebase Service Account Credentials

For the backend to work on Vercel, you need Firebase Admin SDK credentials:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ → **Project settings**
4. Go to **Service accounts** tab
5. Click **Generate new private key**
6. Download the JSON file (keep it secure!)
7. From the JSON file, you'll need:
   - `client_email`
   - `private_key`

## Step 2: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel will auto-detect the configuration from `vercel.json`
4. Add environment variables (see Step 4)
5. Click **Deploy**

### Option B: Deploy via CLI

```bash
vercel
```

Follow the prompts to link your project and deploy.

## Step 4: Configure Environment Variables

In the Vercel Dashboard, go to **Settings** → **Environment Variables** and add:

### Frontend Variables (Required)
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Backend Variables (Required for Firestore)
```
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----
```

**Important**: For `FIREBASE_PRIVATE_KEY`, copy the entire value including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`. The `\n` characters should be preserved.

### Optional Variables
```
VITE_GEMINI_API_KEY=your-gemini-api-key
REPLICATE_API_TOKEN=your-replicate-token
```

## Step 5: Verify Deployment

After deployment:

1. Visit your Vercel deployment URL
2. Check that the homepage loads correctly
3. Try signing up/logging in
4. Test avatar generation
5. Check the Vercel function logs for any errors

## Common Issues

### 404 Errors on API Routes

If you see 404 errors when calling `/api/*` endpoints:
- Check that the `api/index.ts` file exists
- Verify the `vercel.json` rewrites configuration
- Check Vercel function logs for errors

### Firebase Not Connecting

- Verify all environment variables are set correctly
- Check that `FIREBASE_PRIVATE_KEY` includes the full key with newlines
- Ensure the Firebase service account has the correct permissions

### Build Failures

- Run `npm run build` locally to test
- Check for TypeScript errors
- Verify all dependencies are in `package.json`

## Important Notes

1. **Firestore Required**: In-memory storage won't work on Vercel (serverless functions are stateless). You MUST use Firestore.

2. **Cold Starts**: Serverless functions may have cold starts (1-3 seconds delay on first request).

3. **Function Limits**: Vercel has function execution limits (10 seconds on free tier, 60 seconds on pro).

4. **Environment Variables**: Must be set in Vercel dashboard for each deployment (Production, Preview, Development).

## Alternative: Deploy to Replit

If you encounter issues with Vercel's serverless architecture, consider deploying to Replit instead:
- Replit supports long-running servers natively
- No need for serverless function configuration
- Built-in environment variable management
- Automatic HTTPS and domain management

To deploy on Replit, click the **Deploy** button in the Replit workspace.
