# Google OAuth Setup Guide

This guide will walk you through obtaining Google OAuth credentials for your application.

---

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

---

## Step 1: Access Google Cloud Console

1. Open your browser and go to **https://console.cloud.google.com/**
2. Sign in with your Google account

---

## Step 2: Create a New Project (or Select Existing)

### Option A: Create New Project

1. Click the **project dropdown** at the top of the page (next to "Google Cloud")
2. Click **"NEW PROJECT"** in the top-right of the dialog
3. Enter a **Project name** (e.g., "MNG Backend" or "My App")
4. Leave **Organization** as "No organization" (unless you have one)
5. Click **"CREATE"**
6. Wait for the project to be created (~30 seconds)
7. Select your new project from the dropdown

### Option B: Use Existing Project

1. Click the **project dropdown** at the top
2. Select your existing project

---

## Step 3: Enable Required APIs

1. In the left sidebar, click **"APIs & Services"** → **"Enabled APIs & services"**
2. Click **"+ ENABLE APIS AND SERVICES"** at the top
3. Search for **"Google+ API"** or **"People API"**
4. Click on it in the results
5. Click **"ENABLE"**
6. Wait for the API to be enabled

> **Note:** Google+ API is deprecated but still works for OAuth. Alternatively, you can use the People API.

---

## Step 4: Configure OAuth Consent Screen

1. In the left sidebar, click **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **User Type**:
   - **Internal**: Only for Google Workspace users (if you have one)
   - **External**: For any Google user (recommended)
3. Click **"CREATE"**

### Fill Out App Information

**App information:**

- **App name**: Your application name (e.g., "MNG Backend")
- **User support email**: Your email address (dropdown)
- **App logo**: (Optional) Skip for now

**App domain:**

- **Application home page**: (Optional) Your website URL or skip
- **Application privacy policy link**: (Optional) Skip for now
- **Application terms of service link**: (Optional) Skip for now

**Authorized domains:**

- Add your production domain if you have one (e.g., `yourdomain.com`)
- For local development, you can skip this

**Developer contact information:**

- **Email addresses**: Your email address

4. Click **"SAVE AND CONTINUE"**

### Configure Scopes

1. Click **"ADD OR REMOVE SCOPES"**
2. Select these scopes:
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`
   - ✅ `openid`
3. Click **"UPDATE"**
4. Click **"SAVE AND CONTINUE"**

### Test Users (Only for External + Testing mode)

1. Click **"+ ADD USERS"**
2. Add your email address (and any testers)
3. Click **"ADD"**
4. Click **"SAVE AND CONTINUE"**

### Summary

1. Review your settings
2. Click **"BACK TO DASHBOARD"**

---

## Step 5: Create OAuth 2.0 Credentials

1. In the left sidebar, click **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**

### Configure OAuth Client

1. **Application type**: Select **"Web application"**

2. **Name**: Enter a name (e.g., "MNG Backend Web Client")

3. **Authorized JavaScript origins** (Optional):
   - Click **"+ ADD URI"**
   - Add `http://localhost:3000` (for development)
   - Add your production URL if you have one (e.g., `https://yourdomain.com`)

4. **Authorized redirect URIs** (Required):
   - Click **"+ ADD URI"**
   - Add: `http://localhost:3000/auth/google/callback`
   - For production, also add: `https://yourdomain.com/auth/google/callback`

5. Click **"CREATE"**

---

## Step 6: Copy Your Credentials

A dialog will appear with your credentials:

1. **Client ID**: Copy this (looks like `123456789-abc123.apps.googleusercontent.com`)
2. **Client Secret**: Copy this (looks like `GOCSPX-abc123def456`)

You can also:

- Click **"DOWNLOAD JSON"** to save the credentials
- Or find them later in the Credentials page

---

## Step 7: Add Credentials to Your `.env` File

1. Open your project's `.env` file
2. Update the following lines:

```bash
GOOGLE_CLIENT_ID=paste-your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

3. Save the file

---

## Step 8: Test Your Setup

1. Start your server:

   ```bash
   bun run dev
   ```

2. Open your browser and go to:

   ```
   http://localhost:3000/docs
   ```

3. Find the **Auth** section and test the `/auth/google` endpoint

4. You should be redirected to Google's login page

---

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem**: The redirect URI in your request doesn't match what's configured in Google Cloud Console.

**Solution**:

1. Go to Google Cloud Console → Credentials
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", make sure you have exactly:
   ```
   http://localhost:3000/auth/google/callback
   ```
4. Click **"SAVE"**
5. Wait 5 minutes for changes to propagate
6. Try again

### Error: "Access blocked: This app's request is invalid"

**Problem**: OAuth consent screen is not properly configured.

**Solution**:

1. Go to "OAuth consent screen"
2. Make sure the app is in "Testing" mode (if External)
3. Add your email to "Test users"
4. Try again

### Error: "Google hasn't verified this app"

**Problem**: Your app is in "Testing" mode.

**Solution**:

- This is normal for development
- Click **"Advanced"** → **"Go to [Your App] (unsafe)"**
- For production, you need to submit your app for verification

### Error: "Missing Google OAuth configuration"

**Problem**: Environment variables are not loaded.

**Solution**:

1. Make sure your `.env` file is in the project root
2. Restart your development server
3. Check that Bun is loading `.env` files automatically

---

## Production Deployment

When deploying to production:

1. **Update Redirect URI**:

   ```bash
   GOOGLE_REDIRECT_URI=https://api.yourdomain.com/auth/google/callback
   ```

2. **Add Production Redirect to Google Cloud Console**:
   - Go to Credentials → Your OAuth Client
   - Add: `https://api.yourdomain.com/auth/google/callback`
   - Save

3. **Publish OAuth Consent Screen** (for public apps):
   - Go to "OAuth consent screen"
   - Click **"PUBLISH APP"**
   - Submit for verification (required if you need >100 users)

4. **Use Environment Variables** (don't commit secrets):
   - Set `GOOGLE_CLIENT_ID` in your hosting platform
   - Set `GOOGLE_CLIENT_SECRET` in your hosting platform
   - Set `GOOGLE_REDIRECT_URI` in your hosting platform

---

## Security Best Practices

✅ **Never commit** `.env` file to version control  
✅ **Never share** your Client Secret publicly  
✅ **Use HTTPS** in production  
✅ **Rotate credentials** if they're ever exposed  
✅ **Limit scopes** to only what you need  
✅ **Monitor usage** in Google Cloud Console

---

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OAuth Consent Screen Guide](https://support.google.com/cloud/answer/10311615)
- [OAuth Client Setup](https://developers.google.com/identity/protocols/oauth2/web-server#creatingcred)

---

## Need Help?

If you encounter issues not covered here:

1. Check the [Google Cloud Console Help](https://cloud.google.com/support)
2. Review error messages in your browser console
3. Check server logs for detailed error information
4. Verify all URIs exactly match (including protocol, port, and path)

---

**Last Updated**: January 19, 2026  
**Compatible with**: Google Cloud Console (current version)
