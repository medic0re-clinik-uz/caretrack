const jwt = require('jsonwebtoken');
const { readDB } = require('../utils/db');

const JWT_SECRET = process.env.JWT_SECRET || 'caretrack-secret-key-2024-medicore';

// Token tekshirish middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Kirish rad etildi: Token topilmadi'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token muddati tugagan, qayta kiring'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Noto\'g\'ri token'
    });
  }
};

// Rol tekshirish middleware factory
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autentifikatsiya talab etiladi'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Bu amal uchun ruxsat yo'q. Kerakli rollar: ${roles.join(', ')}`
      });
    }
    next();
  };
};

// Admin yoki klinitsist
const adminOrClinician = authorize('admin', 'clinician');

// Faqat admin
const adminOnly = authorize('admin');

// Barcha autentifikatsiya qilingan foydalanuvchilar
const allRoles = authorize('admin', 'clinician', 'receptionist');

// Token yaratish
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  authenticate,
  authorize,
  adminOrClinician,
  adminOnly,
  allRoles,
  generateToken,
  JWT_SECRET
};
