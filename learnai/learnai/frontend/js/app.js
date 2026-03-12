/* app.js — Bootstrap and page loader */

// ── Page loader ───────────────────────────────────────────────
async function loadPage(name) {
  switch (name) {
    case 'dashboard':   await renderDashboard(); break;
    case 'courses':     await renderCourses(); break;
    case 'quiz':        await renderQuiz(); break;
    case 'tutor':       await renderTutor(); break;
    case 'progress':    await renderProgress(); break;
    case 'path':        await renderPath(); break;
    case 'leaderboard': await renderLeaderboard(); break;
  }
}

// ── App boot ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Check if already logged in
  const exists = STATE.load();
  if (exists && STATE.token) {
    // Try to refresh user from backend
    const res = await API.login(STATE.token);
    if (!res.error) {
      STATE.setUser(res.user);
      document.getElementById('onboarding').classList.add('hidden');
      document.getElementById('app').classList.remove('hidden');
      showPage('dashboard');
      return;
    }
    // Token expired/invalid, clear and show onboarding
    STATE.clear();
  }
  // Show onboarding
});
