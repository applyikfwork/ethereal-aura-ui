# Aura AI Avatar Creator - Complete Setup Guide

## 🔧 Step 1: Supabase Database Setup

### 1.1 Run SQL Commands in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `ahbocxzrwnslhgbotrdz`
3. Go to **SQL Editor** (left sidebar)
4. Copy and paste the entire content from `supabase_setup.sql`
5. Click **Run** to execute all commands

This will create:
- ✅ `users` table with credits system
- ✅ `avatars` table with all customization fields
- ✅ Row Level Security (RLS) policies for data protection
- ✅ Indexes for better performance
- ✅ Automatic timestamp updates
- ✅ Helper functions

### 1.2 Set Up Storage Bucket (for Avatar Images)

1. In Supabase Dashboard, go to **Storage** (left sidebar)
2. Click **New Bucket**
3. Name: `avatars`
4. Make it **Public**
5. Click **Create Bucket**

### 1.3 Configure Storage Policies

Go to **Storage** → **Policies** → **New Policy** and add these:

**Policy 1: Public Read Access**
- Policy name: `Avatar images are publicly accessible`
- Allowed operations: SELECT
- Target roles: public
- WITH CHECK expression: `bucket_id = 'avatars'`

**Policy 2: Authenticated Upload**
- Policy name: `Authenticated users can upload avatars`
- Allowed operations: INSERT
- Target roles: authenticated
- WITH CHECK expression: `bucket_id = 'avatars'`

## 🔑 Step 2: Get Your Supabase Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. You'll need these values:

```
Project URL: https://ahbocxzrwnslhgbotrdz.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoYm9jeHpyd25zbGhnYm90cmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0NzUzNTgsImV4cCI6MjA0NjA1MTM1OH0.CQYy-bsEkUbm-7jbRqFphiKI6-Zt0PH_FWHrKTnUWZY
service_role key: (Found in the same page - keep this secret!)
```

## 🔐 Step 3: Configure Replit Secrets

**IMPORTANT:** In Replit, environment variables should be set using the **Secrets** tool, not just the `.env` file.

1. In Replit, click on **Tools** → **Secrets** (🔒 icon in left sidebar)
2. Add these secrets one by one:

### Backend Secrets (Required):
```
SUPABASE_URL = https://ahbocxzrwnslhgbotrdz.supabase.co
SUPABASE_ANON_KEY = [your anon key from Supabase]
SUPABASE_SERVICE_KEY = [your service_role key from Supabase]
GEMINI_API_KEY = [your Google AI Studio API key]
```

### Note about Frontend Variables:
The `.env` file handles frontend variables (with VITE_ prefix). The secrets above are for backend only.

## 🤖 Step 4: Get Google Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Click **Get API Key** or **Create API Key**
3. Copy the API key
4. Add it to Replit Secrets as `GEMINI_API_KEY`


1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Google** provider
3. Follow Supabase's guide to set up Google OAuth:
   - Create OAuth credentials in Google Cloud Console
   - Add authorized redirect URI: `https://ahbocxzrwnslhgbotrdz.supabase.co/auth/v1/callback`
4. Add Client ID and Client Secret to Supabase

## ✅ Step 6: Verify Setup

After completing all steps, your app should have:

- ✅ Database tables created in Supabase
- ✅ Storage bucket for avatar images
- ✅ All secrets configured in Replit
- ✅ Frontend environment variables in `.env`
- ✅ Google Gemini API for AI avatar generation
- ✅ (Optional) Google OAuth for authentication

## 🚀 Step 7: Test the Application

1. The application will restart automatically
2. Visit the Studio page
3. Try creating an avatar
4. Check that it saves to your profile

## 📝 Environment Variables Summary

**Replit Secrets (Backend):**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `GEMINI_API_KEY`

**`.env` File (Frontend):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🔄 Daily Credit Reset (Optional)

To automatically reset free user credits daily:

1. In Supabase Dashboard, go to **Database** → **Functions**
2. Create a new Edge Function or use pg_cron extension
3. Schedule to run: `SELECT reset_daily_credits();` daily at midnight

## 🆘 Troubleshooting

**Issue: "Authentication not configured"**
- Make sure Supabase URL and keys are in Replit Secrets
- Check that `.env` has VITE_ prefixed variables
- Restart the Replit application

**Issue: "Cannot generate avatars"**
- Verify GEMINI_API_KEY is set in Replit Secrets
- Check API key is valid in Google AI Studio
- Check browser console for detailed errors

**Issue: "Cannot save avatars"**
- Verify database tables are created in Supabase
- Check RLS policies are set up correctly
- Make sure user is authenticated

**Issue: Images not uploading**
- Verify storage bucket 'avatars' exists in Supabase
- Check storage policies are configured
- Ensure bucket is set to public

## 📚 Additional Resources

- Supabase Documentation: https://supabase.com/docs
- Google Gemini API: https://ai.google.dev/docs
- Replit Secrets: https://docs.replit.com/programming-ide/workspace-features/secrets
