# Quick Deployment Guide

## 🚨 Current Issue: Missing Environment Variables

Your deployment is failing because the GitHub OAuth environment variables are not set in Render.

## ✅ Quick Fix Steps:

### 1. **Set Environment Variables in Render Dashboard**

Go to your Render service → Environment tab and add these variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipe-manager
SESSION_SECRET=your-super-secret-session-key-here
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=https://your-app-name.onrender.com/auth/github/callback
```

### 2. **Get GitHub OAuth Credentials**

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Recipe Manager API
   - **Homepage URL**: `https://your-app-name.onrender.com`
   - **Authorization callback URL**: `https://your-app-name.onrender.com/auth/github/callback`
4. Copy the **Client ID** and **Client Secret**

### 3. **Get MongoDB Connection String**

1. Go to MongoDB Atlas
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password

### 4. **Redeploy**

After setting all environment variables:
1. Go to Render dashboard
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for deployment to complete

## 🧪 Test Your Deployment

Once deployed, test these URLs:

- **API Root**: `https://your-app-name.onrender.com/`
- **Swagger Docs**: `https://your-app-name.onrender.com/api-docs`
- **GitHub OAuth**: `https://your-app-name.onrender.com/auth/github`

## 🔧 Troubleshooting

### If OAuth still doesn't work:
1. Double-check the callback URL matches exactly
2. Ensure you're using HTTPS in production
3. Check Render logs for any errors

### If MongoDB connection fails:
1. Verify the connection string is correct
2. Check MongoDB Atlas IP whitelist includes 0.0.0.0/0
3. Ensure database user has proper permissions

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `SESSION_SECRET` | Session encryption key | `your-secret-key-here` |
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID | `Iv1.1234567890abcdef` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Client Secret | `your-client-secret` |
| `GITHUB_CALLBACK_URL` | OAuth callback URL | `https://your-app.onrender.com/auth/github/callback` |
