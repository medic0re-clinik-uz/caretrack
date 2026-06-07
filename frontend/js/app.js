// ─── API CLIENT ───────────────────────────────────────────────────────────────
const API_BASE = '/api';
let currentPage = 'dashboard';
let currentUser = null;
let sidebarCollapsed = false;
let searchTimeout = null;

// Axios-like fetch wrapper
const api = {
  async request(method, path, data = null) {
    const token = localStorage.getItem('ct_token');
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    if (data) opts.body = JSON.stringify(data);

    const resp = await fetch(`${API_BASE}${path}`, opts);
    const json = await resp.json();

    if (resp.status === 401) {
      logout();
      throw new Error('Sessiya tugagan');
    }
    return { status: resp.status, data: json, ok: resp.ok };
  },
  get: (path) => api.request('GET', path),
  post: (path, data) => api.request('POST', path, data),
  put: (path, data) => api.request('PUT', path, data),
  delete: (path) => api.request('DELETE', path),
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────
async function login(username, password) {
  const res = await api.post('/auth/login', { username, password });
  if (res.ok) {
    localStorage.setItem('ct_token', res.data.token);
    localStorage.setItem('ct_user', JSON.stringify(res.data.user));
    currentUser = res.data.user;
    initApp();
  }
  return res;
}

function logout() {
  localStorage.removeItem('ct_token');
  localStorage.removeItem('ct_user');
  currentUser = null;
  showLoginPage();
}

function checkAuth() {
  const token = localStorage.getItem('ct_token');
  const user = localStorage.getItem('ct_user');
  if (token && user) {
    currentUser = JSON.parse(user);
    return true;
  }
  return false;
}

// ─── THEME ────────────────────────────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('ct_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('ct_theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggle');
  if (btn) btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${message}</span>
    <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function showModal(title, bodyHTML, footerHTML = '') {
  const existing = document.getElementById('globalModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'globalModal';
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">${title}</span>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">${bodyHTML}</div>
      ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
    </div>
  `;
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.body.appendChild(modal);
}

function closeModal() {
  const modal = document.getElementById('globalModal');
  if (modal) modal.remove();
}

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
function showConfirm(title, text, onConfirm) {
  showModal(
    '⚠️ Tasdiqlash kerak',
    `<div class="confirm-icon">🗑️</div>
     <p class="confirm-text"><strong>${title}</strong><br/>${text}</p>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Bekor qilish</button>
     <button class="btn btn-danger" onclick="(${onConfirm.toString()})(); closeModal()">O'chirish</button>`
  );
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
  const content = document.getElementById('mainContent');
  content.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;padding:60px"><div class="spinner"></div></div>';

  const titles = {
    dashboard: 'Bosh sahifa',
    doctors: 'Shifokorlar',
    patients: 'Bemorlar',
    illnesses: 'Kasalliklar',
    profile: 'Mening profilim'
  };
  document.getElementById('topbarTitle').textContent = titles[page] || page;

  switch(page) {
    case 'dashboard': renderDashboard(); break;
    case 'doctors': renderDoctors(); break;
    case 'patients': renderPatients(); break;
    case 'illnesses': renderIllnesses(); break;
    case 'profile': renderProfile(); break;
  }
}

// ─── SIDEBAR TOGGLE ──────────────────────────────────────────────────────────
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebarCollapsed = !sidebarCollapsed;
  sidebar.classList.toggle('collapsed', sidebarCollapsed);
}

