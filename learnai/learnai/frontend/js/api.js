/* api.js — All HTTP calls to the Flask backend */

const API_BASE = 'http://localhost:5000/api';

const API = {
  async post(path, body) {
    try {
      const r = await fetch(API_BASE + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return await r.json();
    } catch (e) {
      console.error('POST', path, e);
      return { error: 'Network error — is the backend running?' };
    }
  },
  async get(path) {
    try {
      const r = await fetch(API_BASE + path);
      return await r.json();
    } catch (e) {
      console.error('GET', path, e);
      return { error: 'Network error' };
    }
  },

  // Auth
  register: (data)       => API.post('/auth/register', data),
  login:    (token)      => API.post('/auth/login', { token }),

  // User
  getUser:  (uid)        => API.get(`/user/${uid}`),
  getStats: (uid)        => API.get(`/user/${uid}/stats`),

  // Courses
  getCourses: (uid)      => API.get(`/courses?uid=${uid}`),
  enroll: (cid, uid)     => API.post(`/courses/${cid}/enroll`, { uid }),
  getLessons: (cid)      => API.get(`/courses/${cid}/lessons`),
  completeLesson: (cid, lid, uid) => API.post(`/courses/${cid}/lessons/${lid}/complete`, { uid }),

  // Quiz
  getQuiz: (uid, n=5)    => API.get(`/quiz?uid=${uid}&count=${n}`),
  submitQuiz: (uid, ans) => API.post('/quiz/submit', { uid, answers: ans }),

  // Tutor
  chat: (uid, message)   => API.post('/tutor/chat', { uid, message }),
  chatHistory: (uid)     => API.get(`/tutor/history/${uid}`),

  // Progress
  getProgress: (uid)     => API.get(`/progress/${uid}`),
  getLeaderboard: (uid)  => API.get(`/leaderboard?uid=${uid}`),
  getRecs: (uid)         => API.get(`/recommendations/${uid}`),
};
