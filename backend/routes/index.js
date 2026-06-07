const express = require('express');
const router = express.Router();

const { login, getMe, logout, getDashboardStats } = require('../controllers/authController');
const { getAllDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor } = require('../controllers/doctorController');
const { getAllPatients, getPatientById, createPatient, updatePatient, deletePatient } = require('../controllers/patientController');
const { getAllIllnesses, getIllnessById, createIllness, updateIllness, deleteIllness } = require('../controllers/illnessController');
const { authenticate, adminOnly, adminOrClinician, allRoles } = require('../middleware/auth');

// ─── AUTH ROUTES ─────────────────────────────────────────────────────────────
router.post('/auth/login', login);
router.get('/auth/me', authenticate, getMe);
router.post('/auth/logout', authenticate, logout);

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
router.get('/dashboard/stats', authenticate, allRoles, getDashboardStats);

// ─── DOCTOR ROUTES ────────────────────────────────────────────────────────────
// Admin: to'liq CRUD | Clinician: faqat ko'rish | Receptionist: faqat ko'rish
router.get('/doctors', authenticate, allRoles, getAllDoctors);
router.get('/doctors/:id', authenticate, allRoles, getDoctorById);
router.post('/doctors', authenticate, adminOnly, createDoctor);
router.put('/doctors/:id', authenticate, adminOnly, updateDoctor);
router.delete('/doctors/:id', authenticate, adminOnly, deleteDoctor);

// ─── PATIENT ROUTES ───────────────────────────────────────────────────────────
// Admin: to'liq CRUD | Clinician: ko'rish + yangilash | Receptionist: yaratish + ko'rish
router.get('/patients', authenticate, allRoles, getAllPatients);
router.get('/patients/:id', authenticate, allRoles, getPatientById);
router.post('/patients', authenticate, allRoles, createPatient);
router.put('/patients/:id', authenticate, adminOrClinician, updatePatient);
router.delete('/patients/:id', authenticate, adminOnly, deletePatient);

// ─── ILLNESS ROUTES ───────────────────────────────────────────────────────────
// Admin: to'liq CRUD | Clinician: ko'rish + yaratish + yangilash | Receptionist: faqat ko'rish
router.get('/illnesses', authenticate, allRoles, getAllIllnesses);
router.get('/illnesses/:id', authenticate, allRoles, getIllnessById);
router.post('/illnesses', authenticate, adminOrClinician, createIllness);
router.put('/illnesses/:id', authenticate, adminOrClinician, updateIllness);
router.delete('/illnesses/:id', authenticate, adminOnly, deleteIllness);

// ─── GLOBAL SEARCH ────────────────────────────────────────────────────────────
router.get('/search', authenticate, allRoles, (req, res) => {
  const { readDB } = require('../utils/db');
  const db = readDB();
  const q = (req.query.q || '').toLowerCase();

  if (!q || q.length < 2) {
    return res.json({ success: true, results: { doctors: [], patients: [], illnesses: [] } });
  }

  const doctors = db.doctors.filter(d =>
    `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
    d.specialization.toLowerCase().includes(q) ||
    d.department.toLowerCase().includes(q)
  ).slice(0, 5).map(d => ({ ...d, type: 'doctor' }));

  const patients = db.patients.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
    p.phone.includes(q)
  ).slice(0, 5).map(p => {
    const doctor = db.doctors.find(d => d.id === p.doctorId);
    return {
      ...p,
      type: 'patient',
      doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : ''
    };
  });

  const illnesses = db.illnesses.filter(i =>
    i.icdCode.toLowerCase().includes(q) ||
    i.description.toLowerCase().includes(q)
  ).slice(0, 5).map(i => {
    const patient = db.patients.find(p => p.id === i.patientId);
    return {
      ...i,
      type: 'illness',
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : ''
    };
  });

  res.json({
    success: true,
    results: { doctors, patients, illnesses },
    total: doctors.length + patients.length + illnesses.length
  });
});

module.exports = router;
