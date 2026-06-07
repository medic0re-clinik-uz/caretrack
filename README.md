# 🏥 CareTrack Clinic — Tibbiy Yozuvlarni Boshqarish Tizimi (TYBT)

**MediCore Solutions** tomonidan **CareTrack Clinic** uchun ishlab chiqilgan.

---

## 📋 Loyiha haqida

CareTrack — ko'p ixtisoslashgan klinikalar uchun web-asosidagi tibbiy yozuvlarni boshqarish tizimi. Node.js + Express backend, vanilla JS frontend, JWT autentifikatsiya va rol-asosidagi ruxsatlar bilan jihozlangan.

---

## 🛠️ Texnologiyalar

| Qatlam     | Texnologiya                                      |
|------------|--------------------------------------------------|
| Backend    | Node.js, Express.js, JSON file DB                |
| Auth       | JWT (jsonwebtoken), bcryptjs                     |
| HTTP       | Axios-like fetch wrapper, CORS, Helmet           |
| Middleware | Morgan (logger), custom auth & error handlers    |
| Frontend   | Vanilla HTML/CSS/JS, Google Fonts (DM Sans)      |
| Utilities  | uuid, morgan, helmet, cors                       |

---

## 🚀 O'rnatish va ishga tushirish

### Talablar
- Node.js v18+
- npm v8+

### Qadamlar

```bash
# 1. Loyihani yuklab oling yoki unzip qiling
cd caretrack-clinic

# 2. Paketlarni o'rnating
npm install

# 3. Serverni ishga tushiring
npm start

# 4. Brauzerda oching
# http://localhost:5000
```

---

## 🔐 Demo kirish ma'lumotlari

| Rol              | Username      | Parol       | Kirish darajasi                          |
|------------------|---------------|-------------|------------------------------------------|
| Administrator    | admin         | admin123    | Barcha CRUD amallar + tizim sozlamalari  |
| Klinitsist       | clinician     | clinic123   | Bemor + Kasallik ko'rish va yangilash    |
| Qabulxona xodimi | receptionist  | recep123    | Bemor ro'yxatga olish + shifokorlarni ko'rish |

---

## 📁 Loyiha tuzilishi

```
caretrack/
├── backend/
│   ├── controllers/
│   │   ├── authController.js      # Login, logout, dashboard stats
│   │   ├── doctorController.js    # Shifokorlar CRUD
│   │   ├── patientController.js   # Bemorlar CRUD
│   │   └── illnessController.js   # Kasalliklar CRUD
│   ├── middleware/
│   │   ├── auth.js                # JWT verify + rol tekshiruvi
│   │   └── logger.js              # Request logger, error handler
│   ├── routes/
│   │   └── index.js               # Barcha API yo'llari
│   ├── data/
│   │   └── db.json                # JSON "ma'lumotlar bazasi"
│   ├── utils/
│   │   └── db.js                  # DB o'qish/yozish yordamchi
│   └── server.js                  # Express ilovasi kirish nuqtasi
├── frontend/
│   ├── css/
│   │   └── style.css              # Barcha uslublar (dark/light mode)
│   ├── js/
│   │   ├── app.js                 # API client, auth, global funksiyalar
│   │   └── pages.js               # Sahifalar: dashboard, doctors, patients, illnesses
│   └── index.html                 # Asosiy HTML
├── package.json
└── README.md
```

---

## 🌐 API Endpoints

### Auth
| Method | URL              | Tavsif            | Ruxsat    |
|--------|------------------|-------------------|-----------|
| POST   | /api/auth/login  | Tizimga kirish    | Hammaga   |
| GET    | /api/auth/me     | Joriy foydalanuvchi | Token   |
| POST   | /api/auth/logout | Tizimdan chiqish  | Token     |

### Dashboard
| Method | URL                    | Tavsif         |
|--------|------------------------|----------------|
| GET    | /api/dashboard/stats   | Umumiy statistika |

### Shifokorlar
| Method | URL              | Tavsif              | Ruxsat          |
|--------|------------------|---------------------|-----------------|
| GET    | /api/doctors     | Barcha shifokorlar  | Hammaga         |
| GET    | /api/doctors/:id | Bitta shifokor      | Hammaga         |
| POST   | /api/doctors     | Yangi shifokor      | Admin           |
| PUT    | /api/doctors/:id | Shifokorni yangilash| Admin           |
| DELETE | /api/doctors/:id | Shifokorni o'chirish| Admin           |

### Bemorlar
| Method | URL               | Tavsif              | Ruxsat              |
|--------|-------------------|---------------------|---------------------|
| GET    | /api/patients     | Barcha bemorlar     | Hammaga             |
| GET    | /api/patients/:id | Bemor profili       | Hammaga             |
| POST   | /api/patients     | Bemor ro'yxatga olish | Hammaga           |
| PUT    | /api/patients/:id | Bemorni yangilash   | Admin + Klinitsist  |
| DELETE | /api/patients/:id | Bemorni o'chirish   | Admin               |

### Kasalliklar
| Method | URL                | Tavsif               | Ruxsat              |
|--------|--------------------|----------------------|---------------------|
| GET    | /api/illnesses     | Barcha kasalliklar   | Hammaga             |
| GET    | /api/illnesses/:id | Bitta kasallik       | Hammaga             |
| POST   | /api/illnesses     | Yangi tashxis        | Admin + Klinitsist  |
| PUT    | /api/illnesses/:id | Tashxisni yangilash  | Admin + Klinitsist  |
| DELETE | /api/illnesses/:id | Tashxisni o'chirish  | Admin               |

### Global qidiruv
| Method | URL             | Tavsif                            |
|--------|-----------------|-----------------------------------|
| GET    | /api/search?q=  | Shifokor/Bemor/Kasallik bo'ylab   |

---

## 📊 Ma'lumotlar modeli

```
Doctor (1) ────── (N) Patient (1) ────── (N) Illness
  id                   id                    id
  firstName            firstName             patientId
  lastName             lastName              icdCode
  specialization       dateOfBirth           description
  department           gender                severity (low/medium/high/critical)
  phone                phone                 diagnosisDate
  email                email                 status (ongoing/resolved/chronic/referred)
  experience           bloodType             treatment
  status               doctorId (FK)         notes
                       address               createdAt
                       emergencyContact      updatedAt
```

---

## 🎨 Dizayn xususiyatlari

- **Minimal klinik uslub** — toza, professional ko'rinish
- **Dark / Light mode** — to'liq qo'llab-quvvatlash
- **Responsive** — mobil va desktop uchun
- **CSS Variables** — oson mavzu o'zgartirish
- **DM Sans + DM Mono** — professional tipografiya
- **Smooth animatsiyalar** — hover, modal, toast

---

## ⚡ Asosiy xususiyatlar

✅ JWT token autentifikatsiya  
✅ Rol-asosidagi ruxsatlar (Admin / Klinitsist / Qabulxona)  
✅ Shifokorlar to'liq CRUD  
✅ Bemorlar to'liq CRUD + profil sahifasi  
✅ Kasalliklar/Tashxislar to'liq CRUD + ICD kodlar  
✅ Global qidiruv (real-vaqt)  
✅ Dark/Light mode toggle  
✅ Toast bildirishnomalar  
✅ Modal formalar  
✅ Filtrlash va qidiruv  
✅ Dashboard statistika  
✅ Bo'lim va og'irlik darajasi analitikasi  

---

*CareTrack Clinic v1.0 · MediCore Solutions · 2024*
