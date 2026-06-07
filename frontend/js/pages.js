// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function showLoginPage() {
  document.getElementById('app').className = 'auth-mode';
  document.getElementById('app').innerHTML = `
    <div class="login-page">
      <div style="position:absolute;top:20px;right:20px">
        <button class="theme-toggle" id="themeToggle" onclick="toggleTheme()">🌙</button>
      </div>
      <div class="login-card">
        <div class="login-header">
          <div class="login-logo">🏥</div>
          <h1 class="login-title">CareTrack Clinic</h1>
          <p class="login-subtitle">Tibbiy Yozuvlarni Boshqarish Tizimi</p>
        </div>

        <div class="login-demo-hints">
          <p>Demo kirish ma'lumotlari:</p>
          <div class="demo-cred" onclick="fillCreds('admin','admin123')">
            <span class="cred-role">🔑 Administrator</span>
            <span class="cred-pass">admin / admin123</span>
          </div>
          <div class="demo-cred" onclick="fillCreds('clinician','clinic123')">
            <span class="cred-role">👨‍⚕️ Klinitsist</span>
            <span class="cred-pass">clinician / clinic123</span>
          </div>
          <div class="demo-cred" onclick="fillCreds('receptionist','recep123')">
            <span class="cred-role">📋 Qabulxona</span>
            <span class="cred-pass">receptionist / recep123</span>
          </div>
        </div>

        <div id="loginError" class="login-error"></div>

        <div class="form-group" style="margin-bottom:14px">
          <label class="form-label">Foydalanuvchi nomi</label>
          <input id="loginUsername" class="form-control" type="text" placeholder="username" autocomplete="username">
        </div>
        <div class="form-group" style="margin-bottom:20px">
          <label class="form-label">Parol</label>
          <input id="loginPassword" class="form-control" type="password" placeholder="••••••••" autocomplete="current-password">
        </div>

        <button class="btn btn-primary w-full btn-lg" id="loginBtn" onclick="handleLogin()">
          Kirish
        </button>

        <p style="text-align:center;font-size:12px;color:var(--text-muted);margin-top:20px">
          MediCore Solutions © 2024 · CareTrack v1.0
        </p>
      </div>
    </div>
  `;
  initTheme();

  document.getElementById('loginPassword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
}

function fillCreds(user, pass) {
  document.getElementById('loginUsername').value = user;
  document.getElementById('loginPassword').value = pass;
}

async function handleLogin() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');
  const btn = document.getElementById('loginBtn');

  if (!username || !password) {
    errEl.textContent = 'Foydalanuvchi nomi va parolni kiriting';
    errEl.classList.add('show');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<div class="inline-spinner"></div> Tekshirilmoqda...';

  try {
    const res = await login(username, password);
    if (!res.ok) {
      errEl.textContent = res.data.message || 'Kirish xatosi';
      errEl.classList.add('show');
      btn.disabled = false;
      btn.innerHTML = 'Kirish';
    }
  } catch (err) {
    errEl.textContent = 'Server bilan bog\'lanib bo\'lmadi';
    errEl.classList.add('show');
    btn.disabled = false;
    btn.innerHTML = 'Kirish';
  }
}

