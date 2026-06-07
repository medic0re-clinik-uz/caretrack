const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('../utils/db');

// Barcha kasalliklar
const getAllIllnesses = (req, res) => {
  try {
    const db = readDB();
    let illnesses = db.illnesses;

    const { search, patientId, severity, status, icdCode } = req.query;

    if (search) {
      const q = search.toLowerCase();
      illnesses = illnesses.filter(i =>
        i.description.toLowerCase().includes(q) ||
        i.icdCode.toLowerCase().includes(q) ||
        (i.treatment && i.treatment.toLowerCase().includes(q))
      );
    }

    if (patientId) illnesses = illnesses.filter(i => i.patientId === patientId);
    if (severity) illnesses = illnesses.filter(i => i.severity === severity);
    if (status) illnesses = illnesses.filter(i => i.status === status);
    if (icdCode) illnesses = illnesses.filter(i => i.icdCode.toLowerCase().includes(icdCode.toLowerCase()));

    // Har bir kasallik uchun bemor ma'lumotlari
    const enriched = illnesses.map(illness => {
      const patient = db.patients.find(p => p.id === illness.patientId);
      const doctor = patient ? db.doctors.find(d => d.id === patient.doctorId) : null;
      return {
        ...illness,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Noma\'lum',
        doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Biriktirilmagan'
      };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      count: enriched.length,
      data: enriched
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Bitta kasallik
const getIllnessById = (req, res) => {
  try {
    const db = readDB();
    const illness = db.illnesses.find(i => i.id === req.params.id);

    if (!illness) {
      return res.status(404).json({ success: false, message: 'Kasallik yozuvi topilmadi' });
    }

    const patient = db.patients.find(p => p.id === illness.patientId);
    const doctor = patient ? db.doctors.find(d => d.id === patient.doctorId) : null;

    res.json({
      success: true,
      data: {
        ...illness,
        patient: patient || null,
        doctor: doctor || null
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Kasallik yozuvi yaratish
const createIllness = (req, res) => {
  try {
    const {
      patientId, icdCode, description, severity,
      diagnosisDate, treatment, notes, status
    } = req.body;

    if (!patientId || !icdCode || !description || !severity || !diagnosisDate) {
      return res.status(400).json({
        success: false,
        message: 'Majburiy maydonlar: bemor, ICD kodi, tavsif, og\'irlik darajasi, tashxis sanasi'
      });
    }

    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({
        success: false,
        message: `Og'irlik darajasi noto'g'ri. Quyidagilardan biri bo'lishi kerak: ${validSeverities.join(', ')}`
      });
    }

    const db = readDB();

    const patient = db.patients.find(p => p.id === patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Bemor topilmadi' });
    }

    const newIllness = {
      id: `ill${uuidv4().split('-')[0]}`,
      patientId,
      icdCode: icdCode.toUpperCase(),
      description,
      severity,
      diagnosisDate,
      status: status || 'ongoing',
      treatment: treatment || '',
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.illnesses.push(newIllness);
    writeDB(db);

    const doctor = db.doctors.find(d => d.id === patient.doctorId);

    res.status(201).json({
      success: true,
      message: 'Kasallik/tashxis yozuvi muvaffaqiyatli yaratildi',
      data: {
        ...newIllness,
        patientName: `${patient.firstName} ${patient.lastName}`,
        doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Biriktirilmagan'
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Kasallikni yangilash
const updateIllness = (req, res) => {
  try {
    const db = readDB();
    const index = db.illnesses.findIndex(i => i.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Kasallik yozuvi topilmadi' });
    }

    const { severity, status } = req.body;

    if (severity) {
      const validSeverities = ['low', 'medium', 'high', 'critical'];
      if (!validSeverities.includes(severity)) {
        return res.status(400).json({
          success: false,
          message: `Og'irlik darajasi noto'g'ri.`
        });
      }
    }

    if (status) {
      const validStatuses = ['ongoing', 'resolved', 'chronic', 'referred'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Holat noto'g'ri.`
        });
      }
    }

    const allowedFields = [
      'icdCode', 'description', 'severity', 'diagnosisDate',
      'status', 'treatment', 'notes'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.icdCode) updates.icdCode = updates.icdCode.toUpperCase();

    db.illnesses[index] = {
      ...db.illnesses[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    writeDB(db);

    const illness = db.illnesses[index];
    const patient = db.patients.find(p => p.id === illness.patientId);
    const doctor = patient ? db.doctors.find(d => d.id === patient.doctorId) : null;

    res.json({
      success: true,
      message: 'Kasallik yozuvi yangilandi',
      data: {
        ...illness,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Noma\'lum',
        doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Biriktirilmagan'
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Kasallikni o'chirish
const deleteIllness = (req, res) => {
  try {
    const db = readDB();
    const index = db.illnesses.findIndex(i => i.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Kasallik yozuvi topilmadi' });
    }

    const deleted = db.illnesses.splice(index, 1)[0];
    writeDB(db);

    res.json({
      success: true,
      message: `ICD: ${deleted.icdCode} kasallik yozuvi o'chirildi`,
      data: deleted
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

module.exports = { getAllIllnesses, getIllnessById, createIllness, updateIllness, deleteIllness };
