
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
const cookieParser = require('cookie-parser');
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
app.use(cookieParser());

let sessionStore = undefined;

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


app.use(passport.initialize());
app.use(passport.session());

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && process.env.GITHUB_CALLBACK_URL) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  }, function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }));
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

    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && process.env.GITHUB_CALLBACK_URL) {
      app.get('/auth/github', passport.authenticate('github', { scope: [ 'user:email' ] }));

      app.get('/auth/github/callback',
        passport.authenticate('github', { failureRedirect: '/?error=oauth_failed' }),
        (req, res) => {
          const userData = {
            id: req.user.id,
            username: req.user.username || req.user.login,
            displayName: req.user.displayName,
            emails: req.user.emails,
            provider: 'github'
          };
          
          const token = jwt.sign(userData, process.env.SESSION_SECRET || 'default_secret', { expiresIn: '24h' });
          
          res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'lax'
          });
          
          res.redirect('/protected');
        }
      );
    } else {
      app.get('/auth/github', (req, res) => {
        res.status(503).json({ error: 'GitHub OAuth not configured' });
      });

      app.get('/auth/github/callback', (req, res) => {
        res.status(503).json({ error: 'GitHub OAuth not configured' });
      });
    }

    app.get('/logout', (req, res) => {
      res.clearCookie('auth_token');
      res.redirect('/');
    });

    function ensureAuthenticated(req, res, next) {
      try {
        const token = req.cookies.auth_token;
        
        if (!token) {
          return res.status(401).json({ 
            error: 'Unauthorized - No authentication token'
          });
        }
        
        const decoded = jwt.verify(token, process.env.SESSION_SECRET || 'default_secret');
        req.user = decoded;
        return next();
      } catch (err) {
        return res.status(401).json({ 
          error: 'Unauthorized - Invalid token'
        });
      }
    }

    app.get('/protected', ensureAuthenticated, (req, res) => {
      res.json({ message: 'You are authenticated!', user: req.user });
    });
    
    
    
    
    app.get('/', (req, res) => {
      res.json({ message: 'Recipe Manager API', version: '1.0.0' });
    });

    app.use((err, req, res, next) => {
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message
      });
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