// ─── GLOBAL SEARCH ────────────────────────────────────────────────────────────
function setupSearch() {
  const input = document.getElementById('globalSearch');
  const results = document.getElementById('searchResults');

  input.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const q = input.value.trim();
    if (q.length < 2) { results.classList.remove('visible'); return; }

    searchTimeout = setTimeout(async () => {
      const res = await api.get(`/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return;
      const { doctors, patients, illnesses } = res.data.results;

      if (!doctors.length && !patients.length && !illnesses.length) {
        results.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px">Natija topilmadi</div>`;
        results.classList.add('visible');
        return;
      }

      let html = '';
      if (doctors.length) {
        html += `<div class="search-result-group"><div class="search-result-group-title">👨‍⚕️ Shifokorlar</div>`;
        doctors.forEach(d => {
          html += `<div class="search-result-item" onclick="navigateTo('doctors')">
            <span class="search-result-icon">👨‍⚕️</span>
            <div>
              <div class="search-result-name">Dr. ${d.firstName} ${d.lastName}</div>
              <div class="search-result-sub">${d.specialization} · ${d.department}</div>
            </div>
          </div>`;
        });
        html += `</div>`;
      }
      if (patients.length) {
        html += `<div class="search-result-group"><div class="search-result-group-title">🧑 Bemorlar</div>`;
        patients.forEach(p => {
          html += `<div class="search-result-item" onclick="openPatientProfile('${p.id}')">
            <span class="search-result-icon">🧑</span>
            <div>
              <div class="search-result-name">${p.firstName} ${p.lastName}</div>
              <div class="search-result-sub">${p.doctorName} · ${p.phone}</div>
            </div>
          </div>`;
        });
        html += `</div>`;
      }
      if (illnesses.length) {
        html += `<div class="search-result-group"><div class="search-result-group-title">🩺 Kasalliklar</div>`;
        illnesses.forEach(i => {
          html += `<div class="search-result-item" onclick="navigateTo('illnesses')">
            <span class="search-result-icon">🩺</span>
            <div>
              <div class="search-result-name">${i.icdCode}: ${i.description.substring(0, 40)}...</div>
              <div class="search-result-sub">${i.patientName}</div>
            </div>
          </div>`;
        });
        html += `</div>`;
      }

      results.innerHTML = html;
      results.classList.add('visible');
    }, 300);
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !results.contains(e.target)) {
      results.classList.remove('visible');
    }
  });
}

// ─── ROLE CHECKS ─────────────────────────────────────────────────────────────
function isAdmin() { return currentUser?.role === 'admin'; }
function isClinician() { return currentUser?.role === 'clinician'; }
function isReceptionist() { return currentUser?.role === 'receptionist'; }
function canManageDoctors() { return isAdmin(); }
function canManagePatients() { return isAdmin() || isClinician(); }
function canManageIllnesses() { return isAdmin() || isClinician(); }

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('uz-UZ', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });
}

function getAge(dob) {
  if (!dob) return '—';
  const age = Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 3600 * 1000));
  return `${age} yosh`;
}

function getInitials(firstName, lastName) {
  return `${(firstName || '?')[0]}${(lastName || '?')[0]}`.toUpperCase();
}

function getSeverityBadge(severity) {
  const map = {
    low: ['badge-low', 'Yengil'],
    medium: ['badge-medium', 'O\'rta'],
    high: ['badge-high', 'Og\'ir'],
    critical: ['badge-critical', '🔴 Kritik']
  };
  const [cls, label] = map[severity] || ['badge-inactive', severity];
  return `<span class="badge ${cls}">${label}</span>`;
}

function getStatusBadge(status) {
  const map = {
    active: ['badge-active', '● Faol'],
    inactive: ['badge-inactive', '○ Faolsiz'],
    ongoing: ['badge-ongoing', '● Davom etmoqda'],
    resolved: ['badge-resolved', '✓ Tuzalgan'],
    chronic: ['badge-medium', '~ Surunkali'],
    referred: ['badge-admin', '→ Yo\'llanma']
  };
  const [cls, label] = map[status] || ['badge-inactive', status];
  return `<span class="badge ${cls}">${label}</span>`;
}

function getRoleBadge(role) {
  const map = {
    admin: ['badge-admin', '🔑 Administrator'],
    clinician: ['badge-clinician', '👨‍⚕️ Klinitsist'],
    receptionist: ['badge-receptionist', '📋 Qabulxona']
  };
  const [cls, label] = map[role] || ['badge-inactive', role];
  return `<span class="badge ${cls}">${label}</span>`;
}

const avatarColors = ['avatar-blue', 'avatar-green', 'avatar-orange', 'avatar-red', 'avatar-purple'];
function getAvatarColor(id) {
  const idx = (id || '').charCodeAt(0) % avatarColors.length;
  return avatarColors[idx];
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  if (checkAuth()) {
    initApp();
  } else {
    showLoginPage();
  }
});
