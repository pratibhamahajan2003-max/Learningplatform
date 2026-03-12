/* pages.js — Render each page */

const COLORS = ['#22d3ee','#818cf8','#fbbf24','#34d399','#f472b6','#fb923c'];

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
async function renderDashboard() {
  const uid = STATE.token;
  const el = document.getElementById('page-dashboard');
  el.innerHTML = `<div class="spinner"></div>`;

  const [stats, courses, progress, recs] = await Promise.all([
    API.getStats(uid),
    API.getCourses(uid),
    API.getProgress(uid),
    API.getRecs(uid)
  ]);

  const inProgress = courses.filter ? courses.filter(c => c.status === 'in_progress') : [];
  const u = STATE.user;

  el.innerHTML = `
    <!-- HERO -->
    <div class="hero">
      <div class="hero-eyebrow">👋 Welcome back</div>
      <h1 class="hero-title">Keep the momentum, <span>${u.name}</span>!</h1>
      <p class="hero-sub">
        ${u.streak > 0 ? `🔥 You're on a ${u.streak}-day streak. ` : ''}
        You've completed ${stats.lessons_completed || 0} lessons with ${stats.avg_quiz_score || 0}% quiz accuracy.
      </p>
      <div class="hero-actions">
        <button class="btn-primary" onclick="showPage('courses')">▶ Continue Learning</button>
        <button class="btn-ghost" onclick="showPage('quiz')">🎯 Take a Quiz</button>
        <button class="btn-ghost" onclick="showPage('tutor')">🤖 Ask AI Tutor</button>
      </div>
    </div>

    <!-- STATS ROW -->
    <div class="g4" style="margin-bottom:24px">
      <div class="stat-card sc-cyan">
        <div class="stat-ico">📚</div>
        <div class="stat-val">${stats.courses_enrolled || 0}</div>
        <div class="stat-lbl">Courses Enrolled</div>
        <div class="stat-tag tag-up">↑ Active</div>
      </div>
      <div class="stat-card sc-violet">
        <div class="stat-ico">✅</div>
        <div class="stat-val">${stats.lessons_completed || 0}</div>
        <div class="stat-lbl">Lessons Done</div>
        <div class="stat-tag tag-up">↑ Keep going</div>
      </div>
      <div class="stat-card sc-emerald">
        <div class="stat-ico">🎯</div>
        <div class="stat-val">${stats.avg_quiz_score || 0}%</div>
        <div class="stat-lbl">Quiz Accuracy</div>
        <div class="stat-tag tag-up">↑ AI-tracked</div>
      </div>
      <div class="stat-card sc-amber">
        <div class="stat-ico">⚡</div>
        <div class="stat-val">${stats.total_xp || 0}</div>
        <div class="stat-lbl">Total XP</div>
        <div class="stat-tag tag-up">↑ Earning</div>
      </div>
    </div>

    <!-- MAIN GRID -->
    <div class="g2" style="margin-bottom:24px">
      <div>
        <div class="sec-hd">
          <div class="sec-title">Continue Learning</div>
          <span class="sec-link" onclick="showPage('courses')">All Courses →</span>
        </div>
        ${inProgress.length ? inProgress.slice(0,3).map(c => `
          <div class="card" style="margin-bottom:11px;cursor:pointer;display:flex;gap:13px;align-items:center"
            onclick="openLessonModal('${c.id}')">
            <div style="width:42px;height:42px;border-radius:11px;background:${c.color}22;
              display:grid;place-items:center;font-size:22px;flex-shrink:0;border:1px solid ${c.color}33">
              ${c.icon}
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:600;margin-bottom:4px">${c.title}</div>
              <div class="cc-bar"><div class="cc-fill" style="width:${c.progress||0}%;background:${c.color}"></div></div>
              <div style="font-size:11px;color:var(--muted)">${c.done_lessons||0}/${c.lessons} lessons • ${c.progress||0}%</div>
            </div>
          </div>`).join('') : `<div class="card" style="text-align:center;padding:28px;color:var(--muted)">
            <div style="font-size:32px;margin-bottom:8px">📚</div>
            No courses in progress yet.
            <div style="margin-top:12px"><button class="btn-primary btn-sm" onclick="showPage('courses')">Browse Courses</button></div>
          </div>`}
      </div>

      <div>
        <div class="sec-hd"><div class="sec-title">📅 Activity Heatmap</div></div>
        <div class="card">
          <div style="font-size:12px;color:var(--muted);margin-bottom:10px">Last 3 months</div>
          <div class="heatmap" id="heatmap-cells"></div>
          <div style="display:flex;align-items:center;gap:5px;margin-top:9px;font-size:10px;color:var(--muted)">
            Less
            <div class="hcell"></div><div class="hcell l1"></div><div class="hcell l2"></div><div class="hcell l3"></div><div class="hcell l4"></div>
            More
          </div>
        </div>

        <div class="sec-hd" style="margin-top:18px"><div class="sec-title">Weekly XP</div></div>
        <div class="card">
          <div class="mini-bars" id="weekly-bars" style="height:70px"></div>
          <div style="display:flex;gap:4px;margin-top:5px" id="weekly-labels"></div>
        </div>
      </div>
    </div>

    <!-- AI RECS -->
    <div class="sec-hd"><div class="sec-title">🤖 AI Recommendations</div></div>
    <div class="g3" id="recs-grid"></div>

    <!-- BADGES -->
    <div class="sec-hd" style="margin-top:24px"><div class="sec-title">🏅 Achievements</div></div>
    <div class="card" id="badge-strip"></div>
  `;

  // Heatmap
  const hmEl = document.getElementById('heatmap-cells');
  if (progress.heatmap) {
    hmEl.innerHTML = progress.heatmap.map(l => `<div class="hcell ${l?'l'+l:''}"></div>`).join('');
  }

  // Weekly bars
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const wData = progress.weekly_xp || [40,80,60,100,70,120,90];
  const wMax = Math.max(...wData);
  document.getElementById('weekly-bars').innerHTML = wData.map((v,i) =>
    `<div class="mini-bar" style="flex:1;height:${Math.round(v/wMax*100)}%;background:${COLORS[i%COLORS.length]};border-radius:4px 4px 0 0;opacity:.8" data-v="${v} XP"></div>`
  ).join('');
  document.getElementById('weekly-labels').innerHTML = days.map(d =>
    `<div class="mini-bar-lbl">${d}</div>`
  ).join('');

  // Recs
  const recEl = document.getElementById('recs-grid');
  const recData = Array.isArray(recs) ? recs : [];
  if (recData.length) {
    recEl.innerHTML = recData.map(r => `
      <div class="rec-card">
        <div style="font-size:28px">${r.icon}</div>
        <div>
          <div style="font-size:13px;font-weight:700;margin-bottom:3px">${r.title}</div>
          <div style="font-size:12px;color:var(--muted);margin-bottom:7px">${r.reason}</div>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="font-size:11px;font-weight:700;color:var(--emerald)">${r.match_score}% match</div>
            <button class="btn-outline btn-sm" onclick="enrollAndGo('${r.course_id}')">Enroll</button>
          </div>
        </div>
      </div>`).join('');
  } else {
    recEl.innerHTML = `<div class="card" style="grid-column:1/-1;text-align:center;color:var(--muted);padding:20px">Enroll in courses to get AI recommendations!</div>`;
  }

  // Badges
  renderBadgeGrid('badge-strip', STATE.user?.badges || []);
}

// ═══════════════════════════════════════════════════════════════
// COURSES
// ═══════════════════════════════════════════════════════════════
async function renderCourses() {
  const el = document.getElementById('page-courses');
  el.innerHTML = `
    <div class="sec-hd">
      <div class="sec-title">📚 Course Library</div>
    </div>
    <div class="tabs">
      <button class="tab-btn active" onclick="filterCourses('all',this)">All</button>
      <button class="tab-btn" onclick="filterCourses('in_progress',this)">In Progress</button>
      <button class="tab-btn" onclick="filterCourses('completed',this)">Completed</button>
      <button class="tab-btn" onclick="filterCourses('available',this)">Available</button>
    </div>
    <div class="spinner" id="courses-loading"></div>
    <div class="g3" id="courses-grid" style="display:none"></div>
  `;

  const data = await API.getCourses(STATE.token);
  window._coursesData = data;
  document.getElementById('courses-loading').remove();
  document.getElementById('courses-grid').style.display = 'grid';
  renderCourseGrid(data);
}

function filterCourses(status, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const all = window._coursesData || [];
  renderCourseGrid(status === 'all' ? all : all.filter(c => c.status === status));
}

function renderCourseGrid(courses) {
  const el = document.getElementById('courses-grid');
  if (!el) return;
  if (!courses.length) {
    el.innerHTML = `<div class="card" style="grid-column:1/-1;text-align:center;padding:32px;color:var(--muted)">No courses found in this category</div>`;
    return;
  }
  el.innerHTML = courses.map(c => `
    <div class="course-card">
      <div class="cc-thumb" style="background:linear-gradient(135deg,${c.color}20,${c.color}08)">
        <div class="cc-glow" style="background:radial-gradient(circle,${c.color},transparent 70%)"></div>
        <span style="position:relative;z-index:1">${c.icon}</span>
      </div>
      <div class="cc-body">
        <div class="cc-tag" style="background:${c.color}22;color:${c.color}">${c.tag}</div>
        <div class="cc-name">${c.title}</div>
        <div class="cc-meta"><span>📖 ${c.lessons} lessons</span><span>⏱ ${c.duration}</span><span>👥 ${c.enrolled?.toLocaleString()}</span></div>
        <div class="cc-bar"><div class="cc-fill" style="width:${c.progress||0}%;background:${c.color}"></div></div>
        <div class="cc-foot">
          <span>${c.progress||0}% complete</span>
          ${c.enrolled ? `<button class="btn-outline btn-sm" onclick="openLessonModal('${c.id}')">Continue →</button>`
                       : `<button class="btn-primary btn-sm" onclick="enrollCourse('${c.id}')">Enroll</button>`}
        </div>
      </div>
    </div>`).join('');
}

async function enrollCourse(cid) {
  const res = await API.enroll(cid, STATE.token);
  if (res.error) { toast('Could not enroll: ' + res.error, 'err'); return; }
  toast(`✅ Enrolled in ${res.course.title}!`, 'ok');
  renderCourses();
}

async function enrollAndGo(cid) {
  await API.enroll(cid, STATE.token);
  showPage('courses');
}

// ═══════════════════════════════════════════════════════════════
// QUIZ
// ═══════════════════════════════════════════════════════════════
async function renderQuiz() {
  const el = document.getElementById('page-quiz');
  el.innerHTML = `<div class="spinner"></div>`;
  const questions = await API.getQuiz(STATE.token, 5);
  if (!Array.isArray(questions) || !questions.length) {
    el.innerHTML = `<div class="card" style="text-align:center;padding:40px;color:var(--muted)">Could not load quiz. Is the backend running?</div>`;
    return;
  }
  STATE.quizQuestions = questions;
  STATE.quizAnswers = {};
  STATE.quizIndex = 0;

  el.innerHTML = `
    <div class="g2">
      <div>
        <div class="sec-hd">
          <div class="sec-title">🎯 AI-Personalised Quiz</div>
          <div style="font-size:12px;color:var(--muted)">Adaptive difficulty</div>
        </div>
        <div class="quiz-wrap" id="quiz-container"></div>
      </div>
      <div>
        <div class="sec-hd"><div class="sec-title">📊 Quiz Stats</div></div>
        <div class="card" style="margin-bottom:14px">
          <div class="card-title" style="margin-bottom:12px">Accuracy Trend</div>
          <div class="mini-bars" id="quiz-trend-bars" style="height:70px"></div>
          <div style="display:flex;gap:4px;margin-top:5px" id="quiz-trend-labels"></div>
        </div>
        <div class="card">
          <div class="card-title" style="margin-bottom:14px">Topic Performance</div>
          <div id="quiz-skills"></div>
        </div>
        <div class="card" style="margin-top:14px">
          <div class="card-title" style="margin-bottom:12px">⚡ Your Best Scores</div>
          <div class="g2" style="gap:8px">
            ${[['47','Total Quizzes','var(--violet)'],['87%','Avg Score','var(--emerald)'],['12','Best Streak','var(--amber)'],['4.2s','Avg Time','var(--cyan)']].map(([v,l,c])=>`
              <div style="text-align:center;padding:12px;background:var(--surface);border-radius:10px">
                <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:${c}">${v}</div>
                <div style="font-size:11px;color:var(--muted)">${l}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  renderQuizQuestion();

  // Trend bars
  const tData = [72,85,91,78,95,88,93];
  const tMax = 100;
  document.getElementById('quiz-trend-bars').innerHTML = tData.map((v,i) =>
    `<div class="mini-bar" style="flex:1;height:${v}%;background:${v>=90?'var(--emerald)':v>=80?'var(--violet)':'var(--rose)'};border-radius:4px 4px 0 0" data-v="${v}%"></div>`
  ).join('');
  document.getElementById('quiz-trend-labels').innerHTML = ['W1','W2','W3','W4','W5','W6','W7'].map(d =>
    `<div class="mini-bar-lbl">${d}</div>`).join('');

  // Skills
  const skills = [
    {n:'Python',v:88,c:'var(--cyan)'},{n:'ML',v:72,c:'var(--violet)'},
    {n:'Web Dev',v:65,c:'var(--amber)'},{n:'Algorithms',v:54,c:'var(--rose)'},
    {n:'Data',v:80,c:'var(--emerald)'}
  ];
  document.getElementById('quiz-skills').innerHTML = skills.map(s=>`
    <div class="skill-row">
      <div class="skill-nm">${s.n}</div>
      <div class="skill-tr"><div class="skill-fl" style="width:${s.v}%;background:${s.c}"></div></div>
      <div class="skill-pct" style="color:${s.c}">${s.v}%</div>
    </div>`).join('');
}

function renderQuizQuestion() {
  const container = document.getElementById('quiz-container');
  if (!container) return;
  const total = STATE.quizQuestions.length;

  if (STATE.quizIndex >= total) {
    showQuizResults(); return;
  }

  const q = STATE.quizQuestions[STATE.quizIndex];
  clearInterval(STATE.timerInterval);
  STATE.timerSec = 30;

  container.innerHTML = `
    <div class="quiz-hd">
      <div class="quiz-num">Question ${STATE.quizIndex+1} / ${total} · ${q.topic}</div>
      <div class="quiz-timer">⏱ <span id="timer-val">30</span>s</div>
    </div>
    <div class="quiz-q">${q.question}</div>
    <div class="quiz-opts">
      ${q.options.map((o,i)=>`
        <div class="quiz-opt" id="opt-${i}" onclick="selectOpt(${i})">
          <div class="opt-ltr">${'ABCD'[i]}</div>${o}
        </div>`).join('')}
    </div>
    <div class="quiz-fb" id="quiz-fb"></div>
    <div class="quiz-actions">
      <div style="font-size:12px;color:var(--muted)">
        ${Object.keys(STATE.quizAnswers).length} answered
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn-ghost btn-sm" onclick="skipQuestion()">Skip</button>
        <button class="btn-primary btn-sm" id="submit-q" onclick="submitQuestion()" disabled style="opacity:.4">Submit</button>
      </div>
    </div>`;

  STATE.timerInterval = setInterval(() => {
    STATE.timerSec--;
    const el = document.getElementById('timer-val');
    if (el) el.textContent = STATE.timerSec;
    if (STATE.timerSec <= 0) { clearInterval(STATE.timerInterval); autoTimeOut(); }
  }, 1000);
}

let _selectedOpt = null;
let _answered = false;

function selectOpt(i) {
  if (_answered) return;
  _selectedOpt = i;
  document.querySelectorAll('.quiz-opt').forEach(o => o.classList.remove('selected'));
  document.getElementById('opt-'+i).classList.add('selected');
  const btn = document.getElementById('submit-q');
  if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
}

function submitQuestion() {
  if (_selectedOpt === null || _answered) return;
  clearInterval(STATE.timerInterval);
  _answered = true;
  const q = STATE.quizQuestions[STATE.quizIndex];
  STATE.quizAnswers[q.id] = _selectedOpt;
  const correct = _selectedOpt === q.answer;

  document.querySelectorAll('.quiz-opt').forEach((o,i) => {
    if (i === q.answer) o.classList.add('correct');
    else if (i === _selectedOpt && !correct) o.classList.add('wrong');
  });

  const fb = document.getElementById('quiz-fb');
  fb.className = `quiz-fb show ${correct?'ok':'bad'}`;
  fb.innerHTML = (correct ? '✅ Correct! ' : '❌ Not quite. ') + q.explanation;

  const btn = document.getElementById('submit-q');
  btn.textContent = STATE.quizIndex+1 < STATE.quizQuestions.length ? 'Next →' : 'Finish';
  btn.onclick = advanceQuiz;
  btn.disabled = false;
  btn.style.opacity = '1';

  toast(correct ? `✅ Correct! +${q.xp} XP` : '❌ Review the explanation', correct ? 'ok' : 'err');
}

function autoTimeOut() {
  if (_answered) return;
  _answered = true;
  const q = STATE.quizQuestions[STATE.quizIndex];
  document.getElementById('opt-'+q.answer).classList.add('correct');
  const fb = document.getElementById('quiz-fb');
  fb.className = 'quiz-fb show bad';
  fb.innerHTML = '⏰ Time\'s up! ' + q.explanation;
  const btn = document.getElementById('submit-q');
  btn.textContent = STATE.quizIndex+1 < STATE.quizQuestions.length ? 'Next →' : 'Finish';
  btn.onclick = advanceQuiz; btn.disabled = false; btn.style.opacity = '1';
}

function advanceQuiz() {
  _selectedOpt = null; _answered = false;
  STATE.quizIndex++;
  renderQuizQuestion();
}

function skipQuestion() {
  clearInterval(STATE.timerInterval);
  _selectedOpt = null; _answered = false;
  STATE.quizIndex++;
  renderQuizQuestion();
}

async function showQuizResults() {
  const container = document.getElementById('quiz-container');
  const res = await API.submitQuiz(STATE.token, STATE.quizAnswers);

  if (res.error) {
    container.innerHTML = `<div class="card" style="text-align:center;padding:28px;color:var(--muted)">Error submitting quiz</div>`;
    return;
  }

  // Update user state
  if (STATE.user) {
    STATE.user.xp = res.total_xp;
    STATE.user.level = res.level;
    STATE.save();
    updateSidebarUI();
  }

  const pct = res.score_percent;
  const color = pct >= 80 ? 'var(--emerald)' : pct >= 60 ? 'var(--amber)' : 'var(--rose)';

  container.innerHTML = `
    <div style="text-align:center;padding:20px 10px">
      <div style="font-size:56px;font-family:'Syne',sans-serif;font-weight:800;color:${color}">${pct}%</div>
      <div style="font-size:16px;font-weight:600;margin-bottom:6px">${res.correct}/${res.total} correct</div>
      <div style="font-size:13px;color:var(--muted);margin-bottom:16px">${res.feedback}</div>
      <div style="font-size:18px;font-weight:700;color:var(--amber);margin-bottom:20px">+${res.xp_earned} XP earned!</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:18px">
      ${res.results.map(r=>`
        <div style="padding:10px 14px;border-radius:var(--r);border:1px solid ${r.is_correct?'rgba(52,211,153,.2)':'rgba(244,114,182,.2)'};
          background:${r.is_correct?'rgba(52,211,153,.06)':'rgba(244,114,182,.06)'};font-size:12px">
          <div style="font-weight:600;margin-bottom:3px">${r.is_correct?'✅':'❌'} ${r.question}</div>
          <div style="color:var(--muted);font-size:11px">${r.explanation}</div>
        </div>`).join('')}
    </div>
    <button class="btn-primary full" onclick="renderQuiz()">🔄 Try Again</button>
  `;
}

// ═══════════════════════════════════════════════════════════════
// AI TUTOR
// ═══════════════════════════════════════════════════════════════
async function renderTutor() {
  const el = document.getElementById('page-tutor');
  el.innerHTML = `
    <div class="g2">
      <div>
        <div class="sec-hd">
          <div class="sec-title">🤖 AI Tutor — Aria</div>
          <div style="font-size:12px;color:var(--emerald)">● Online 24/7</div>
        </div>
        <div class="chat-box">
          <div class="chat-hd">
            <div class="ai-av">🤖</div>
            <div>
              <div style="font-size:13px;font-weight:600">Aria</div>
              <div class="ai-status">Ready to help</div>
            </div>
            <div style="margin-left:auto;font-size:11px;color:var(--muted)">AI-powered</div>
          </div>
          <div class="chat-msgs" id="chat-msgs"></div>
          <div class="chat-inp-row">
            <textarea class="chat-inp" id="chat-input" rows="1" placeholder="Ask anything… e.g. 'explain recursion'" onkeydown="chatKey(event)"></textarea>
            <button class="chat-send" onclick="sendMsg()">➤</button>
          </div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="sec-hd"><div class="sec-title">💡 Quick Topics</div></div>
        <div id="quick-qs" style="display:flex;flex-direction:column;gap:7px"></div>
        <div class="card">
          <div class="card-title" style="margin-bottom:12px">📖 Study Tips</div>
          ${[
            ['var(--violet)','Use Pomodoro: 25 min focus, 5 min break'],
            ['var(--cyan)','Teach it out loud to test your understanding'],
            ['var(--emerald)','Review yesterday\'s notes before new content'],
            ['var(--amber)','Connect new concepts to things you already know'],
            ['var(--rose)','Spaced repetition beats cramming every time'],
          ].map(([c,t])=>`
            <div style="display:flex;gap:8px;font-size:13px;color:var(--muted);margin-bottom:8px">
              <span style="color:${c}">✦</span>${t}
            </div>`).join('')}
        </div>
      </div>
    </div>
  `;

  // Quick Qs
  const qs = [
    'Explain list comprehensions', 'What is gradient descent?',
    'How does async/await work?', 'Explain Big O notation',
    'What are closures in JS?', 'How does recursion work?',
    'Explain Python classes', 'What are neural networks?'
  ];
  document.getElementById('quick-qs').innerHTML = qs.map(q => `
    <div style="padding:9px 14px;background:var(--surface);border:1px solid var(--border);
      border-radius:var(--r);font-size:12px;cursor:pointer;color:var(--muted);transition:all .2s"
      onmouseover="this.style.borderColor='var(--violet)';this.style.color='var(--text)'"
      onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--muted)'"
      onclick="quickAsk('${q}')">💬 ${q}</div>`).join('');

  // Load history
  const history = await API.chatHistory(STATE.token);
  if (Array.isArray(history) && history.length) {
    history.slice(-20).forEach(m => addBubble(m.role, m.content, false));
  } else {
    addBubble('ai', "👋 Hi! I'm Aria, your AI tutor. Ask me **anything** about programming — Python, ML, JavaScript, algorithms, data science. I'll explain with examples and code!\n\nTry: *\"explain recursion\"* or *\"what is Big O?\"*");
  }
}

function addBubble(role, text, scroll=true) {
  const msgs = document.getElementById('chat-msgs');
  if (!msgs) return;
  const u = STATE.user;
  const div = document.createElement('div');
  div.className = `msg ${role}`;

  // Format markdown-lite
  const formatted = text
    .replace(/```[\s\S]*?```/g, m => `<div class="code-block">${m.slice(3,-3).replace(/^python\n|^js\n|^javascript\n/,'')}</div>`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em style="color:var(--cyan)">$1</em>')
    .replace(/\n/g, '<br>');

  div.innerHTML = `
    <div class="msg-av">${role==='ai'?'🤖':(u?.avatar||'U')}</div>
    <div class="msg-bub">${formatted}</div>`;
  msgs.appendChild(div);
  if (scroll) msgs.scrollTop = msgs.scrollHeight;
}

function addTyping() {
  const msgs = document.getElementById('chat-msgs');
  if (!msgs) return null;
  const div = document.createElement('div');
  div.className = 'msg ai'; div.id = 'typing';
  div.innerHTML = `<div class="msg-av">🤖</div><div class="msg-bub"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

async function sendMsg() {
  const inp = document.getElementById('chat-input');
  const text = (inp?.value || '').trim();
  if (!text) return;
  addBubble('user', text);
  inp.value = '';
  const typing = addTyping();
  const res = await API.chat(STATE.token, text);
  typing?.remove();
  addBubble('ai', res.response || 'Sorry, I could not respond. Is the backend running?');
}

function chatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
}

function quickAsk(q) {
  const inp = document.getElementById('chat-input');
  if (!inp) { showPage('tutor'); setTimeout(() => quickAsk(q), 200); return; }
  inp.value = q;
  sendMsg();
}

// ═══════════════════════════════════════════════════════════════
// PROGRESS
// ═══════════════════════════════════════════════════════════════
async function renderProgress() {
  const el = document.getElementById('page-progress');
  el.innerHTML = `<div class="spinner"></div>`;
  const [progress, stats] = await Promise.all([
    API.getProgress(STATE.token),
    API.getStats(STATE.token)
  ]);

  el.innerHTML = `
    <div class="g3" style="margin-bottom:22px">
      <div class="stat-card sc-cyan"><div class="stat-ico">🏆</div><div class="stat-val">${stats.total_xp||0}</div><div class="stat-lbl">Total XP</div></div>
      <div class="stat-card sc-violet"><div class="stat-ico">📅</div><div class="stat-val">${stats.lessons_completed||0}</div><div class="stat-lbl">Lessons Done</div></div>
      <div class="stat-card sc-emerald"><div class="stat-ico">🏅</div><div class="stat-val">${stats.badges_count||0}</div><div class="stat-lbl">Badges Earned</div></div>
    </div>

    <div class="g2" style="margin-bottom:22px">
      <div class="card">
        <div class="card-title" style="margin-bottom:14px">🧠 Skill Breakdown</div>
        <div id="prog-skills"></div>
      </div>
      <div class="card">
        <div class="card-title" style="margin-bottom:14px">📊 Monthly XP</div>
        <div class="mini-bars" id="monthly-bars" style="height:100px"></div>
        <div style="display:flex;gap:4px;margin-top:5px" id="monthly-labels"></div>
      </div>
    </div>

    <div class="card" style="margin-bottom:22px">
      <div class="card-title" style="margin-bottom:12px">📅 Activity Heatmap</div>
      <div class="heatmap" id="progress-heatmap"></div>
      <div style="display:flex;align-items:center;gap:5px;margin-top:9px;font-size:10px;color:var(--muted)">
        Less <div class="hcell"></div><div class="hcell l1"></div><div class="hcell l2"></div><div class="hcell l3"></div><div class="hcell l4"></div> More
      </div>
    </div>

    <div class="sec-hd"><div class="sec-title">🏅 All Badges</div></div>
    <div class="card" id="all-badges-grid"></div>
  `;

  // Skills
  const skills = progress.skill_breakdown || [];
  document.getElementById('prog-skills').innerHTML = skills.map(s=>`
    <div class="skill-row">
      <div class="skill-nm">${s.name}</div>
      <div class="skill-tr"><div class="skill-fl" style="width:${s.value}%;background:${s.color}"></div></div>
      <div class="skill-pct" style="color:${s.color}">${s.value}%</div>
    </div>`).join('');

  // Monthly bars
  const months = ['Aug','Sep','Oct','Nov','Dec','Jan','Feb'];
  const mData = [320,480,290,610,540,780,stats.total_xp||0];
  const mMax = Math.max(...mData);
  document.getElementById('monthly-bars').innerHTML = mData.map((v,i)=>
    `<div class="mini-bar" style="flex:1;height:${Math.round(v/mMax*100)}%;background:${COLORS[i%COLORS.length]};border-radius:4px 4px 0 0" data-v="${v} XP"></div>`
  ).join('');
  document.getElementById('monthly-labels').innerHTML = months.map(m=>`<div class="mini-bar-lbl">${m}</div>`).join('');

  // Heatmap
  const hmEl = document.getElementById('progress-heatmap');
  if (progress.heatmap) hmEl.innerHTML = progress.heatmap.map(l=>`<div class="hcell ${l?'l'+l:''}"></div>`).join('');

  // Badges
  renderBadgeGrid('all-badges-grid', STATE.user?.badges || []);
}

// ═══════════════════════════════════════════════════════════════
// LEARNING PATH
// ═══════════════════════════════════════════════════════════════
async function renderPath() {
  const el = document.getElementById('page-path');
  const recs = await API.getRecs(STATE.token);
  const steps = [
    {t:'Python Basics',d:'Variables, types, loops',st:'done'},
    {t:'Functions & OOP',d:'Reusable code & classes',st:'done'},
    {t:'Data Structures',d:'Lists, dicts, sets',st:'active'},
    {t:'File & Error Handling',d:'I/O and exceptions',st:'locked'},
    {t:'Libraries & APIs',d:'requests, json, flask',st:'locked'},
    {t:'Python Capstone Project',d:'Build a real-world app',st:'locked'},
  ];

  el.innerHTML = `
    <div class="g2">
      <div>
        <div class="sec-hd"><div class="sec-title">🗺 Your Learning Path</div></div>
        <div class="card">
          <div id="path-steps"></div>
        </div>
      </div>
      <div>
        <div class="sec-hd"><div class="sec-title">🤖 AI Recommendations</div></div>
        <div id="path-recs" style="display:flex;flex-direction:column;gap:12px"></div>
        <div class="card" style="margin-top:14px">
          <div class="card-title" style="margin-bottom:12px">📈 Study Schedule</div>
          ${[
            ['Mon / Wed / Fri','New Lessons (30 min)','var(--violet)'],
            ['Tue / Thu','Quiz & Review (20 min)','var(--cyan)'],
            ['Sat','AI Tutor Deep Dive (45 min)','var(--amber)'],
            ['Sun','Progress Review & Planning','var(--emerald)'],
          ].map(([d,t,c])=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:var(--surface);border-radius:8px;margin-bottom:7px">
              <span style="font-size:12px;font-weight:600;color:${c}">${d}</span>
              <span style="font-size:12px;color:var(--muted)">${t}</span>
            </div>`).join('')}
        </div>
      </div>
    </div>
  `;

  document.getElementById('path-steps').innerHTML = steps.map(s=>`
    <div class="path-step">
      <div class="step-dot ${s.st}">${s.st==='done'?'✓':s.st==='active'?'▶':'🔒'}</div>
      <div class="step-info">
        <div class="step-ti">${s.t}</div>
        <div class="step-ds">${s.d}</div>
        <div class="step-st st-${s.st}">${s.st.toUpperCase()}</div>
      </div>
    </div>`).join('');

  const recsData = Array.isArray(recs) ? recs : [];
  document.getElementById('path-recs').innerHTML = recsData.length ? recsData.map(r=>`
    <div class="rec-card" style="border-left:3px solid var(--violet)">
      <div style="font-size:28px">${r.icon}</div>
      <div>
        <div style="font-size:13px;font-weight:700;margin-bottom:3px">${r.title}</div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:7px">${r.reason}</div>
        <span style="font-size:11px;font-weight:700;color:var(--emerald)">${r.match_score}% AI match</span>
      </div>
    </div>`).join('') : `<div class="card" style="color:var(--muted);text-align:center;padding:20px">Enroll in more courses to unlock AI recommendations!</div>`;
}

// ═══════════════════════════════════════════════════════════════
// LEADERBOARD
// ═══════════════════════════════════════════════════════════════
async function renderLeaderboard() {
  const el = document.getElementById('page-leaderboard');
  el.innerHTML = `<div class="spinner"></div>`;
  const lb = await API.getLeaderboard(STATE.token);

  const you = lb.find(e => e.is_you);
  const yourRank = you?.rank || '?';

  el.innerHTML = `
    <div class="g2">
      <div>
        <div class="sec-hd"><div class="sec-title">🏆 Global Leaderboard</div></div>
        <div class="card" id="lb-rows"></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="sec-hd"><div class="sec-title">Your Rank</div></div>
        <div class="card" style="text-align:center;padding:28px">
          <div style="font-size:52px;font-weight:800;font-family:'Syne',sans-serif;background:var(--grad-b);-webkit-background-clip:text;-webkit-text-fill-color:transparent">#${yourRank}</div>
          <div style="font-size:13px;color:var(--muted);margin-bottom:18px">Out of ${lb.length}+ learners</div>
          <div style="background:var(--surface);border-radius:10px;padding:12px;margin-bottom:12px">
            <div style="font-size:11px;color:var(--muted);margin-bottom:3px">Your total XP</div>
            <div style="font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:var(--amber)">${you?.xp||STATE.user?.xp||0} XP</div>
          </div>
        </div>
        <div class="card">
          <div class="card-title" style="margin-bottom:12px">⚡ Earn More XP</div>
          ${[
            ['Complete a quiz','var(--violet)','+20 XP'],
            ['Finish a lesson','var(--cyan)','+50 XP'],
            ['Perfect quiz score','var(--emerald)','+100 XP'],
            ['7-day streak','var(--amber)','+200 XP'],
            ['Finish a course','var(--rose)','+500 XP'],
          ].map(([a,c,x])=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:var(--surface);border-radius:8px;margin-bottom:6px">
              <span style="font-size:12px">${a}</span>
              <span style="font-size:12px;font-weight:700;color:${c}">${x}</span>
            </div>`).join('')}
        </div>
      </div>
    </div>
  `;

  const rankColors = ['g','s','b'];
  document.getElementById('lb-rows').innerHTML = lb.map((p,i)=>{
    const bg = p.is_you ? '#818cf8' : p.avatar?.length > 1 ? 'var(--surface)' : 'var(--grad-a)';
    return `<div class="lb-row ${p.is_you?'you':''}">
      <div class="lb-rank ${rankColors[i]||''}">${i<3?['🥇','🥈','🥉'][i]:'#'+(i+1)}</div>
      <div class="lb-av" style="background:${bg}">${p.avatar||p.name[0]}</div>
      <div class="lb-nm">${p.name}${p.is_you?' <span style="font-size:10px;color:var(--violet);font-weight:700">(You)</span>':''}</div>
      <div class="lb-xp">${p.xp.toLocaleString()} <small>XP</small></div>
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════════
// LESSON MODAL
// ═══════════════════════════════════════════════════════════════
async function openLessonModal(cid) {
  const courses = window._coursesData || [];
  const course = courses.find(c => c.id === cid);
  if (!course) { showPage('courses'); return; }

  document.getElementById('modal-title').textContent = `${course.icon} ${course.title}`;
  document.getElementById('modal-body').innerHTML = `<div class="spinner"></div>`;
  document.getElementById('lesson-modal').classList.add('open');

  const lessons = await API.getLessons(cid);
  if (!lessons.length) {
    document.getElementById('modal-body').innerHTML = `<p style="color:var(--muted);text-align:center;padding:20px">No lessons available yet.</p>`;
    return;
  }

  const enrolled = STATE.user?.enrolled_courses?.[cid];
  const done = enrolled?.done_lessons || [];
  const nextLesson = lessons.find(l => !done.includes(l.id)) || lessons[0];

  document.getElementById('modal-body').innerHTML = `
    <div style="margin-bottom:18px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
        ${lessons.map(l=>`
          <div style="padding:5px 12px;border-radius:99px;font-size:11px;font-weight:600;
            background:${done.includes(l.id)?'rgba(52,211,153,.12)':'var(--surface)'};
            border:1px solid ${done.includes(l.id)?'rgba(52,211,153,.3)':'var(--border)'};
            color:${done.includes(l.id)?'var(--emerald)':'var(--muted)'}">
            ${done.includes(l.id)?'✓ ':''} ${l.title}
          </div>`).join('')}
      </div>
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r2);padding:18px">
        <div style="font-family:'Syne',sans-serif;font-size:16px;font-weight:700;margin-bottom:8px">
          📖 ${nextLesson.title}
        </div>
        <p style="font-size:13px;color:var(--muted);margin-bottom:12px">${nextLesson.content}</p>
        <div class="code-block">${nextLesson.code}</div>
        <div style="margin-top:14px;display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:12px;color:var(--muted)">Completing this lesson earns <strong style="color:var(--amber)">${nextLesson.xp} XP</strong></span>
          <button class="btn-success" onclick="markLessonDone('${cid}','${nextLesson.id}')">✅ Mark Complete</button>
        </div>
      </div>
    </div>
  `;
}

async function markLessonDone(cid, lid) {
  const res = await API.completeLesson(cid, lid, STATE.token);
  if (res.error) { toast(res.error, 'err'); return; }

  if (STATE.user) {
    STATE.user.xp = res.total_xp;
    STATE.user.level = res.level;
    if (!STATE.user.enrolled_courses) STATE.user.enrolled_courses = {};
    if (!STATE.user.enrolled_courses[cid]) STATE.user.enrolled_courses[cid] = {done_lessons:[]};
    if (!STATE.user.enrolled_courses[cid].done_lessons.includes(lid)) {
      STATE.user.enrolled_courses[cid].done_lessons.push(lid);
    }
    STATE.save();
    updateSidebarUI();
  }

  toast(`🎉 Lesson complete! +${res.xp_gained} XP`, 'ok');
  closeModal();

  if (window._coursesData) {
    const c = window._coursesData.find(x=>x.id===cid);
    if (c) {
      c.done_lessons = (c.done_lessons||0)+1;
      c.progress = Math.round(c.done_lessons/c.lessons*100);
      c.enrolled = true;
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════════════════════════════
const ALL_BADGES = [
  {id:'streak7',icon:'🔥',name:'7-Day Streak'},
  {id:'quiz10',icon:'🎯',name:'Quiz Master'},
  {id:'xp500',icon:'⚡',name:'XP Champion'},
  {id:'enroll3',icon:'📚',name:'Course Collector'},
  {id:'lesson10',icon:'✅',name:'Lesson Hero'},
  {id:'chat5',icon:'💬',name:'Curious Learner'},
  {id:'speed',icon:'🚀',name:'Speed Learner'},
  {id:'perfect',icon:'💯',name:'Perfectionist'},
];

function renderBadgeGrid(containerId, earnedBadges) {
  const earnedIds = earnedBadges.map(b=>b.id);
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div class="badge-grid">${ALL_BADGES.map(b=>`
    <div class="badge-item ${earnedIds.includes(b.id)?'earned':''}" title="${earnedIds.includes(b.id)?'Earned!':'Locked'}">
      <div class="badge-ico" style="${!earnedIds.includes(b.id)?'filter:grayscale(1);opacity:.35':''}">${b.icon}</div>
      ${b.name}
    </div>`).join('')}</div>`;
}
