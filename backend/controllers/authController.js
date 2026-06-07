const bcrypt = require('bcryptjs');
const { readDB, writeDB } = require('../utils/db');
const { generateToken } = require('../middleware/auth');

// Kirish (Login)
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Foydalanuvchi nomi va parol talab etiladi'
      });
    }

    const db = readDB();
    const user = db.users.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    // Demo: oddiy parol tekshirish (real loyihada bcrypt ishlatiladi)
    const validPasswords = {
      'admin': 'admin123',
      'clinician': 'clinic123',
      'receptionist': 'recep123'
    };

    const isValid = password === validPasswords[username];

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Noto\'g\'ri parol'
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Tizimga muvaffaqiyatli kirdingiz',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Foydalanuvchi ma'lumotlari
const getMe = (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

// Chiqish (Logout) — client side token o'chiradi, server blacklist qaytaradi
const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Tizimdan muvaffaqiyatli chiqdingiz'
  });
};

// Dashboard statistika
const getDashboardStats = (req, res) => {
  try {
    const db = readDB();
    
    const stats = {
      totalDoctors: db.doctors.length,
      activeDoctors: db.doctors.filter(d => d.status === 'active').length,
      totalPatients: db.patients.length,
      activePatients: db.patients.filter(p => p.status === 'active').length,
      totalIllnesses: db.illnesses.length,
      ongoingIllnesses: db.illnesses.filter(i => i.status === 'ongoing').length,
      criticalCases: db.illnesses.filter(i => i.severity === 'critical').length,
      resolvedCases: db.illnesses.filter(i => i.status === 'resolved').length,
      departmentStats: {},
      severityBreakdown: {
        low: db.illnesses.filter(i => i.severity === 'low').length,
        medium: db.illnesses.filter(i => i.severity === 'medium').length,
        high: db.illnesses.filter(i => i.severity === 'high').length,
        critical: db.illnesses.filter(i => i.severity === 'critical').length
      },
      recentActivity: {
        newPatients: db.patients.filter(p => {
          const created = new Date(p.createdAt);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return created > weekAgo;
        }).length,
        newIllnesses: db.illnesses.filter(i => {
          const created = new Date(i.createdAt);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return created > weekAgo;
        }).length
      }
    };

    // Bo'limlar bo'yicha statistika
    db.doctors.forEach(doctor => {
      const dept = doctor.department;
      if (!stats.departmentStats[dept]) {
        stats.departmentStats[dept] = { doctors: 0, patients: 0 };
      }
      stats.departmentStats[dept].doctors++;
      
      const patients = db.patients.filter(p => p.doctorId === doctor.id);
      stats.departmentStats[dept].patients += patients.length;
    });

    res.json({
      success: true,
      data: stats
    });

  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({
      success: false,
      message: 'Statistikani yuklashda xato'
    });
  }
};

module.exports = { login, getMe, logout, getDashboardStats };
