/* state.js — App-wide state */

const STATE = {
  user: null,
  token: null,
  quizQuestions: [],
  quizAnswers: {},
  quizIndex: 0,
  quizActive: false,
  timerInterval: null,
  timerSec: 30,

  // Persist to localStorage
  save() {
    if (this.token) localStorage.setItem('learnai_token', this.token);
    if (this.user)  localStorage.setItem('learnai_user', JSON.stringify(this.user));
  },
  load() {
    this.token = localStorage.getItem('learnai_token');
    const u = localStorage.getItem('learnai_user');
    if (u) try { this.user = JSON.parse(u); } catch(e){}
    return !!this.token;
  },
  clear() {
    localStorage.removeItem('learnai_token');
    localStorage.removeItem('learnai_user');
    this.user = null; this.token = null;
  },

  // Sync user data from server response
  setUser(user) {
    this.user = user;
    this.token = user.id;
    this.save();
    updateSidebarUI();
  }
};

// ── Update sidebar UI from state ────────────────────────────────
function updateSidebarUI() {
  const u = STATE.user;
  if (!u) return;
  const xpPct = Math.min(100, Math.round(u.xp / (u.xp_max || 500) * 100));
  document.getElementById('sb-av').textContent    = u.avatar || u.name[0].toUpperCase();
  document.getElementById('sb-name').textContent  = u.name;
  document.getElementById('sb-lvl').textContent   = `Level ${u.level} · ${getLevelTitle(u.level)}`;
  document.getElementById('sb-xp-fill').style.width = xpPct + '%';
  document.getElementById('sb-xp-txt').textContent  = `${u.xp} / ${u.xp_max || 500}`;
  document.getElementById('sb-streak').textContent  = `🔥 ${u.streak}`;
  document.getElementById('tb-xp').textContent      = u.xp;
  document.getElementById('tb-streak').textContent  = u.streak;
}

function getLevelTitle(lvl) {
  const t = ['','Novice','Explorer','Learner','Practitioner','Enthusiast','Developer','Expert','Master','Guru','Legend'];
  return t[Math.min(lvl, 10)] || 'Legend';
}

// ── Toast ────────────────────────────────────────────────────────
function toast(msg, type='ok', dur=3000) {
  const c = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = { ok:'✅', err:'❌', info:'ℹ️' };
  el.innerHTML = `<span>${icons[type]||'📢'}</span> ${msg}`;
  c.appendChild(el);
  setTimeout(() => el.remove(), dur);
}

// ── Navigation ───────────────────────────────────────────────────
const PAGE_TITLES = {
  dashboard: 'Dashboard', courses: 'Courses', quiz: 'Daily Quiz',
  tutor: 'AI Tutor', progress: 'Progress', path: 'Learning Path', leaderboard: 'Leaderboard'
};

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const page = document.getElementById('page-' + name);
  if (page) { page.classList.add('active'); loadPage(name); }
  const navItem = document.querySelector(`.nav-item[data-page="${name}"]`);
  if (navItem) navItem.classList.add('active');
  document.getElementById('tb-title').textContent = PAGE_TITLES[name] || name;
  if (window.innerWidth < 860) document.getElementById('sidebar').classList.remove('open');
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// Close modal on overlay click
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('lesson-modal')?.addEventListener('click', e => {
    if (e.target.id === 'lesson-modal') closeModal();
  });
  document.getElementById('notif-btn')?.addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('notif-drop').classList.toggle('open');
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.notif-wrap')) {
      document.getElementById('notif-drop')?.classList.remove('open');
    }
  });
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => showPage(item.dataset.page));
  });
});

function closeModal() {
  document.getElementById('lesson-modal').classList.remove('open');
}
