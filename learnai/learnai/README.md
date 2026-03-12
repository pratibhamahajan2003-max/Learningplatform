# ✦ LearnAI — AI-Powered Personalised Learning Platform

---

## 🚀 HOW TO RUN (Choose Your OS)

### ✅ Windows — 2 steps
```
1. Double-click:  START_WINDOWS.bat
2. Open browser:  http://localhost:5000
```

### ✅ Mac — 2 steps
```
1. Open Terminal in this folder and run:
   chmod +x START_MAC_LINUX.sh && ./START_MAC_LINUX.sh

2. Open browser:  http://localhost:5000
```

### ✅ Linux — 2 steps
```
1. chmod +x START_MAC_LINUX.sh && ./START_MAC_LINUX.sh
2. Open browser:  http://localhost:5000
```

### ✅ Manual (any OS)
```bash
cd backend
pip install flask flask-cors
python app.py
# Then open http://localhost:5000
```

---

## 📋 Requirements

| Requirement | Version | Check |
|------------|---------|-------|
| Python | 3.8+ | `python --version` |
| pip | any | `pip --version` |
| Browser | Chrome/Firefox/Edge | — |

**That's it. No npm, no Node.js, no database setup.**

---

## 📁 Project Structure

```
learnai/
│
├── START_WINDOWS.bat        ← Double-click on Windows
├── START_MAC_LINUX.sh       ← Run on Mac/Linux
├── README.md
│
├── backend/
│   ├── app.py               ← Flask REST API (main server)
│   ├── ai_engine.py         ← AI logic (responses, quiz selection)
│   └── requirements.txt     ← flask, flask-cors
│
└── frontend/
    ├── index.html           ← Main app (SPA shell)
    ├── css/
    │   └── main.css         ← All styles (dark theme)
    └── js/
        ├── api.js           ← Backend API calls
        ├── state.js         ← App state + navigation
        ├── onboarding.js    ← 4-step onboarding flow
        ├── pages.js         ← All page renderers
        └── app.js           ← App bootstrap
```

---

## ✨ Features

### 🎓 Onboarding (4 Steps)
- Enter your name & email
- Choose topics: Python, JS, ML, Data Science, Web Dev, etc.
- Select skill level: Beginner / Intermediate / Advanced
- Set your goal: new job, side project, interviews, etc.
- Data saved to backend via POST `/api/auth/register`

### 📚 Course Library (6 Courses)
- Python Fundamentals (24 lessons)
- Machine Learning Basics (18 lessons)
- JavaScript Mastery (32 lessons)
- Data Science with Pandas (20 lessons)
- Web Dev Bootcamp (40 lessons)
- Algorithms & DSA (28 lessons)
- Enroll → View Lessons → Mark Complete (+XP)
- Progress bar per course
- Filter by: All / In Progress / Completed / Available

### 🎯 Adaptive Quiz System
- 5 AI-selected questions per session
- 30-second countdown timer
- 10 questions across topics
- Instant feedback with full explanation
- Submit all answers → AI grades and returns score
- XP rewards per correct answer
- Performance analytics by topic

### 🤖 AI Tutor — "Aria"
- Real backend AI responses (not hardcoded in frontend)
- Covers: Python, ML, JS, Big O, recursion, closures, neural nets, etc.
- Markdown rendering: bold, code blocks, inline code
- Quick topic shortcuts
- Chat history persisted per user
- Typing animation while "thinking"

### 📈 Progress Tracking
- Skill breakdown bars (per course)
- Monthly XP bar chart
- 91-cell activity heatmap
- Badge system (8 achievements)

### 🗺 Learning Path
- Visual milestone timeline with status indicators
- AI-curated next steps based on enrollment
- Weekly study schedule

### 🏆 Leaderboard
- Global ranking with AI-generated competitors
- Your rank highlighted
- XP-to-next-rank indicator
- "How to earn more XP" tips

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create user account |
| POST | `/api/auth/login` | Login with token |
| GET | `/api/user/:uid/stats` | User statistics |
| GET | `/api/courses?uid=` | List all courses |
| POST | `/api/courses/:id/enroll` | Enroll in course |
| GET | `/api/courses/:id/lessons` | Get lessons |
| POST | `/api/courses/:cid/lessons/:lid/complete` | Complete lesson |
| GET | `/api/quiz?uid=` | Get AI-selected quiz questions |
| POST | `/api/quiz/submit` | Submit quiz answers |
| POST | `/api/tutor/chat` | Chat with AI tutor |
| GET | `/api/tutor/history/:uid` | Chat history |
| GET | `/api/progress/:uid` | Progress + heatmap data |
| GET | `/api/leaderboard?uid=` | Leaderboard with your rank |
| GET | `/api/recommendations/:uid` | AI course recommendations |
| GET | `/api/health` | Server health check |

---

## 🔧 Troubleshooting

**"ModuleNotFoundError: No module named 'flask'"**
```bash
pip install flask flask-cors
# or
pip3 install flask flask-cors
```

**"Address already in use"**
```bash
# Something is using port 5000. Kill it:
# Windows: netstat -ano | findstr :5000   then: taskkill /PID <number> /F
# Mac/Linux: lsof -ti:5000 | xargs kill -9
```

**"CORS error" in browser console**
→ Make sure you're opening `http://localhost:5000` (served by Flask)
→ NOT opening `frontend/index.html` directly as a file

**Page shows but data doesn't load**
→ Check the terminal — Python errors will show there
→ Visit http://localhost:5000/api/health to test the API

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3 + Flask |
| API | REST JSON |
| Frontend | HTML5 + CSS3 + Vanilla JS |
| State | localStorage + in-memory |
| Database | In-memory (no setup!) |
| Fonts | Syne + Epilogue (Google Fonts) |
| AI | Built-in rule engine + pattern matching |
