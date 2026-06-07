const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const routes = require('./routes/index');
const { errorHandler, notFound } = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── SECURITY MIDDLEWARE ──────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:5000'];

app.use(cors({
  origin: function(origin, callback) {
    // Render va boshqa hostlar uchun - origin bo'lmasa ham ruxsat (server-side)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Production'da ham ochiq (kerak bo'lsa cheklash mumkin)
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ─── BODY PARSER ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── HTTP LOGGER ──────────────────────────────────────────────────────────────
app.use(morgan('dev'));

// ─── STATIC FILES ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.use('/api', routes);

// ─── API HEALTH CHECK ─────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CareTrack API ishlayapti',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ─── FRONTEND SPA FALLBACK ────────────────────────────────────────────────────
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  }
});

// ─── ERROR HANDLERS ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── START SERVER ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║           CareTrack Clinic - TYBT Server              ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  Server: http://localhost:${PORT}                        ║`);
  console.log(`║  API:    http://localhost:${PORT}/api                    ║`);
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log('║  Kirish ma\'lumotlari:                                  ║');
  console.log('║  admin/admin123 | clinician/clinic123                 ║');
  console.log('║  receptionist/recep123                                ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('\n');
});

module.exports = app;
