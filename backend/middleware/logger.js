const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../data');

// So'rovlarni log qilish middleware
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const user = req.user ? `[${req.user.role}:${req.user.username}]` : '[unauthenticated]';
  const log = `${timestamp} ${user} ${req.method} ${req.originalUrl}`;
  
  console.log(`\x1b[36m${log}\x1b[0m`);
  
  // Response time hisoblash
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 400 ? '\x1b[31m' : '\x1b[32m';
    console.log(`${color}  → ${status} (${duration}ms)\x1b[0m`);
  });

  next();
};

// Xato boshqarish middleware
const errorHandler = (err, req, res, next) => {
  console.error('\x1b[31mError:\x1b[0m', err.message);
  
  const status = err.status || 500;
  const message = err.message || 'Ichki server xatosi';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `${req.method} ${req.originalUrl} — sahifa topilmadi`
  });
};

// Validation helper
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    next();
  };
};

module.exports = { requestLogger, errorHandler, notFound, validate };