// ─── MAIN APP LAYOUT ──────────────────────────────────────────────────────────
function initApp() {
  document.getElementById('app').className = '';
  document.getElementById('app').innerHTML = `
    <!-- SIDEBAR -->
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon">🏥</div>
        <div class="logo-text">
          <strong>CareTrack</strong>
          <span>Klinika Tizimi</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-group">
          <div class="nav-group-label">Asosiy</div>
          <button class="nav-item active" data-page="dashboard" onclick="navigateTo('dashboard')">
            <span class="nav-icon">📊</span>
            <span class="nav-label">Bosh sahifa</span>
          </button>
        </div>

        <div class="nav-group">
          <div class="nav-group-label">Tibbiy ma'lumotlar</div>
          ${isAdmin() ? `
          <button class="nav-item" data-page="doctors" onclick="navigateTo('doctors')">
            <span class="nav-icon">👨‍⚕️</span>
            <span class="nav-label">Shifokorlar</span>
          </button>` : ''}
          <button class="nav-item" data-page="patients" onclick="navigateTo('patients')">
            <span class="nav-icon">🧑</span>
            <span class="nav-label">Bemorlar</span>
          </button>
          <button class="nav-item" data-page="illnesses" onclick="navigateTo('illnesses')">
            <span class="nav-icon">🩺</span>
            <span class="nav-label">Kasalliklar</span>
          </button>
        </div>

        <div class="nav-group">
          <div class="nav-group-label">Hisob</div>
          <button class="nav-item" data-page="profile" onclick="navigateTo('profile')">
            <span class="nav-icon">👤</span>
            <span class="nav-label">Mening profilim</span>
          </button>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="user-card">
          <div class="avatar ${getAvatarColor(currentUser.id)}">${getInitials(currentUser.name.split(' ')[0], currentUser.name.split(' ')[1] || '')}</div>
          <div class="user-info">
            <strong>${currentUser.name}</strong>
            <small>${currentUser.role === 'admin' ? 'Administrator' : currentUser.role === 'clinician' ? 'Klinitsist' : 'Qabulxona'}</small>
          </div>
        </div>
        <button class="nav-item" onclick="logout()" style="color:var(--danger)">
          <span class="nav-icon">🚪</span>
          <span class="nav-label">Chiqish</span>
        </button>
      </div>
    </aside>

    <!-- MAIN -->
    <div class="main">
      <header class="topbar">
        <button class="topbar-toggle" onclick="toggleSidebar()">☰</button>
        <span class="topbar-title" id="topbarTitle">Bosh sahifa</span>

        <div class="topbar-search">
          <span class="search-icon">🔍</span>
          <input id="globalSearch" type="text" placeholder="Shifokor, bemor, kasallik qidiring...">
          <div class="search-results" id="searchResults"></div>
        </div>

        <div class="topbar-actions">
          <button class="theme-toggle" id="themeToggle" onclick="toggleTheme()">🌙</button>
          <button class="btn-icon" onclick="navigateTo('profile')" title="Profil">👤</button>
          <button class="btn-icon" onclick="logout()" title="Chiqish" style="color:var(--danger)">🚪</button>
        </div>
      </header>

      <div class="content" id="mainContent">
        <div style="display:flex;align-items:center;justify-content:center;padding:60px">
          <div class="spinner"></div>
        </div>
      </div>
    </div>

    <!-- TOASTS -->
    <div class="toast-container" id="toastContainer"></div>
  `;

  initTheme();
  setupSearch();
  navigateTo('dashboard');
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
async function renderDashboard() {
  const res = await api.get('/dashboard/stats');
  if (!res.ok) { showToast('Statistikani yuklashda xato', 'error'); return; }
  const s = res.data.data;

  const depRows = Object.entries(s.departmentStats).map(([dept, data]) => `
    <tr>
      <td><strong>${dept}</strong></td>
      <td>${data.doctors}</td>
      <td>${data.patients}</td>
    </tr>
  `).join('');

  document.getElementById('mainContent').innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Xush kelibsiz, ${currentUser.name.split(' ')[0]}! 👋</h1>
        <p class="page-subtitle">CareTrack Clinic boshqaruv paneli · ${new Date().toLocaleDateString('uz-UZ', {weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-icon">👨‍⚕️</div>
        <div class="stat-value">${s.totalDoctors}</div>
        <div class="stat-label">Jami shifokorlar</div>
        <div class="stat-change">✓ ${s.activeDoctors} faol</div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon">🧑</div>
        <div class="stat-value">${s.totalPatients}</div>
        <div class="stat-label">Jami bemorlar</div>
        <div class="stat-change">✓ ${s.activePatients} faol</div>
      </div>
      <div class="stat-card orange">
        <div class="stat-icon">🩺</div>
        <div class="stat-value">${s.totalIllnesses}</div>
        <div class="stat-label">Kasallik yozuvlari</div>
        <div class="stat-change">● ${s.ongoingIllnesses} davom etmoqda</div>
      </div>
      <div class="stat-card red">
        <div class="stat-icon">🚨</div>
        <div class="stat-value">${s.criticalCases}</div>
        <div class="stat-label">Kritik holatlar</div>
        <div class="stat-change">✓ ${s.resolvedCases} tuzalgan</div>
      </div>
      <div class="stat-card purple">
        <div class="stat-icon">📈</div>
        <div class="stat-value">${s.recentActivity.newPatients}</div>
        <div class="stat-label">Yangi bemorlar (7 kun)</div>
        <div class="stat-change">+ ${s.recentActivity.newIllnesses} yangi tashxis</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <!-- Og'irlik darajalari -->
      <div class="card">
        <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;color:var(--text-primary)">📊 Kasallik og'irlik darajalari</h3>
        ${['low','medium','high','critical'].map(sev => {
          const count = s.severityBreakdown[sev];
          const total = s.totalIllnesses || 1;
          const pct = Math.round((count / total) * 100);
          const labels = {low:'Yengil',medium:"O'rta",high:"Og'ir",critical:'Kritik'};
          const colors = {low:'var(--severity-low)',medium:'var(--severity-medium)',high:'var(--severity-high)',critical:'var(--severity-critical)'};
          return `
            <div style="margin-bottom:12px">
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
                <span style="color:var(--text-secondary);font-weight:500">${labels[sev]}</span>
                <span style="font-weight:700;color:${colors[sev]}">${count} (${pct}%)</span>
              </div>
              <div style="height:6px;background:var(--bg-tertiary);border-radius:99px;overflow:hidden">
                <div style="width:${pct}%;height:100%;background:${colors[sev]};border-radius:99px;transition:width 0.8s ease"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Bo'limlar -->
      <div class="card">
        <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;color:var(--text-primary)">🏥 Bo'limlar statistikasi</h3>
        <table class="data-table">
          <thead><tr>
            <th>Bo'lim</th>
            <th>Shifokor</th>
            <th>Bemor</th>
          </tr></thead>
          <tbody>${depRows || '<tr><td colspan="3" style="text-align:center;color:var(--text-muted)">Ma\'lumot yo\'q</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="card" style="margin-top:20px">
      <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;color:var(--text-primary)">⚡ Tezkor amallar</h3>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="navigateTo('patients'); setTimeout(()=>openAddPatient(),500)">
          + Yangi bemor ro'yxatga olish
        </button>
        <button class="btn btn-secondary" onclick="navigateTo('illnesses'); setTimeout(()=>openAddIllness(),500)">
          + Tashxis yozuvi qo'shish
        </button>
        ${isAdmin() ? `<button class="btn btn-secondary" onclick="navigateTo('doctors'); setTimeout(()=>openAddDoctor(),500)">+ Shifokor qo'shish</button>` : ''}
        <button class="btn btn-secondary" onclick="navigateTo('patients')">
          📋 Bemorlar ro'yxati
        </button>
      </div>
    </div>
  `;
}

// ─── DOCTORS PAGE ─────────────────────────────────────────────────────────────
let doctorsData = [];
async function renderDoctors() {
  const res = await api.get('/doctors');
  if (!res.ok) { showToast('Shifokorlarni yuklashda xato', 'error'); return; }
  doctorsData = res.data.data;
  renderDoctorTable(doctorsData);
}

function renderDoctorTable(doctors) {
  const canManage = canManageDoctors();
  document.getElementById('mainContent').innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">👨‍⚕️ Shifokorlar</h1>
        <p class="page-subtitle">${doctors.length} nafar shifokor ro'yxatda</p>
      </div>
      <div class="page-actions">
        ${canManage ? `<button class="btn btn-primary" onclick="openAddDoctor()">+ Shifokor qo'shish</button>` : ''}
      </div>
    </div>

    <div class="table-card">
      <div class="table-header">
        <div class="table-filters">
          <input class="filter-input" placeholder="🔍 Qidirish..." id="docSearch" oninput="filterDoctors()" style="width:200px">
          <select class="filter-select" id="docDeptFilter" onchange="filterDoctors()">
            <option value="">Barcha bo'limlar</option>
            ${[...new Set(doctorsData.map(d => d.department))].map(d => `<option value="${d}">${d}</option>`).join('')}
          </select>
        </div>
      </div>

      <div style="overflow-x:auto">
        <table class="data-table" id="doctorTable">
          <thead>
            <tr>
              <th>Shifokor</th>
              <th>Mutaxassislik</th>
              <th>Bo'lim</th>
              <th>Telefon</th>
              <th>Tajriba</th>
              <th>Bemorlar</th>
              <th>Holat</th>
              ${canManage ? '<th>Amallar</th>' : ''}
            </tr>
          </thead>
          <tbody id="doctorTableBody">
            ${renderDoctorRows(doctors)}
          </tbody>
        </table>
      </div>
      ${doctors.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">👨‍⚕️</div>
          <div class="empty-title">Shifokorlar topilmadi</div>
          <div class="empty-text">Hozircha shifokorlar mavjud emas</div>
        </div>` : ''}
    </div>
  `;
}

function renderDoctorRows(doctors) {
  const canManage = canManageDoctors();
  return doctors.map(d => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="avatar ${getAvatarColor(d.id)}">${getInitials(d.firstName, d.lastName)}</div>
          <div>
            <div style="font-weight:600">Dr. ${d.firstName} ${d.lastName}</div>
            <div style="font-size:11px;color:var(--text-muted)">${d.email}</div>
          </div>
        </div>
      </td>
      <td>${d.specialization}</td>
      <td>${d.department}</td>
      <td class="font-mono" style="font-size:12px">${d.phone}</td>
      <td>${d.experience} yil</td>
      <td>
        <span style="font-weight:700;color:var(--accent)">${d.patientCount || 0}</span>
        <span style="color:var(--text-muted);font-size:11px"> bemor</span>
      </td>
      <td>${getStatusBadge(d.status)}</td>
      ${canManage ? `
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-secondary btn-sm" onclick="viewDoctor('${d.id}')">Ko'rish</button>
          <button class="btn btn-secondary btn-sm" onclick="openEditDoctor('${d.id}')">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="confirmDeleteDoctor('${d.id}','${d.firstName} ${d.lastName}')">🗑</button>
        </div>
      </td>` : `<td><button class="btn btn-secondary btn-sm" onclick="viewDoctor('${d.id}')">Ko'rish</button></td>`}
    </tr>
  `).join('');
}

function filterDoctors() {
  const q = document.getElementById('docSearch').value.toLowerCase();
  const dept = document.getElementById('docDeptFilter').value.toLowerCase();
  const filtered = doctorsData.filter(d =>
    (!q || `${d.firstName} ${d.lastName} ${d.specialization} ${d.email}`.toLowerCase().includes(q)) &&
    (!dept || d.department.toLowerCase().includes(dept))
  );
  document.getElementById('doctorTableBody').innerHTML = renderDoctorRows(filtered);
}

async function viewDoctor(id) {
  const res = await api.get(`/doctors/${id}`);
  if (!res.ok) return;
  const d = res.data.data;
  showModal(`👨‍⚕️ Dr. ${d.firstName} ${d.lastName}`, `
    <div class="profile-header" style="margin:0 0 16px;padding:16px;background:var(--bg-tertiary);border-radius:var(--radius-md)">
      <div class="avatar avatar-xl ${getAvatarColor(d.id)}">${getInitials(d.firstName, d.lastName)}</div>
      <div class="profile-info">
        <h2>Dr. ${d.firstName} ${d.lastName}</h2>
        <p>${d.specialization} · ${d.department}</p>
        <div class="profile-meta">
          <span class="profile-meta-item">📞 ${d.phone}</span>
          <span class="profile-meta-item">📧 ${d.email}</span>
          <span class="profile-meta-item">⏱ ${d.experience} yil tajriba</span>
          <span class="profile-meta-item">🧑 ${d.patientCount} bemor</span>
        </div>
      </div>
    </div>
    <h4 style="font-size:13px;font-weight:700;margin-bottom:10px">Biriktirilgan bemorlar (${d.patients?.length || 0})</h4>
    ${d.patients?.length ? `
      <div style="max-height:200px;overflow-y:auto">
        ${d.patients.map(p => `
          <div style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:var(--radius-md);cursor:pointer;transition:background 0.15s" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background=''" onclick="closeModal();openPatientProfile('${p.id}')">
            <div class="avatar avatar-sm ${getAvatarColor(p.id)}">${getInitials(p.firstName, p.lastName)}</div>
            <div>
              <div style="font-weight:600;font-size:13px">${p.firstName} ${p.lastName}</div>
              <div style="font-size:11px;color:var(--text-muted)">${getAge(p.dateOfBirth)} · ${p.illnessCount} kasallik</div>
            </div>
          </div>
        `).join('')}
      </div>` : '<p style="color:var(--text-muted);font-size:13px">Hozircha bemor biriktirilmagan</p>'}
  `);
}

function openAddDoctor() {
  showModal('➕ Yangi shifokor qo\'shish', `
    <div class="form-grid form-grid-2">
      <div class="form-group">
        <label class="form-label">Ism <span class="req">*</span></label>
        <input id="df_firstName" class="form-control" placeholder="Sardor">
      </div>
      <div class="form-group">
        <label class="form-label">Familiya <span class="req">*</span></label>
        <input id="df_lastName" class="form-control" placeholder="Rahimov">
      </div>
      <div class="form-group">
        <label class="form-label">Mutaxassislik <span class="req">*</span></label>
        <input id="df_specialization" class="form-control" placeholder="Kardiologiya">
      </div>
      <div class="form-group">
        <label class="form-label">Bo'lim <span class="req">*</span></label>
        <input id="df_department" class="form-control" placeholder="Yurak-qon tomir">
      </div>
      <div class="form-group">
        <label class="form-label">Telefon <span class="req">*</span></label>
        <input id="df_phone" class="form-control" placeholder="+998901234567">
      </div>
      <div class="form-group">
        <label class="form-label">Email <span class="req">*</span></label>
        <input id="df_email" class="form-control" type="email" placeholder="shifokor@caretrack.uz">
      </div>
      <div class="form-group">
        <label class="form-label">Tajriba (yil)</label>
        <input id="df_experience" class="form-control" type="number" min="0" placeholder="5">
      </div>
    </div>
  `,
  `<button class="btn btn-secondary" onclick="closeModal()">Bekor qilish</button>
   <button class="btn btn-primary" onclick="submitAddDoctor()">Saqlash</button>`);
}

async function submitAddDoctor() {
  const data = {
    firstName: document.getElementById('df_firstName').value.trim(),
    lastName: document.getElementById('df_lastName').value.trim(),
    specialization: document.getElementById('df_specialization').value.trim(),
    department: document.getElementById('df_department').value.trim(),
    phone: document.getElementById('df_phone').value.trim(),
    email: document.getElementById('df_email').value.trim(),
    experience: document.getElementById('df_experience').value || 0
  };
  const res = await api.post('/doctors', data);
  if (res.ok) {
    showToast('Shifokor muvaffaqiyatli qo\'shildi', 'success');
    closeModal();
    renderDoctors();
  } else {
    showToast(res.data.message, 'error');
  }
}

async function openEditDoctor(id) {
  const res = await api.get(`/doctors/${id}`);
  if (!res.ok) return;
  const d = res.data.data;
  showModal(`✏️ Shifokorni tahrirlash`, `
    <div class="form-grid form-grid-2">
      <div class="form-group">
        <label class="form-label">Ism</label>
        <input id="de_firstName" class="form-control" value="${d.firstName}">
      </div>
      <div class="form-group">
        <label class="form-label">Familiya</label>
        <input id="de_lastName" class="form-control" value="${d.lastName}">
      </div>
      <div class="form-group">
        <label class="form-label">Mutaxassislik</label>
        <input id="de_specialization" class="form-control" value="${d.specialization}">
      </div>
      <div class="form-group">
        <label class="form-label">Bo'lim</label>
        <input id="de_department" class="form-control" value="${d.department}">
      </div>
      <div class="form-group">
        <label class="form-label">Telefon</label>
        <input id="de_phone" class="form-control" value="${d.phone}">
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input id="de_email" class="form-control" value="${d.email}">
      </div>
      <div class="form-group">
        <label class="form-label">Tajriba (yil)</label>
        <input id="de_experience" class="form-control" type="number" value="${d.experience}">
      </div>
      <div class="form-group">
        <label class="form-label">Holat</label>
        <select id="de_status" class="form-control">
          <option value="active" ${d.status==='active'?'selected':''}>Faol</option>
          <option value="inactive" ${d.status==='inactive'?'selected':''}>Faolsiz</option>
        </select>
      </div>
    </div>
  `,
  `<button class="btn btn-secondary" onclick="closeModal()">Bekor qilish</button>
   <button class="btn btn-primary" onclick="submitEditDoctor('${id}')">Yangilash</button>`);
}

async function submitEditDoctor(id) {
  const data = {
    firstName: document.getElementById('de_firstName').value,
    lastName: document.getElementById('de_lastName').value,
    specialization: document.getElementById('de_specialization').value,
    department: document.getElementById('de_department').value,
    phone: document.getElementById('de_phone').value,
    email: document.getElementById('de_email').value,
    experience: document.getElementById('de_experience').value,
    status: document.getElementById('de_status').value
  };
  const res = await api.put(`/doctors/${id}`, data);
  if (res.ok) {
    showToast('Shifokor ma\'lumotlari yangilandi', 'success');
    closeModal();
    renderDoctors();
  } else {
    showToast(res.data.message, 'error');
  }
}

function confirmDeleteDoctor(id, name) {
  showConfirm(`Dr. ${name}`, 'Bu shifokorni o\'chirishni tasdiqlaysizmi? Bu amal qaytarib bo\'lmaydi.', async () => {
    const res = await api.delete(`/doctors/${id}`);
    if (res.ok) {
      showToast(res.data.message, 'success');
      renderDoctors();
    } else {
      showToast(res.data.message, 'error');
    }
  });
}

// ─── PATIENTS PAGE ────────────────────────────────────────────────────────────
let patientsData = [];
let doctorsList = [];
async function renderPatients() {
  const [pRes, dRes] = await Promise.all([api.get('/patients'), api.get('/doctors')]);
  if (!pRes.ok) { showToast('Bemorlarni yuklashda xato', 'error'); return; }
  patientsData = pRes.data.data;
  doctorsList = dRes.ok ? dRes.data.data : [];
  renderPatientTable(patientsData);
}

function renderPatientTable(patients) {
  document.getElementById('mainContent').innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">🧑 Bemorlar</h1>
        <p class="page-subtitle">${patients.length} nafar bemor ro'yxatda</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="openAddPatient()">+ Bemor ro'yxatga olish</button>
      </div>
    </div>

    <div class="table-card">
      <div class="table-header">
        <div class="table-filters">
          <input class="filter-input" placeholder="🔍 Qidirish..." id="patSearch" oninput="filterPatients()" style="width:200px">
          <select class="filter-select" id="patGenderFilter" onchange="filterPatients()">
            <option value="">Barcha</option>
            <option value="male">Erkak</option>
            <option value="female">Ayol</option>
          </select>
          <select class="filter-select" id="patDoctorFilter" onchange="filterPatients()">
            <option value="">Barcha shifokorlar</option>
            ${doctorsList.map(d => `<option value="${d.id}">Dr. ${d.firstName} ${d.lastName}</option>`).join('')}
          </select>
        </div>
      </div>
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>Bemor</th>
              <th>Yosh / Jins</th>
              <th>Qon guruhi</th>
              <th>Shifokor</th>
              <th>Kasalliklar</th>
              <th>Holat</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody id="patientTableBody">
            ${renderPatientRows(patients)}
          </tbody>
        </table>
      </div>
      ${patients.length === 0 ? `<div class="empty-state"><div class="empty-icon">🧑</div><div class="empty-title">Bemorlar topilmadi</div></div>` : ''}
    </div>
  `;
}

function renderPatientRows(patients) {
  return patients.map(p => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="avatar ${getAvatarColor(p.id)}" style="background:${p.gender==='female'?'#ec4899':'var(--accent)'}">
            ${getInitials(p.firstName, p.lastName)}
          </div>
          <div>
            <div style="font-weight:600">${p.firstName} ${p.lastName}</div>
            <div style="font-size:11px;color:var(--text-muted)">${p.phone}</div>
          </div>
        </div>
      </td>
      <td>
        <div style="font-weight:500">${getAge(p.dateOfBirth)}</div>
        <div style="font-size:11px;color:var(--text-muted)">${p.gender === 'male' ? '♂ Erkak' : '♀ Ayol'}</div>
      </td>
      <td><span class="badge badge-active" style="font-size:12px;font-family:monospace">${p.bloodType}</span></td>
      <td>
        <div style="font-size:13px">${p.doctorName}</div>
        <div style="font-size:11px;color:var(--text-muted)">${p.doctorSpecialization}</div>
      </td>
      <td>
        ${p.activeIllnesses > 0 ? `<span class="badge badge-ongoing">${p.activeIllnesses} faol</span>` : ''}
        <span style="color:var(--text-muted);font-size:11px">${p.illnessCount} jami</span>
      </td>
      <td>${getStatusBadge(p.status)}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-primary btn-sm" onclick="openPatientProfile('${p.id}')">Profil</button>
          ${canManagePatients() ? `<button class="btn btn-secondary btn-sm" onclick="openEditPatient('${p.id}')">✏️</button>` : ''}
          ${isAdmin() ? `<button class="btn btn-danger btn-sm" onclick="confirmDeletePatient('${p.id}','${p.firstName} ${p.lastName}')">🗑</button>` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function filterPatients() {
  const q = document.getElementById('patSearch').value.toLowerCase();
  const gender = document.getElementById('patGenderFilter').value;
  const doctorId = document.getElementById('patDoctorFilter').value;
  const filtered = patientsData.filter(p =>
    (!q || `${p.firstName} ${p.lastName} ${p.phone}`.toLowerCase().includes(q)) &&
    (!gender || p.gender === gender) &&
    (!doctorId || p.doctorId === doctorId)
  );
  document.getElementById('patientTableBody').innerHTML = renderPatientRows(filtered);
}

async function openPatientProfile(id) {
  const res = await api.get(`/patients/${id}`);
  if (!res.ok) return;
  const p = res.data.data;

  showModal(`🧑 ${p.firstName} ${p.lastName} — To'liq profil`, `
    <div style="display:flex;align-items:center;gap:16px;padding:16px;background:var(--bg-tertiary);border-radius:var(--radius-md);margin-bottom:16px">
      <div class="avatar avatar-xl" style="background:${p.gender==='female'?'#ec4899':'var(--accent)'}">
        ${getInitials(p.firstName, p.lastName)}
      </div>
      <div>
        <h2 style="font-size:18px;font-weight:800">${p.firstName} ${p.lastName}</h2>
        <div style="font-size:13px;color:var(--text-muted);margin-top:4px">
          ${getAge(p.dateOfBirth)} · ${p.gender==='male'?'Erkak':'Ayol'} · ${p.bloodType}
        </div>
        <div style="display:flex;gap:12px;margin-top:8px;font-size:12px">
          <span>📞 ${p.phone}</span>
          <span>📧 ${p.email || '—'}</span>
        </div>
      </div>
    </div>
    ${p.doctor ? `
    <div style="padding:12px;background:var(--accent-light);border-radius:var(--radius-md);margin-bottom:16px;display:flex;align-items:center;gap:12px">
      <div class="avatar ${getAvatarColor(p.doctor.id)}">${getInitials(p.doctor.firstName, p.doctor.lastName)}</div>
      <div>
        <div style="font-size:12px;color:var(--accent);font-weight:700">BIRIKTIRILGAN SHIFOKOR</div>
        <div style="font-weight:600">Dr. ${p.doctor.firstName} ${p.doctor.lastName}</div>
        <div style="font-size:12px;color:var(--text-muted)">${p.doctor.specialization} · ${p.doctor.department}</div>
      </div>
    </div>` : ''}
    <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center">
      <h4 style="font-size:13px;font-weight:700">🩺 Kasallik tarixi (${p.illnesses?.length || 0})</h4>
      ${canManageIllnesses() ? `<button class="btn btn-primary btn-sm" onclick="closeModal(); openAddIllnessForPatient('${p.id}')">+ Tashxis qo'shish</button>` : ''}
    </div>
    <div style="max-height:220px;overflow-y:auto">
      ${p.illnesses?.length ? p.illnesses.map(ill => `
        <div style="padding:12px;border:1px solid var(--border);border-radius:var(--radius-md);margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
            <div>
              <span class="font-mono" style="font-size:11px;background:var(--bg-tertiary);padding:2px 6px;border-radius:4px">${ill.icdCode}</span>
              ${getSeverityBadge(ill.severity)}
              ${getStatusBadge(ill.status)}
            </div>
            <span style="font-size:11px;color:var(--text-muted)">${formatDate(ill.diagnosisDate)}</span>
          </div>
          <p style="font-size:13px;color:var(--text-primary);margin-bottom:4px">${ill.description}</p>
          ${ill.treatment ? `<p style="font-size:12px;color:var(--text-secondary)">💊 ${ill.treatment}</p>` : ''}
        </div>
      `).join('') : '<p style="color:var(--text-muted);font-size:13px;text-align:center;padding:20px">Kasallik yozuvlari yo\'q</p>'}
    </div>
  `, `<button class="btn btn-secondary" onclick="closeModal()">Yopish</button>
      ${canManagePatients() ? `<button class="btn btn-primary" onclick="closeModal();openEditPatient('${p.id}')">✏️ Tahrirlash</button>` : ''}`);
}

function openAddPatient() {
  const doctorOptions = doctorsList.map(d =>
    `<option value="${d.id}">Dr. ${d.firstName} ${d.lastName} — ${d.specialization}</option>`
  ).join('');

  showModal('➕ Yangi bemor ro\'yxatga olish', `
    <div class="form-grid form-grid-2">
      <div class="form-group">
        <label class="form-label">Ism <span class="req">*</span></label>
        <input id="pf_firstName" class="form-control" placeholder="Alisher">
      </div>
      <div class="form-group">
        <label class="form-label">Familiya <span class="req">*</span></label>
        <input id="pf_lastName" class="form-control" placeholder="Nazarov">
      </div>
      <div class="form-group">
        <label class="form-label">Tug'ilgan sana <span class="req">*</span></label>
        <input id="pf_dob" class="form-control" type="date">
      </div>
      <div class="form-group">
        <label class="form-label">Jins <span class="req">*</span></label>
        <select id="pf_gender" class="form-control">
          <option value="">Tanlang</option>
          <option value="male">Erkak</option>
          <option value="female">Ayol</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Telefon <span class="req">*</span></label>
        <input id="pf_phone" class="form-control" placeholder="+998901234567">
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input id="pf_email" class="form-control" type="email" placeholder="bemor@email.com">
      </div>
      <div class="form-group">
        <label class="form-label">Qon guruhi</label>
        <select id="pf_blood" class="form-control">
          <option value="">Noma'lum</option>
          ${['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => `<option value="${b}">${b}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Shifokor <span class="req">*</span></label>
        <select id="pf_doctor" class="form-control">
          <option value="">Shifokor tanlang</option>
          ${doctorOptions}
        </select>
      </div>
      <div class="form-group" style="grid-column:1/-1">
        <label class="form-label">Manzil</label>
        <input id="pf_address" class="form-control" placeholder="Toshkent, Yunusobod, 15-uy">
      </div>
      <div class="form-group" style="grid-column:1/-1">
        <label class="form-label">Favqulodda aloqa</label>
        <input id="pf_emergency" class="form-control" placeholder="Ism Familiya: +998901234567">
      </div>
    </div>
  `,
  `<button class="btn btn-secondary" onclick="closeModal()">Bekor qilish</button>
   <button class="btn btn-primary" onclick="submitAddPatient()">Ro'yxatga olish</button>`);
}

async function submitAddPatient() {
  const data = {
    firstName: document.getElementById('pf_firstName').value.trim(),
    lastName: document.getElementById('pf_lastName').value.trim(),
    dateOfBirth: document.getElementById('pf_dob').value,
    gender: document.getElementById('pf_gender').value,
    phone: document.getElementById('pf_phone').value.trim(),
    email: document.getElementById('pf_email').value.trim(),
    bloodType: document.getElementById('pf_blood').value || "Noma'lum",
    doctorId: document.getElementById('pf_doctor').value,
    address: document.getElementById('pf_address').value.trim(),
    emergencyContact: document.getElementById('pf_emergency').value.trim()
  };
  const res = await api.post('/patients', data);
  if (res.ok) {
    showToast('Bemor muvaffaqiyatli ro\'yxatga olindi', 'success');
    closeModal();
    renderPatients();
  } else {
    showToast(res.data.message, 'error');
  }
}

async function openEditPatient(id) {
  const res = await api.get(`/patients/${id}`);
  if (!res.ok) return;
  const p = res.data.data;
  const doctorOptions = doctorsList.map(d =>
    `<option value="${d.id}" ${d.id===p.doctorId?'selected':''}>Dr. ${d.firstName} ${d.lastName} — ${d.specialization}</option>`
  ).join('');

  showModal('✏️ Bemorni tahrirlash', `
    <div class="form-grid form-grid-2">
      <div class="form-group">
        <label class="form-label">Ism</label>
        <input id="pe_firstName" class="form-control" value="${p.firstName}">
      </div>
      <div class="form-group">
        <label class="form-label">Familiya</label>
        <input id="pe_lastName" class="form-control" value="${p.lastName}">
      </div>
      <div class="form-group">
        <label class="form-label">Telefon</label>
        <input id="pe_phone" class="form-control" value="${p.phone}">
      </div>
      <div class="form-group">
        <label class="form-label">Holat</label>
        <select id="pe_status" class="form-control">
          <option value="active" ${p.status==='active'?'selected':''}>Faol</option>
          <option value="inactive" ${p.status==='inactive'?'selected':''}>Faolsiz</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Qon guruhi</label>
        <select id="pe_blood" class="form-control">
          ${['A+','A-','B+','B-','AB+','AB-','O+','O-',"Noma'lum"].map(b => `<option value="${b}" ${p.bloodType===b?'selected':''}>${b}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Shifokor</label>
        <select id="pe_doctor" class="form-control">${doctorOptions}</select>
      </div>
      <div class="form-group" style="grid-column:1/-1">
        <label class="form-label">Manzil</label>
        <input id="pe_address" class="form-control" value="${p.address || ''}">
      </div>
    </div>
  `,
  `<button class="btn btn-secondary" onclick="closeModal()">Bekor qilish</button>
   <button class="btn btn-primary" onclick="submitEditPatient('${id}')">Yangilash</button>`);
}

async function submitEditPatient(id) {
  const data = {
    firstName: document.getElementById('pe_firstName').value,
    lastName: document.getElementById('pe_lastName').value,
    phone: document.getElementById('pe_phone').value,
    status: document.getElementById('pe_status').value,
    bloodType: document.getElementById('pe_blood').value,
    doctorId: document.getElementById('pe_doctor').value,
    address: document.getElementById('pe_address').value
  };
  const res = await api.put(`/patients/${id}`, data);
  if (res.ok) {
    showToast('Bemor ma\'lumotlari yangilandi', 'success');
    closeModal();
    renderPatients();
  } else {
    showToast(res.data.message, 'error');
  }
}

function confirmDeletePatient(id, name) {
  showConfirm(name, 'Bemorni o\'chirishni tasdiqlaysizmi? Barcha kasallik yozuvlari ham o\'chiriladi.', async () => {
    const res = await api.delete(`/patients/${id}`);
    if (res.ok) {
      showToast(res.data.message, 'success');
      renderPatients();
    } else {
      showToast(res.data.message, 'error');
    }
  });
}

// ─── ILLNESSES PAGE ───────────────────────────────────────────────────────────
let illnessesData = [];
async function renderIllnesses() {
  const [iRes, pRes] = await Promise.all([api.get('/illnesses'), api.get('/patients')]);
  if (!iRes.ok) { showToast('Kasalliklarni yuklashda xato', 'error'); return; }
  illnessesData = iRes.data.data;
  patientsData = pRes.ok ? pRes.data.data : patientsData;
  renderIllnessTable(illnessesData);
}

function renderIllnessTable(illnesses) {
  document.getElementById('mainContent').innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">🩺 Kasallik / Tashxis yozuvlari</h1>
        <p class="page-subtitle">${illnesses.length} ta yozuv</p>
      </div>
      <div class="page-actions">
        ${canManageIllnesses() ? `<button class="btn btn-primary" onclick="openAddIllness()">+ Tashxis qo'shish</button>` : ''}
      </div>
    </div>

    <div class="table-card">
      <div class="table-header">
        <div class="table-filters">
          <input class="filter-input" placeholder="🔍 ICD kod, tavsif..." id="illSearch" oninput="filterIllnesses()" style="width:200px">
          <select class="filter-select" id="illSevFilter" onchange="filterIllnesses()">
            <option value="">Barcha darajalar</option>
            <option value="low">Yengil</option>
            <option value="medium">O'rta</option>
            <option value="high">Og'ir</option>
            <option value="critical">Kritik</option>
          </select>
          <select class="filter-select" id="illStatusFilter" onchange="filterIllnesses()">
            <option value="">Barcha holatlar</option>
            <option value="ongoing">Davom etmoqda</option>
            <option value="resolved">Tuzalgan</option>
            <option value="chronic">Surunkali</option>
          </select>
        </div>
      </div>
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>ICD Kodi</th>
              <th>Tavsif</th>
              <th>Bemor</th>
              <th>Og'irlik</th>
              <th>Holat</th>
              <th>Tashxis sanasi</th>
              ${canManageIllnesses() ? '<th>Amallar</th>' : ''}
            </tr>
          </thead>
          <tbody id="illnessTableBody">
            ${renderIllnessRows(illnesses)}
          </tbody>
        </table>
      </div>
      ${illnesses.length === 0 ? `<div class="empty-state"><div class="empty-icon">🩺</div><div class="empty-title">Kasallik yozuvlari topilmadi</div></div>` : ''}
    </div>
  `;
}

function renderIllnessRows(illnesses) {
  return illnesses.map(ill => `
    <tr>
      <td><span class="font-mono" style="font-size:13px;font-weight:700;color:var(--accent)">${ill.icdCode}</span></td>
      <td style="max-width:260px">
        <div class="truncate" style="font-size:13px">${ill.description}</div>
        ${ill.treatment ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px">💊 ${ill.treatment.substring(0,50)}...</div>` : ''}
      </td>
      <td>
        <div style="font-weight:500;font-size:13px">${ill.patientName}</div>
        <div style="font-size:11px;color:var(--text-muted)">${ill.doctorName}</div>
      </td>
      <td>${getSeverityBadge(ill.severity)}</td>
      <td>${getStatusBadge(ill.status)}</td>
      <td style="font-size:12px;color:var(--text-muted)">${formatDate(ill.diagnosisDate)}</td>
      ${canManageIllnesses() ? `
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-secondary btn-sm" onclick="openEditIllness('${ill.id}')">✏️</button>
          ${isAdmin() ? `<button class="btn btn-danger btn-sm" onclick="confirmDeleteIllness('${ill.id}')">🗑</button>` : ''}
        </div>
      </td>` : ''}
    </tr>
  `).join('');
}

function filterIllnesses() {
  const q = document.getElementById('illSearch').value.toLowerCase();
  const sev = document.getElementById('illSevFilter').value;
  const status = document.getElementById('illStatusFilter').value;
  const filtered = illnessesData.filter(i =>
    (!q || `${i.icdCode} ${i.description} ${i.patientName}`.toLowerCase().includes(q)) &&
    (!sev || i.severity === sev) &&
    (!status || i.status === status)
  );
  document.getElementById('illnessTableBody').innerHTML = renderIllnessRows(filtered);
}

function openAddIllness(prePatientId = '') {
  const patOptions = patientsData.map(p =>
    `<option value="${p.id}" ${p.id===prePatientId?'selected':''}>${p.firstName} ${p.lastName} — ${p.phone}</option>`
  ).join('');
  showModal('➕ Yangi tashxis yozuvi', `
    <div class="form-grid form-grid-2">
      <div class="form-group" style="grid-column:1/-1">
        <label class="form-label">Bemor <span class="req">*</span></label>
        <select id="if_patient" class="form-control">
          <option value="">Bemor tanlang</option>
          ${patOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">ICD Kodi <span class="req">*</span></label>
        <input id="if_icd" class="form-control" placeholder="I10, E11, G43...">
      </div>
      <div class="form-group">
        <label class="form-label">Og'irlik darajasi <span class="req">*</span></label>
        <select id="if_severity" class="form-control">
          <option value="">Tanlang</option>
          <option value="low">Yengil</option>
          <option value="medium">O'rta</option>
          <option value="high">Og'ir</option>
          <option value="critical">Kritik</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Tashxis sanasi <span class="req">*</span></label>
        <input id="if_date" class="form-control" type="date" value="${new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group">
        <label class="form-label">Holat</label>
        <select id="if_status" class="form-control">
          <option value="ongoing">Davom etmoqda</option>
          <option value="resolved">Tuzalgan</option>
          <option value="chronic">Surunkali</option>
          <option value="referred">Yo'llanma</option>
        </select>
      </div>
      <div class="form-group" style="grid-column:1/-1">
        <label class="form-label">Tavsif <span class="req">*</span></label>
        <textarea id="if_description" class="form-control" rows="3" placeholder="Kasallik belgilari va tashxis tavsifi..."></textarea>
      </div>
      <div class="form-group" style="grid-column:1/-1">
        <label class="form-label">Davo rejasi</label>
        <textarea id="if_treatment" class="form-control" rows="2" placeholder="Dori-darmonlar, muolajalar..."></textarea>
      </div>
      <div class="form-group" style="grid-column:1/-1">
        <label class="form-label">Izohlar</label>
        <input id="if_notes" class="form-control" placeholder="Qo'shimcha izohlar...">
      </div>
    </div>
  `,
  `<button class="btn btn-secondary" onclick="closeModal()">Bekor qilish</button>
   <button class="btn btn-primary" onclick="submitAddIllness()">Saqlash</button>`);
}

function openAddIllnessForPatient(patientId) {
  navigateTo('illnesses');
  setTimeout(() => openAddIllness(patientId), 600);
}

async function submitAddIllness() {
  const data = {
    patientId: document.getElementById('if_patient').value,
    icdCode: document.getElementById('if_icd').value.trim().toUpperCase(),
    severity: document.getElementById('if_severity').value,
    diagnosisDate: document.getElementById('if_date').value,
    status: document.getElementById('if_status').value,
    description: document.getElementById('if_description').value.trim(),
    treatment: document.getElementById('if_treatment').value.trim(),
    notes: document.getElementById('if_notes').value.trim()
  };
  const res = await api.post('/illnesses', data);
  if (res.ok) {
    showToast('Tashxis yozuvi saqlandi', 'success');
    closeModal();
    renderIllnesses();
  } else {
    showToast(res.data.message, 'error');
  }
}

async function openEditIllness(id) {
  const res = await api.get(`/illnesses/${id}`);
  if (!res.ok) return;
  const ill = res.data.data;
  showModal('✏️ Tashxis yozuvini tahrirlash', `
    <div class="form-grid form-grid-2">
      <div class="form-group">
        <label class="form-label">ICD Kodi</label>
        <input id="ie_icd" class="form-control" value="${ill.icdCode}">
      </div>
      <div class="form-group">
        <label class="form-label">Og'irlik darajasi</label>
        <select id="ie_severity" class="form-control">
          ${['low','medium','high','critical'].map(s => `<option value="${s}" ${ill.severity===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Holat</label>
        <select id="ie_status" class="form-control">
          ${['ongoing','resolved','chronic','referred'].map(s => `<option value="${s}" ${ill.status===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Tashxis sanasi</label>
        <input id="ie_date" class="form-control" type="date" value="${ill.diagnosisDate}">
      </div>
      <div class="form-group" style="grid-column:1/-1">
        <label class="form-label">Tavsif</label>
        <textarea id="ie_description" class="form-control" rows="3">${ill.description}</textarea>
      </div>
      <div class="form-group" style="grid-column:1/-1">
        <label class="form-label">Davo rejasi</label>
        <textarea id="ie_treatment" class="form-control" rows="2">${ill.treatment || ''}</textarea>
      </div>
      <div class="form-group" style="grid-column:1/-1">
        <label class="form-label">Izohlar</label>
        <input id="ie_notes" class="form-control" value="${ill.notes || ''}">
      </div>
    </div>
  `,
  `<button class="btn btn-secondary" onclick="closeModal()">Bekor qilish</button>
   <button class="btn btn-primary" onclick="submitEditIllness('${id}')">Yangilash</button>`);
}

async function submitEditIllness(id) {
  const data = {
    icdCode: document.getElementById('ie_icd').value.toUpperCase(),
    severity: document.getElementById('ie_severity').value,
    status: document.getElementById('ie_status').value,
    diagnosisDate: document.getElementById('ie_date').value,
    description: document.getElementById('ie_description').value,
    treatment: document.getElementById('ie_treatment').value,
    notes: document.getElementById('ie_notes').value
  };
  const res = await api.put(`/illnesses/${id}`, data);
  if (res.ok) {
    showToast('Tashxis yozuvi yangilandi', 'success');
    closeModal();
    renderIllnesses();
  } else {
    showToast(res.data.message, 'error');
  }
}

function confirmDeleteIllness(id) {
  showConfirm('Tashxis yozuvi', 'Bu yozuvni o\'chirishni tasdiqlaysizmi?', async () => {
    const res = await api.delete(`/illnesses/${id}`);
    if (res.ok) {
      showToast(res.data.message, 'success');
      renderIllnesses();
    } else {
      showToast(res.data.message, 'error');
    }
  });
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
function renderProfile() {
  document.getElementById('mainContent').innerHTML = `
    <div class="page-header">
      <h1 class="page-title">👤 Mening profilim</h1>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:800px">
      <div class="card" style="grid-column:1/-1">
        <div style="display:flex;align-items:center;gap:20px">
          <div class="avatar avatar-xl ${getAvatarColor(currentUser.id)}">${getInitials(currentUser.name.split(' ')[0], currentUser.name.split(' ')[1]||'')}</div>
          <div>
            <h2 style="font-size:20px;font-weight:800">${currentUser.name}</h2>
            <div style="margin-top:6px">${getRoleBadge(currentUser.role)}</div>
            <p style="font-size:13px;color:var(--text-muted);margin-top:6px">📧 ${currentUser.email}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 style="font-size:14px;font-weight:700;margin-bottom:14px">🔑 Kirish huquqlari</h3>
        ${[
          ['👨‍⚕️ Shifokorlar — ko\'rish', true],
          ['👨‍⚕️ Shifokorlar — boshqarish', isAdmin()],
          ['🧑 Bemorlar — ko\'rish', true],
          ['🧑 Bemorlar — boshqarish', isAdmin() || isClinician()],
          ['🩺 Kasalliklar — ko\'rish', true],
          ['🩺 Kasalliklar — boshqarish', isAdmin() || isClinician()],
          ['⚙️ Tizim sozlamalari', isAdmin()],
        ].map(([label, allowed]) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border);font-size:13px">
            <span style="color:var(--text-secondary)">${label}</span>
            <span style="${allowed?'color:var(--success)':'color:var(--text-muted)'}">${allowed ? '✓ Ruxsat' : '✗ Ruxsat yo\'q'}</span>
          </div>
        `).join('')}
      </div>

      <div class="card">
        <h3 style="font-size:14px;font-weight:700;margin-bottom:14px">ℹ️ Hisob ma'lumotlari</h3>
        <div style="display:flex;flex-direction:column;gap:10px;font-size:13px">
          <div>
            <div style="font-size:11px;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Foydalanuvchi nomi</div>
            <div style="font-weight:600;margin-top:2px">${currentUser.username}</div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Rol</div>
            <div style="font-weight:600;margin-top:2px">${currentUser.role === 'admin' ? 'Administrator' : currentUser.role === 'clinician' ? 'Klinitsist' : 'Qabulxona xodimi'}</div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Email</div>
            <div style="font-weight:600;margin-top:2px">${currentUser.email}</div>
          </div>
        </div>
        <button class="btn btn-danger" style="margin-top:20px;width:100%" onclick="logout()">
          🚪 Tizimdan chiqish
        </button>
      </div>
    </div>
  `;
}
