# Deployment Checklist

## Pre-Deployment Setup

### 1. GitHub Repository
- [ ] Initialize git repository
- [ ] Add all files to git
- [ ] Commit with message "Initial commit - Recipe Manager API"
- [ ] Push to GitHub
- [ ] Verify no sensitive data in repository

### 2. MongoDB Atlas
- [ ] Create MongoDB Atlas account
- [ ] Create cluster
- [ ] Create database user
- [ ] Get connection string
- [ ] Whitelist IP addresses (0.0.0.0/0 for Render)

### 3. GitHub OAuth App
- [ ] Go to GitHub Settings → Developer settings → OAuth Apps
- [ ] Create new OAuth App
- [ ] Set Application name: "Recipe Manager API"
- [ ] Set Homepage URL: `https://your-app-name.onrender.com`
- [ ] Set Authorization callback URL: `https://your-app-name.onrender.com/auth/github/callback`
- [ ] Copy Client ID and Client Secret

## Render Deployment

### 1. Create Render Service
- [ ] Go to render.com
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Choose repository

### 2. Configure Service
- [ ] Name: `recipe-manager-api`
- [ ] Environment: `Node`
- [ ] Region: Choose closest to you
- [ ] Branch: `main`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`

### 3. Environment Variables
Add these in Render dashboard:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipe-manager
SESSION_SECRET=your-super-secret-session-key-here
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=https://your-app-name.onrender.com/auth/github/callback
```

### 4. Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for deployment to complete
- [ ] Check logs for any errors
- [ ] Test the deployed URL

## Post-Deployment Testing

### 1. Basic Functionality
- [ ] Visit your app URL
- [ ] Check API root endpoint
- [ ] Test Swagger documentation
- [ ] Verify MongoDB connection

### 2. OAuth Testing
- [ ] Test GitHub OAuth login
- [ ] Verify callback URL works
- [ ] Test protected routes
- [ ] Test logout functionality

### 3. API Testing
- [ ] Test all CRUD operations
- [ ] Verify data validation
- [ ] Check error handling
- [ ] Test with production test file

## Troubleshooting

### Common Issues:
1. **MongoDB Connection Failed**
   - Check connection string
   - Verify IP whitelist includes 0.0.0.0/0
   - Check database user permissions

2. **OAuth Not Working**
   - Verify callback URL matches exactly
   - Check GitHub OAuth app settings
   - Ensure HTTPS is used in production

3. **Session Issues**
   - Check SESSION_SECRET is set
   - Verify cookie settings for production

4. **CORS Errors**
   - Update CORS origin in server.js
   - Check if credentials are enabled

### Testing Commands:
```bash
# Test locally
npm start

# Test production endpoints
curl https://your-app-name.onrender.com/

# Test OAuth flow
curl https://your-app-name.onrender.com/auth/github
```
