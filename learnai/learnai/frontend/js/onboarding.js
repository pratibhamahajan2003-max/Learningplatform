/* onboarding.js */

let obStep = 0;
const selectedTopics = [];
let selectedLevel = 'Beginner';
let selectedGoal = '';

function nextOb() {
  if (obStep === 1) {
    if (!document.getElementById('ob-name').value.trim()) {
      toast('Please enter your name!', 'err'); return;
    }
  }
  if (obStep === 2 && !selectedLevel) {
    toast('Please select your level!', 'err'); return;
  }
  obStep++;
  setObStep(obStep);
}
function prevOb() { obStep = Math.max(0, obStep - 1); setObStep(obStep); }

function setObStep(n) {
  document.querySelectorAll('.ob-step').forEach((s, i) => {
    s.classList.toggle('active', i === n);
  });
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === n);
  });
}

// Topic chips
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.topic-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      const t = chip.dataset.topic;
      const idx = selectedTopics.indexOf(t);
      if (idx === -1) selectedTopics.push(t);
      else selectedTopics.splice(idx, 1);
    });
  });

  document.querySelectorAll('.level-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.level-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedLevel = card.dataset.level;
    });
  });

  document.querySelectorAll('.goal-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.goal-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      selectedGoal = item.dataset.goal;
    });
  });
});

async function completeOnboarding() {
  const name = document.getElementById('ob-name').value.trim() || 'Learner';
  const email = document.getElementById('ob-email').value.trim();

  const btn = document.getElementById('start-btn');
  btn.textContent = '⏳ Setting up...';
  btn.disabled = true;

  const res = await API.register({
    name, email,
    topics: selectedTopics.length ? selectedTopics : ['Python'],
    skill_level: selectedLevel,
    goal: selectedGoal
  });

  if (res.error) {
    toast('Could not connect to backend. Is it running?', 'err');
    btn.textContent = '🚀 Launch My Dashboard';
    btn.disabled = false;
    return;
  }

  STATE.setUser(res.user);
  document.getElementById('onboarding').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  showPage('dashboard');
  toast(`Welcome, ${name}! 🎉 Your learning journey starts now!`, 'ok', 4000);
}
