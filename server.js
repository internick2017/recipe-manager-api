
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
  resave: true, // Changed to true to force session save
  saveUninitialized: true,
  store: sessionStore,
  cookie: {
    secure: false, // Temporarily disable secure for debugging
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
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

      // Simplified OAuth callback for debugging
      app.get('/auth/github/callback', (req, res, next) => {
        console.log('=== OAUTH CALLBACK REACHED ===');
        passport.authenticate('github', (err, user, info) => {
          console.log('Passport authenticate result:');
          console.log('- Error:', err);
          console.log('- User:', user);
          console.log('- Info:', info);
          
          if (err) {
            console.error('OAuth error:', err);
            return res.redirect('/?error=oauth_error');
          }
          
          if (!user) {
            console.error('No user returned from GitHub');
            return res.redirect('/?error=no_user');
          }
          
          // Manually set session data
          req.session.user = {
            id: user.id,
            username: user.username || user.login,
            displayName: user.displayName,
            emails: user.emails,
            provider: 'github'
          };
          req.session.isAuthenticated = true;
          req.session.authenticatedAt = new Date().toISOString();
          
          console.log('Session data set:', req.session);
          
          // Save session explicitly
          req.session.save((saveErr) => {
            if (saveErr) {
              console.error('Session save error:', saveErr);
              return res.redirect('/?error=session_save_failed');
            }
            console.log('Session saved, redirecting to protected');
            res.redirect('/protected');
          });
        })(req, res, next);
      });
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
      req.logout(() => {
        res.redirect('/');
      });
    });

    function ensureAuthenticated(req, res, next) {
      console.log('Auth check - session user:', req.session.user);
      console.log('Auth check - session isAuthenticated:', req.session.isAuthenticated);
      console.log('Auth check - session ID:', req.sessionID);
      
      // Check session-based authentication
      if (req.session.isAuthenticated && req.session.user) {
        // Set user for the request
        req.user = req.session.user;
        console.log('Authentication successful via session');
        return next();
      }
      
      console.log('Authentication failed - no valid session');
      res.status(401).json({ 
        error: 'Unauthorized', 
        debug: {
          sessionId: req.sessionID,
          sessionUser: !!req.session.user,
          sessionAuth: req.session.isAuthenticated,
          sessionKeys: Object.keys(req.session)
        }
      });
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
    
    // Simple bypass for OAuth testing
    app.get('/test/bypass', (req, res) => {
      console.log('=== BYPASS TEST START ===');
      console.log('Session before:', req.session);
      
      req.session.user = {
        id: 'github123',
        username: 'githubuser',
        displayName: 'GitHub User',
        provider: 'github'
      };
      req.session.isAuthenticated = true;
      
      console.log('Session after setting data:', req.session);
      
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.json({ error: 'Session save failed', err: err.message });
        }
        console.log('Session saved successfully, redirecting...');
        console.log('=== BYPASS TEST END ===');
        res.redirect('/protected');
      });
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
