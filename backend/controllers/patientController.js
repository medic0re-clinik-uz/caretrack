const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('../utils/db');

// Barcha bemorlar
const getAllPatients = (req, res) => {
  try {
    const db = readDB();
    let patients = db.patients;

    const { search, doctorId, gender, bloodType, status } = req.query;

    if (search) {
      const q = search.toLowerCase();
      patients = patients.filter(p =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        (p.email && p.email.toLowerCase().includes(q))
      );
    }

    if (doctorId) patients = patients.filter(p => p.doctorId === doctorId);
    if (gender) patients = patients.filter(p => p.gender === gender);
    if (bloodType) patients = patients.filter(p => p.bloodType === bloodType);
    if (status) patients = patients.filter(p => p.status === status);

    // Har bir bemor uchun qo'shimcha ma'lumot
    const enrichedPatients = patients.map(patient => {
      const doctor = db.doctors.find(d => d.id === patient.doctorId);
      const illnessCount = db.illnesses.filter(i => i.patientId === patient.id).length;
      const activeIllnesses = db.illnesses.filter(i => i.patientId === patient.id && i.status === 'ongoing').length;
      return {
        ...patient,
        doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Biriktirilmagan',
        doctorSpecialization: doctor ? doctor.specialization : '',
        illnessCount,
        activeIllnesses
      };
    });

    res.json({
      success: true,
      count: enrichedPatients.length,
      data: enrichedPatients
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Bitta bemor (to'liq profil)
const getPatientById = (req, res) => {
  try {
    const db = readDB();
    const patient = db.patients.find(p => p.id === req.params.id);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Bemor topilmadi' });
    }

    // Biriktirilgan shifokor
    const doctor = db.doctors.find(d => d.id === patient.doctorId);
    
    // Kasallik tarixlari
    const illnesses = db.illnesses.filter(i => i.patientId === patient.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: {
        ...patient,
        doctor: doctor || null,
        illnesses,
        illnessCount: illnesses.length,
        activeIllnesses: illnesses.filter(i => i.status === 'ongoing').length,
        criticalIllnesses: illnesses.filter(i => i.severity === 'critical').length
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Bemor yaratish
const createPatient = (req, res) => {
  try {
    const {
      firstName, lastName, dateOfBirth, gender, phone, email,
      address, bloodType, doctorId, emergencyContact
    } = req.body;

    if (!firstName || !lastName || !dateOfBirth || !gender || !phone || !doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Majburiy maydonlar: ism, familiya, tug\'ilgan sana, jins, telefon, shifokor'
      });
    }

    const db = readDB();

    // Shifokor mavjudligini tekshirish
    const doctor = db.doctors.find(d => d.id === doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Ko\'rsatilgan shifokor topilmadi'
      });
    }

    const newPatient = {
      id: `p${uuidv4().split('-')[0]}`,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      email: email || '',
      address: address || '',
      bloodType: bloodType || 'Noma\'lum',
      doctorId,
      status: 'active',
      emergencyContact: emergencyContact || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.patients.push(newPatient);
    writeDB(db);

    res.status(201).json({
      success: true,
      message: 'Bemor muvaffaqiyatli ro\'yxatga olindi',
      data: {
        ...newPatient,
        doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Bemorni yangilash
const updatePatient = (req, res) => {
  try {
    const db = readDB();
    const index = db.patients.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Bemor topilmadi' });
    }

    const { doctorId } = req.body;
    
    if (doctorId) {
      const doctor = db.doctors.find(d => d.id === doctorId);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Ko\'rsatilgan shifokor topilmadi'
        });
      }
    }

    const allowedFields = [
      'firstName', 'lastName', 'dateOfBirth', 'gender', 'phone',
      'email', 'address', 'bloodType', 'doctorId', 'status', 'emergencyContact'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    db.patients[index] = {
      ...db.patients[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    writeDB(db);

    const updatedPatient = db.patients[index];
    const doctor = db.doctors.find(d => d.id === updatedPatient.doctorId);

    res.json({
      success: true,
      message: 'Bemor ma\'lumotlari yangilandi',
      data: {
        ...updatedPatient,
        doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Biriktirilmagan'
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Bemorni o'chirish
const deletePatient = (req, res) => {
  try {
    const db = readDB();
    const index = db.patients.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Bemor topilmadi' });
    }

    // Bemor bilan bog'liq kasalliklarni ham o'chirish
    const illnessCount = db.illnesses.filter(i => i.patientId === req.params.id).length;
    db.illnesses = db.illnesses.filter(i => i.patientId !== req.params.id);
    
    const deleted = db.patients.splice(index, 1)[0];
    writeDB(db);

    res.json({
      success: true,
      message: `${deleted.firstName} ${deleted.lastName} tizimdan o'chirildi (${illnessCount} kasallik yozuvi ham o'chirildi)`,
      data: deleted
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

module.exports = { getAllPatients, getPatientById, createPatient, updatePatient, deletePatient };
