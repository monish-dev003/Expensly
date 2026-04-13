require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const { startRecurringJob } = require('./jobs/recurringJob');
const errorHandler          = require('./middleware/errorHandler');
const routes                = require('./routes/index');

const app  = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// ── Trust proxy (required for rate limiting behind Render/Heroku/Nginx) ──────
// Without this, req.ip is always the proxy IP, not the real user IP.
if (isProd) app.set('trust proxy', 1);

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'"],  // needed for Vite HMR in dev
      styleSrc:   ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      fontSrc:    ["'self'", 'fonts.gstatic.com'],
      imgSrc:     ["'self'", 'data:', 'https://res.cloudinary.com'],
      connectSrc: ["'self'", 'https://identitytoolkit.googleapis.com', 'https://securetoken.googleapis.com'],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
// In production: only CLIENT_URL is allowed.
// In development: also allow localhost:5173 and localhost:3000.
const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(isProd ? [] : ['http://localhost:5173', 'http://localhost:3000']),
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin "${origin}" not allowed`));
  },
  credentials: true,
}));

// ── Rate limiting ─────────────────────────────────────────────────────────────
// Strict limit for auth routes (login / register / forgot-password)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // max 20 auth attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
  skipSuccessfulRequests: true, // only count failed/errored requests
});

// Generous limit for general API (charts, stats, CRUD all fire on load)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});

app.use('/api/auth', authLimiter);
app.use('/api',      generalLimiter);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── NoSQL injection prevention ────────────────────────────────────────────────
// Strip keys starting with $ or containing . from req.body, req.query, req.params
// This prevents MongoDB operator injection attacks like { "$gt": "" }
app.use((req, _res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    Object.keys(obj).forEach(key => {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    });
  };
  sanitize(req.body);
  sanitize(req.query);
  next();
});

// ── HTTP logging (combined in prod, dev in development) ───────────────────────
app.use(morgan(isProd ? 'combined' : 'dev'));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({
  status: 'ok',
  time:   new Date(),
  env:    process.env.NODE_ENV || 'development',
}));

// ── Error handler ─────────────────────────────────────────────────────────────

// ── Static files (production build) ──────────────────────────────────────────
const path = require('path');
const fs   = require('fs');
const distPath = path.join(__dirname, '../client/dist');

if (fs.existsSync(distPath)) {
  // Serve built React app
  app.use(express.static(distPath));
  // SPA fallback — all non-API routes serve index.html
  // This fixes the "URL refresh = blank page" problem
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ success: false, message: 'Not found' });
    res.sendFile(path.join(distPath, 'index.html'));
  });
}
// ─────────────────────────────────────────────────────────────────────────────

app.use(errorHandler);

// ── DB + Start ────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expensly')
  .then(() => {
    console.log('✅ MongoDB connected');
    startRecurringJob();
    const server = app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
    );

    // ── Graceful shutdown ─────────────────────────────────────────────────────
    const shutdown = (signal) => {
      console.log(`\n${signal} received — shutting down gracefully…`);
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log('✅ DB connection closed. Bye!');
          process.exit(0);
        });
      });
      // Force exit after 10s if graceful shutdown hangs
      setTimeout(() => { console.error('⚠️ Forced exit after timeout'); process.exit(1); }, 10_000);
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));
  })
  .catch(err => { console.error('❌ DB connection error:', err); process.exit(1); });
