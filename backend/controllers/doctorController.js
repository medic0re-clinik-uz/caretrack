const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('../utils/db');

// Barcha shifokorlar
const getAllDoctors = (req, res) => {
  try {
    const db = readDB();
    let doctors = db.doctors;

    // Qidiruv
    const { search, department, specialization } = req.query;
    
    if (search) {
      const q = search.toLowerCase();
      doctors = doctors.filter(d =>
        d.firstName.toLowerCase().includes(q) ||
        d.lastName.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q) ||
        d.department.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q)
      );
    }

    if (department) {
      doctors = doctors.filter(d => 
        d.department.toLowerCase().includes(department.toLowerCase())
      );
    }

    if (specialization) {
      doctors = doctors.filter(d => 
        d.specialization.toLowerCase().includes(specialization.toLowerCase())
      );
    }

    // Har bir shifokor uchun bemor soni
    const doctorsWithCount = doctors.map(doctor => {
      const patientCount = db.patients.filter(p => p.doctorId === doctor.id).length;
      return { ...doctor, patientCount };
    });

    res.json({
      success: true,
      count: doctorsWithCount.length,
      data: doctorsWithCount
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Bitta shifokor
const getDoctorById = (req, res) => {
  try {
    const db = readDB();
    const doctor = db.doctors.find(d => d.id === req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Shifokor topilmadi' });
    }

    // Shifokorning bemorlarini olish
    const patients = db.patients.filter(p => p.doctorId === doctor.id);
    
    // Har bir bemor uchun kasallik soni
    const patientsWithData = patients.map(patient => {
      const illnessCount = db.illnesses.filter(i => i.patientId === patient.id).length;
      return { ...patient, illnessCount };
    });

    res.json({
      success: true,
      data: {
        ...doctor,
        patients: patientsWithData,
        patientCount: patients.length
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Shifokor yaratish
const createDoctor = (req, res) => {
  try {
    const { firstName, lastName, specialization, department, phone, email, experience } = req.body;

    if (!firstName || !lastName || !specialization || !department || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: 'Majburiy maydonlar: ism, familiya, mutaxassislik, bo\'lim, telefon, email'
      });
    }

    const db = readDB();

    // Email takrorlanmaslik tekshiruvi
    const emailExists = db.doctors.find(d => d.email === email);
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Bu email allaqachon ro\'yxatdan o\'tgan'
      });
    }

    const newDoctor = {
      id: `d${uuidv4().split('-')[0]}`,
      firstName,
      lastName,
      specialization,
      department,
      phone,
      email,
      experience: parseInt(experience) || 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.doctors.push(newDoctor);
    writeDB(db);

    res.status(201).json({
      success: true,
      message: 'Shifokor muvaffaqiyatli qo\'shildi',
      data: newDoctor
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Shifokorni yangilash
const updateDoctor = (req, res) => {
  try {
    const db = readDB();
    const index = db.doctors.findIndex(d => d.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Shifokor topilmadi' });
    }

    const { firstName, lastName, specialization, department, phone, email, experience, status } = req.body;

    // Email takrorlanmaslik (o'zi uchun emas)
    if (email) {
      const emailExists = db.doctors.find(d => d.email === email && d.id !== req.params.id);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Bu email boshqa shifokor tomonidan ishlatilmoqda'
        });
      }
    }

    db.doctors[index] = {
      ...db.doctors[index],
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(specialization && { specialization }),
      ...(department && { department }),
      ...(phone && { phone }),
      ...(email && { email }),
      ...(experience !== undefined && { experience: parseInt(experience) }),
      ...(status && { status }),
      updatedAt: new Date().toISOString()
    };

    writeDB(db);

    res.json({
      success: true,
      message: 'Shifokor ma\'lumotlari yangilandi',
      data: db.doctors[index]
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Shifokorni o'chirish
const deleteDoctor = (req, res) => {
  try {
    const db = readDB();
    const index = db.doctors.findIndex(d => d.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Shifokor topilmadi' });
    }

    // Bemorlar bor bo'lsa ogohlantirish
    const patientCount = db.patients.filter(p => p.doctorId === req.params.id).length;
    if (patientCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Bu shifokorga ${patientCount} bemor biriktirilgan. Avval bemorlarni boshqa shifokorga o'tkazing.`
      });
    }

    const deleted = db.doctors.splice(index, 1)[0];
    writeDB(db);

    res.json({
      success: true,
      message: `Dr. ${deleted.firstName} ${deleted.lastName} tizimdan o'chirildi`,
      data: deleted
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

module.exports = { getAllDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor };
