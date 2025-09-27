
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-static.json');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://recipe-manager-api-tlmf.onrender.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// DISABLE MongoDB session store temporarily - use memory store
let sessionStore = undefined; // Force memory store for debugging
console.log('Using memory store for sessions (debugging)');

app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: true,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax',
    domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
  }
}));

// Debug middleware to log session on every request
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url} - Session ID: ${req.sessionID}`);
  console.log('Session data:', req.session);
  console.log('Session keys:', Object.keys(req.session));
  next();
});

app.use(passport.initialize());
app.use(passport.session());

// Only configure GitHub OAuth if environment variables are present
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && process.env.GITHUB_CALLBACK_URL) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  }, function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }));
} else {
  console.warn('GitHub OAuth not configured - missing environment variables');
}

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

async function start() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set. Exiting.');
    process.exit(1);
  }
  try {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();
    const dbName = (new URL(uri.replace('mongodb+srv://', 'http://'))).pathname.replace('/', '') || 'recipe-manager';
    const db = client.db(dbName || 'recipe-manager');
    app.locals.db = db;
    console.log('Connected to MongoDB');

    // Dynamic Swagger configuration
    const swaggerConfig = {
      ...swaggerDocument,
      host: process.env.NODE_ENV === 'production' 
        ? 'recipe-manager-api-tlmf.onrender.com'
        : 'localhost:3000',
      schemes: process.env.NODE_ENV === 'production' 
        ? ['https'] 
        : ['http']
    };
    
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig));

    app.use('/recipes', require('./routes/recipes'));
    app.use('/users', require('./routes/users'));

    // OAuth routes - only available if GitHub OAuth is configured
    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && process.env.GITHUB_CALLBACK_URL) {
      app.get('/auth/github', passport.authenticate('github', { scope: [ 'user:email' ] }));

      // OAuth callback with JWT token approach
      app.get('/auth/github/callback',
        passport.authenticate('github', { failureRedirect: '/?error=oauth_failed' }),
        (req, res) => {
          console.log('=== OAUTH CALLBACK SUCCESS ===');
          console.log('User from GitHub:', req.user);
          
          // Create JWT token
          const userData = {
            id: req.user.id,
            username: req.user.username || req.user.login,
            displayName: req.user.displayName,
            emails: req.user.emails,
            provider: 'github'
          };
          
          const token = jwt.sign(userData, process.env.SESSION_SECRET || 'default_secret', { expiresIn: '24h' });
          
          console.log('JWT token created for user:', userData);
          
          // Set token in cookie and redirect
          res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'lax'
          });
          
          res.redirect('/protected');
        }
      );
    } else {
      // Fallback routes when OAuth is not configured
      app.get('/auth/github', (req, res) => {
        res.status(503).json({ error: 'GitHub OAuth not configured' });
      });
      
      app.get('/auth/github/callback', (req, res) => {
        res.status(503).json({ error: 'GitHub OAuth not configured' });
      });
    }

    app.get('/logout', (req, res) => {
      console.log('Logout requested');
      // Clear the auth token cookie
      res.clearCookie('auth_token');
      console.log('Auth token cleared, redirecting to home');
      res.redirect('/');
    });

    function ensureAuthenticated(req, res, next) {
      console.log('Auth check - cookies:', req.cookies);
      console.log('Auth check - auth_token:', req.cookies.auth_token);
      
      // Check JWT token from cookie
      const token = req.cookies.auth_token;
      
      if (!token) {
        console.log('No auth token found');
        return res.status(401).json({ 
          error: 'Unauthorized - No authentication token',
          debug: {
            hasToken: false,
            cookies: Object.keys(req.cookies)
          }
        });
      }
      
      try {
        const decoded = jwt.verify(token, process.env.SESSION_SECRET || 'default_secret');
        req.user = decoded;
        console.log('Authentication successful via JWT:', decoded);
        return next();
      } catch (err) {
        console.log('JWT verification failed:', err.message);
        return res.status(401).json({ 
          error: 'Unauthorized - Invalid token',
          debug: {
            hasToken: true,
            tokenError: err.message
          }
        });
      }
    }

    app.get('/protected', ensureAuthenticated, (req, res) => {
      res.json({ message: 'You are authenticated!', user: req.user });
    });
    
    // Debug endpoint to check session status
    app.get('/debug/session', (req, res) => {
      res.json({
        sessionId: req.sessionID,
        session: req.session,
        sessionUser: req.session.user,
        sessionAuth: req.session.isAuthenticated,
        sessionKeys: Object.keys(req.session),
        cookies: req.cookies
      });
    });
    
    // Test endpoint to manually set session (for testing)
    app.get('/test/auth', (req, res) => {
      req.session.user = {
        id: 'test123',
        username: 'testuser',
        displayName: 'Test User',
        provider: 'test'
      };
      req.session.isAuthenticated = true;
      req.session.save((err) => {
        if (err) {
          return res.json({ error: 'Session save failed', err });
        }
        res.json({ message: 'Test authentication set', user: req.session.user });
      });
    });
    
    // JWT token test endpoint
    app.get('/test/jwt', (req, res) => {
      console.log('=== JWT TEST START ===');
      
      const userData = {
        id: 'test123',
        username: 'testuser',
        displayName: 'Test User',
        provider: 'test'
      };
      
      const token = jwt.sign(userData, process.env.SESSION_SECRET || 'default_secret', { expiresIn: '24h' });
      
      console.log('JWT token created:', token);
      
      // Set token in cookie
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax'
      });
      
      console.log('Cookie set, redirecting to protected');
      console.log('=== JWT TEST END ===');
      res.redirect('/protected');
    });
    
    // Test without redirect to see if session persists
    app.get('/test/direct', (req, res) => {
      req.session.user = {
        id: 'direct123',
        username: 'directuser',
        displayName: 'Direct User',
        provider: 'direct'
      };
      req.session.isAuthenticated = true;
      
      req.session.save((err) => {
        if (err) {
          return res.json({ error: 'Session save failed', err: err.message });
        }
        // Return session data instead of redirecting
        res.json({
          message: 'Session set directly',
          sessionId: req.sessionID,
          sessionData: req.session,
          sessionKeys: Object.keys(req.session)
        });
      });
    });
    
    // Test OAuth simulation without redirect
    app.get('/test/oauth-sim', (req, res) => {
      // Simulate OAuth callback
      req.session.user = {
        id: 'github123',
        username: 'githubuser',
        displayName: 'GitHub User',
        provider: 'github'
      };
      req.session.isAuthenticated = true;
      
      req.session.save((err) => {
        if (err) {
          return res.json({ error: 'Session save failed', err: err.message });
        }
        
        // Instead of redirecting, return the protected data directly
        res.json({
          message: 'OAuth simulation successful',
          user: req.user,
          sessionId: req.sessionID,
          sessionData: req.session,
          protectedData: {
            message: 'You are authenticated!',
            user: req.user
          }
        });
      });
    });
    
    // Test endpoint to check if OAuth callback is working
    app.get('/test/oauth', (req, res) => {
      res.json({
        message: 'OAuth test endpoint',
        hasClientId: !!process.env.GITHUB_CLIENT_ID,
        hasClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
        hasCallbackUrl: !!process.env.GITHUB_CALLBACK_URL,
        clientId: process.env.GITHUB_CLIENT_ID,
        callbackUrl: process.env.GITHUB_CALLBACK_URL
      });
    });
    
    // Test endpoint to check session persistence
    app.get('/test/session', (req, res) => {
      const testKey = 'testValue';
      const testValue = `test-${Date.now()}`;
      
      // Set a test value in session
      req.session[testKey] = testValue;
      req.session.save((err) => {
        if (err) {
          return res.json({ error: 'Session save failed', err: err.message });
        }
        res.json({
          message: 'Session test',
          sessionId: req.sessionID,
          testValue: req.session[testKey],
          sessionKeys: Object.keys(req.session),
          sessionStore: sessionStore ? 'MongoDB' : 'Memory'
        });
      });
    });
    
    app.get('/', (req, res) => {
      res.json({ message: 'Recipe Manager API', version: '1.0.0' });
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
