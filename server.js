const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github').Strategy;
const swaggerUi = require('swagger-ui-express');
const specs = require('./config/swagger');
const taskRoutes = require('./routes/task');
const userRoutes = require('./routes/user');
require('dotenv').config();

const app = express();

// CORS Configuration
const corsOptions = {
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(session({
    secret: process.env.GITHUB_CLIENT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_REDIRECT_URI
}, (accessToken, refreshToken, profile, done) => {
    // Store user profile in session
    return done(null, profile);
}));

// Serialize/Deserialize user
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Auth Routes
app.get('/auth/github',
    passport.authenticate('github', { scope: ['user:email'] })
);

app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/api-docs');
    }
);

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// Auth Middleware
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
};

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Protected Routes
app.use('/api', isAuthenticated, taskRoutes);
app.use('/api', isAuthenticated, userRoutes);

// Root route
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.send(`Welcome ${req.user.username}! Visit /api-docs for documentation.`);
    } else {
        res.send('Welcome! Please login with GitHub to access the API.');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
});

