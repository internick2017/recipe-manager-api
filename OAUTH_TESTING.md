# OAuth Testing Guide

## 🚨 Important: OAuth Endpoints Cannot Be Tested in Swagger UI

The GitHub OAuth endpoints (`/auth/github` and `/auth/github/callback`) are **redirect-based** and cannot be tested through Swagger UI. This is normal and expected behavior.

## ✅ How to Test OAuth Properly

### **1. Test OAuth in Browser (Recommended)**

#### **Local Testing:**
1. Open your browser
2. Go to: `http://localhost:3000/auth/github`
3. You should be redirected to GitHub for authentication
4. After GitHub login, you'll be redirected back to your app

#### **Production Testing:**
1. Open your browser
2. Go to: `https://your-app-name.onrender.com/auth/github`
3. You should be redirected to GitHub for authentication
4. After GitHub login, you'll be redirected back to your app

### **2. Test OAuth Flow Step by Step**

#### **Step 1: Check OAuth Configuration**
```bash
# Test if OAuth is configured (should return 503 if not configured)
curl -I http://localhost:3000/auth/github
```

#### **Step 2: Test OAuth Redirect**
```bash
# This should return a 302 redirect to GitHub
curl -I http://localhost:3000/auth/github
```

#### **Step 3: Test Protected Routes**
After successful OAuth login, test protected routes:
```bash
# This should work after OAuth login
curl http://localhost:3000/protected
```

### **3. Common OAuth Testing Scenarios**

#### **Scenario A: OAuth Not Configured**
- **Expected**: Returns 503 error with message "GitHub OAuth not configured"
- **Test**: `curl http://localhost:3000/auth/github`

#### **Scenario B: OAuth Configured**
- **Expected**: Redirects to GitHub (302 status)
- **Test**: Open in browser: `http://localhost:3000/auth/github`

#### **Scenario C: OAuth Callback**
- **Expected**: GitHub redirects back to your app
- **Test**: Complete OAuth flow in browser

## 🔧 Troubleshooting OAuth Issues

### **Issue 1: "Failed to fetch" in Swagger UI**
- **Cause**: Swagger UI cannot handle redirects
- **Solution**: Test OAuth in browser, not Swagger UI

### **Issue 2: "GitHub OAuth not configured"**
- **Cause**: Missing environment variables
- **Solution**: Set `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `GITHUB_CALLBACK_URL`

### **Issue 3: OAuth redirects to wrong URL**
- **Cause**: Incorrect callback URL in GitHub OAuth app
- **Solution**: Update GitHub OAuth app settings

### **Issue 4: CORS errors**
- **Cause**: OAuth endpoints are redirect-based, not API endpoints
- **Solution**: Test in browser, not through API testing tools

## 📋 OAuth Testing Checklist

### **Before Testing:**
- [ ] Environment variables are set
- [ ] GitHub OAuth app is configured
- [ ] Callback URL matches your app URL

### **Testing Steps:**
- [ ] Test OAuth endpoint returns 302 redirect (not 503 error)
- [ ] OAuth flow completes successfully in browser
- [ ] Protected routes work after authentication
- [ ] Logout functionality works

### **Expected Results:**
- [ ] `/auth/github` → Redirects to GitHub
- [ ] GitHub login → Redirects back to `/protected`
- [ ] `/protected` → Returns user info (when authenticated)
- [ ] `/logout` → Clears session and redirects to home

## 🎯 For Your Video Demonstration

When recording your video, show:

1. **OAuth Configuration Check**: Show environment variables are set
2. **Browser OAuth Flow**: 
   - Go to `/auth/github` in browser
   - Show GitHub login page
   - Show successful redirect back to your app
3. **Protected Route Access**: Show `/protected` endpoint working
4. **Database Updates**: Show user data being stored/retrieved

**Do NOT** try to test OAuth endpoints in Swagger UI - this will always fail and is not the intended way to test OAuth flows.
