"""
LearnAI Backend - Flask REST API
AI-Powered Personalised Learning Platform
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json, os, time, random, hashlib
from datetime import datetime, timedelta
from ai_engine import AIEngine

app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

# ── In-memory database (no setup required) ────────────────────────────
DB = {
    "users": {},
    "courses": {
        "c1": {"id":"c1","title":"Python Fundamentals","icon":"🐍","color":"#4fc6e8","tag":"Python","lessons":24,"desc":"Variables, loops, functions, OOP and file handling","difficulty":1,"duration":"12h","enrolled":3847},
        "c2": {"id":"c2","title":"Machine Learning Basics","icon":"🤖","color":"#a78bfa","tag":"ML","lessons":18,"desc":"Supervised learning, neural nets, sklearn & more","difficulty":3,"duration":"9h","enrolled":2910},
        "c3": {"id":"c3","title":"JavaScript Mastery","icon":"🌐","color":"#fbbf24","tag":"JS","lessons":32,"desc":"ES6+, async/await, DOM manipulation, React intro","difficulty":2,"duration":"16h","enrolled":5201},
        "c4": {"id":"c4","title":"Data Science with Pandas","icon":"📊","color":"#34d399","tag":"Data","lessons":20,"desc":"DataFrames, visualisation, EDA, cleaning","difficulty":2,"duration":"10h","enrolled":2134},
        "c5": {"id":"c5","title":"Web Dev Bootcamp","icon":"💻","color":"#fb923c","tag":"Web","lessons":40,"desc":"HTML, CSS, JS, React from scratch","difficulty":1,"duration":"20h","enrolled":6782},
        "c6": {"id":"c6","title":"Algorithms & DSA","icon":"🔗","color":"#f472b6","tag":"CS","lessons":28,"desc":"Sorting, trees, graphs, dynamic programming","difficulty":3,"duration":"14h","enrolled":1890},
    },
    "lessons": {
        "c1": [
            {"id":"c1l1","title":"Introduction to Python","content":"Python is a high-level, interpreted programming language known for its readability. Created by Guido van Rossum in 1991.","code":"# Your first Python program\nprint('Hello, World!')\n\n# Variables\nname = 'Learner'\nage = 25\nprint(f'Hi {name}, you are {age} years old!')","xp":50},
            {"id":"c1l2","title":"Variables & Data Types","content":"Python has several built-in data types: int, float, str, bool, list, dict, tuple, set.","code":"# Data types\nx = 42          # int\ny = 3.14        # float\nname = 'Alex'   # str\nactive = True   # bool\n\nprint(type(x))  # <class 'int'>","xp":50},
            {"id":"c1l3","title":"Control Flow","content":"Python uses if/elif/else for conditionals and for/while for loops.","code":"# Loops and conditions\nfor i in range(5):\n    if i % 2 == 0:\n        print(f'{i} is even')\n    else:\n        print(f'{i} is odd')","xp":60},
            {"id":"c1l4","title":"Functions","content":"Functions are reusable blocks of code defined with the 'def' keyword.","code":"def greet(name, greeting='Hello'):\n    return f'{greeting}, {name}!'\n\nprint(greet('Alice'))\nprint(greet('Bob', 'Hi'))","xp":70},
        ],
        "c2": [
            {"id":"c2l1","title":"What is Machine Learning?","content":"ML is a subset of AI that enables systems to learn from data without explicit programming.","code":"# Simple sklearn example\nfrom sklearn.linear_model import LinearRegression\nimport numpy as np\n\nX = np.array([[1],[2],[3],[4]])\ny = np.array([2,4,6,8])\n\nmodel = LinearRegression()\nmodel.fit(X, y)\nprint(model.predict([[5]]))  # [10]","xp":50},
            {"id":"c2l2","title":"Supervised vs Unsupervised","content":"Supervised learning uses labelled data. Unsupervised finds patterns without labels.","code":"# Classification example\nfrom sklearn.datasets import load_iris\nfrom sklearn.tree import DecisionTreeClassifier\n\nX, y = load_iris(return_X_y=True)\nclf = DecisionTreeClassifier()\nclf.fit(X, y)\nprint('Accuracy:', clf.score(X, y))","xp":60},
        ],
        "c3": [
            {"id":"c3l1","title":"JavaScript Basics","content":"JavaScript is the language of the web. It runs in browsers and on servers (Node.js).","code":"// Variables & functions\nconst greet = (name) => {\n  return `Hello, ${name}!`;\n};\n\nconst nums = [1,2,3,4,5];\nconst doubled = nums.map(n => n * 2);\nconsole.log(doubled); // [2,4,6,8,10]","xp":50},
            {"id":"c3l2","title":"Async/Await","content":"Handles asynchronous operations elegantly without callback hell.","code":"async function fetchUser(id) {\n  try {\n    const res = await fetch(`/api/users/${id}`);\n    const data = await res.json();\n    return data;\n  } catch (err) {\n    console.error('Error:', err);\n  }\n}","xp":70},
        ],
    },
    "quizzes": [
        {"id":"q1","question":"What is the output of: print(type([]))","options":["<class 'list'>","<class 'array'>","<class 'tuple'>","Error"],"answer":0,"topic":"Python","xp":20,"explanation":"[] creates a list literal. type() returns the class of the object."},
        {"id":"q2","question":"Which keyword defines a function in Python?","options":["func","define","def","function"],"answer":2,"topic":"Python","xp":20,"explanation":"'def' is the keyword to define functions. Example: def my_func():"},
        {"id":"q3","question":"What does CPU stand for?","options":["Central Processing Unit","Computer Personal Unit","Central Program Utility","Core Processing Unit"],"answer":0,"topic":"CS","xp":15,"explanation":"CPU = Central Processing Unit — executes program instructions."},
        {"id":"q4","question":"In ML, what is overfitting?","options":["Model too simple","Model memorises training data","Model runs slowly","Too few parameters"],"answer":1,"topic":"ML","xp":25,"explanation":"Overfitting: model learns training noise, reducing generalisation to new data."},
        {"id":"q5","question":"What does '==' do in Python?","options":["Assigns value","Compares identity","Compares equality","None of these"],"answer":2,"topic":"Python","xp":15,"explanation":"'==' checks value equality. 'is' checks identity (same object in memory)."},
        {"id":"q6","question":"Which data structure uses LIFO order?","options":["Queue","Stack","Linked List","Tree"],"answer":1,"topic":"CS","xp":20,"explanation":"Stack = Last In, First Out. Like a stack of plates — take the top one first."},
        {"id":"q7","question":"What is a DataFrame in pandas?","options":["1D labelled array","2D labelled table","Python dictionary","File format"],"answer":1,"topic":"Data","xp":20,"explanation":"DataFrame = 2D labelled data structure with columns of different types."},
        {"id":"q8","question":"What does CSS stand for?","options":["Creative Style Sheets","Cascading Style Sheets","Computer Styling System","Coded Style Syntax"],"answer":1,"topic":"Web","xp":15,"explanation":"CSS = Cascading Style Sheets — controls visual presentation of HTML."},
        {"id":"q9","question":"Which sorting algorithm has O(n log n) average complexity?","options":["Bubble Sort","Selection Sort","Merge Sort","Insertion Sort"],"answer":2,"topic":"CS","xp":25,"explanation":"Merge Sort uses divide-and-conquer, achieving O(n log n) in all cases."},
        {"id":"q10","question":"What is a closure in JavaScript?","options":["A way to close a browser tab","A function with access to its outer scope","A CSS property","An HTML element"],"answer":1,"topic":"JS","xp":25,"explanation":"A closure is a function that retains access to its lexical scope even when executed outside that scope."},
    ],
    "leaderboard": [
        {"name":"Sarah K.","xp":2840,"avatar":"🦊","level":8,"streak":14},
        {"name":"James M.","xp":2720,"avatar":"🐬","level":7,"streak":21},
        {"name":"Priya R.","xp":1980,"avatar":"🌸","level":6,"streak":9},
        {"name":"Tom B.","xp":1055,"avatar":"🦁","level":4,"streak":5},
        {"name":"Aisha N.","xp":987,"avatar":"⭐","level":4,"streak":3},
        {"name":"Carlos V.","xp":891,"avatar":"🎸","level":3,"streak":7},
        {"name":"Emma L.","xp":784,"avatar":"🌺","level":3,"streak":2},
        {"name":"Wei Z.","xp":650,"avatar":"🐉","level":2,"streak":11},
    ]
}

ai = AIEngine()

# ── Helpers ───────────────────────────────────────────────────────────
def get_user(uid):
    return DB["users"].get(uid)

def save_user(uid, data):
    DB["users"][uid] = data

def gen_id(prefix=""):
    return prefix + hashlib.md5(f"{time.time()}{random.random()}".encode()).hexdigest()[:8].upper()

# ── Serve Frontend ────────────────────────────────────────────────────
@app.route('/')
def serve_index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    try:
        return send_from_directory('../frontend', path)
    except:
        return send_from_directory('../frontend', 'index.html')

# ══════════════════════════════════════════════════════════════════════
# AUTH ROUTES
# ══════════════════════════════════════════════════════════════════════
@app.route('/api/auth/register', methods=['POST'])
def register():
    d = request.json
    name = d.get('name','').strip()
    email = d.get('email','').strip().lower()
    if not name or not email:
        return jsonify({"error":"Name and email required"}), 400
    uid = gen_id("USR")
    user = {
        "id": uid, "name": name, "email": email,
        "avatar": name[0].upper(),
        "level": 1, "xp": 0, "xp_max": 500,
        "streak": 0, "last_active": datetime.now().isoformat(),
        "topics": d.get('topics', []),
        "skill_level": d.get('skill_level', 'Beginner'),
        "goal": d.get('goal', ''),
        "enrolled_courses": {},  # course_id -> {done_lessons:[]}
        "quiz_history": [],
        "badges": [],
        "chat_history": [],
        "created_at": datetime.now().isoformat()
    }
    save_user(uid, user)
    return jsonify({"success": True, "user": user, "token": uid}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    d = request.json
    uid = d.get('token')
    user = get_user(uid)
    if not user:
        return jsonify({"error": "User not found"}), 404
    # Update streak
    last = datetime.fromisoformat(user.get('last_active', datetime.now().isoformat()))
    diff = (datetime.now() - last).days
    if diff == 1:
        user['streak'] += 1
    elif diff > 1:
        user['streak'] = 0
    user['last_active'] = datetime.now().isoformat()
    save_user(uid, user)
    return jsonify({"success": True, "user": user})

# ══════════════════════════════════════════════════════════════════════
# USER ROUTES
# ══════════════════════════════════════════════════════════════════════
@app.route('/api/user/<uid>', methods=['GET'])
def get_user_info(uid):
    user = get_user(uid)
    if not user: return jsonify({"error":"Not found"}), 404
    return jsonify(user)

@app.route('/api/user/<uid>/stats', methods=['GET'])
def get_user_stats(uid):
    user = get_user(uid)
    if not user: return jsonify({"error":"Not found"}), 404
    enrolled = user.get('enrolled_courses', {})
    total_lessons = sum(len(v.get('done_lessons',[])) for v in enrolled.values())
    quiz_scores = [q['score'] for q in user.get('quiz_history',[])]
    avg_score = round(sum(quiz_scores)/len(quiz_scores),1) if quiz_scores else 0
    return jsonify({
        "total_xp": user['xp'],
        "level": user['level'],
        "streak": user['streak'],
        "courses_enrolled": len(enrolled),
        "lessons_completed": total_lessons,
        "quizzes_taken": len(user.get('quiz_history',[])),
        "avg_quiz_score": avg_score,
        "badges_count": len(user.get('badges',[])),
        "skill_breakdown": ai.compute_skill_breakdown(user)
    })

# ══════════════════════════════════════════════════════════════════════
# COURSE ROUTES
# ══════════════════════════════════════════════════════════════════════
@app.route('/api/courses', methods=['GET'])
def list_courses():
    uid = request.args.get('uid')
    user = get_user(uid) if uid else None
    courses = []
    for cid, c in DB['courses'].items():
        course = dict(c)
        if user:
            enrolled = user.get('enrolled_courses', {})
            if cid in enrolled:
                done = len(enrolled[cid].get('done_lessons', []))
                course['enrolled'] = True
                course['done_lessons'] = done
                course['progress'] = round(done / c['lessons'] * 100)
                course['status'] = 'completed' if done >= c['lessons'] else 'in_progress'
            else:
                course['enrolled'] = False
                course['progress'] = 0
                course['status'] = 'available'
        courses.append(course)
    return jsonify(courses)

@app.route('/api/courses/<cid>/enroll', methods=['POST'])
def enroll_course(cid):
    d = request.json
    uid = d.get('uid')
    user = get_user(uid)
    if not user: return jsonify({"error":"Not found"}), 404
    if cid not in DB['courses']: return jsonify({"error":"Course not found"}), 404
    if cid not in user['enrolled_courses']:
        user['enrolled_courses'][cid] = {'done_lessons': [], 'enrolled_at': datetime.now().isoformat()}
    save_user(uid, user)
    return jsonify({"success": True, "course": DB['courses'][cid]})

@app.route('/api/courses/<cid>/lessons', methods=['GET'])
def get_lessons(cid):
    return jsonify(DB['lessons'].get(cid, []))

@app.route('/api/courses/<cid>/lessons/<lid>/complete', methods=['POST'])
def complete_lesson(cid, lid):
    d = request.json
    uid = d.get('uid')
    user = get_user(uid)
    if not user: return jsonify({"error":"Not found"}), 404
    if cid not in user['enrolled_courses']:
        user['enrolled_courses'][cid] = {'done_lessons': []}
    done = user['enrolled_courses'][cid].setdefault('done_lessons', [])
    if lid not in done:
        done.append(lid)
        # Find lesson XP
        xp = 50
        for l in DB['lessons'].get(cid, []):
            if l['id'] == lid:
                xp = l.get('xp', 50)
                break
        user['xp'] += xp
        user = _check_level_up(user)
        user = _check_badges(user)
    save_user(uid, user)
    return jsonify({"success": True, "xp_gained": 50, "total_xp": user['xp'], "level": user['level']})

# ══════════════════════════════════════════════════════════════════════
# QUIZ ROUTES
# ══════════════════════════════════════════════════════════════════════
@app.route('/api/quiz', methods=['GET'])
def get_quiz():
    uid = request.args.get('uid')
    count = int(request.args.get('count', 5))
    user = get_user(uid) if uid else None
    questions = ai.select_quiz_questions(DB['quizzes'], user, count)
    return jsonify(questions)

@app.route('/api/quiz/submit', methods=['POST'])
def submit_quiz():
    d = request.json
    uid = d.get('uid')
    answers = d.get('answers', {})  # {question_id: selected_index}
    user = get_user(uid)
    if not user: return jsonify({"error":"Not found"}), 404

    results = []
    total_xp = 0
    correct = 0

    for q in DB['quizzes']:
        qid = q['id']
        if qid in answers:
            selected = answers[qid]
            is_correct = selected == q['answer']
            if is_correct:
                correct += 1
                xp = q.get('xp', 20)
                total_xp += xp
            results.append({
                "question_id": qid,
                "question": q['question'],
                "selected": selected,
                "correct_answer": q['answer'],
                "is_correct": is_correct,
                "explanation": q['explanation'],
                "xp_earned": q.get('xp',20) if is_correct else 0
            })

    score_pct = round(correct / len(results) * 100) if results else 0
    user['xp'] += total_xp
    user['quiz_history'].append({
        "date": datetime.now().isoformat(),
        "score": score_pct,
        "correct": correct,
        "total": len(results),
        "xp": total_xp
    })
    user = _check_level_up(user)
    user = _check_badges(user)
    save_user(uid, user)

    return jsonify({
        "results": results,
        "score_percent": score_pct,
        "correct": correct,
        "total": len(results),
        "xp_earned": total_xp,
        "total_xp": user['xp'],
        "level": user['level'],
        "feedback": ai.quiz_feedback(score_pct)
    })

# ══════════════════════════════════════════════════════════════════════
# AI TUTOR ROUTES
# ══════════════════════════════════════════════════════════════════════
@app.route('/api/tutor/chat', methods=['POST'])
def tutor_chat():
    d = request.json
    uid = d.get('uid')
    message = d.get('message', '').strip()
    user = get_user(uid) if uid else None

    if not message:
        return jsonify({"error": "Message required"}), 400

    response = ai.generate_response(message, user)

    if user:
        user.setdefault('chat_history', []).append({
            "role": "user", "content": message,
            "timestamp": datetime.now().isoformat()
        })
        user['chat_history'].append({
            "role": "ai", "content": response,
            "timestamp": datetime.now().isoformat()
        })
        # XP for using tutor
        if len(user['chat_history']) % 10 == 0:
            user['xp'] += 10
        save_user(uid, user)

    return jsonify({"response": response, "timestamp": datetime.now().isoformat()})

@app.route('/api/tutor/history/<uid>', methods=['GET'])
def get_chat_history(uid):
    user = get_user(uid)
    if not user: return jsonify([])
    return jsonify(user.get('chat_history', [])[-50:])  # Last 50 messages

# ══════════════════════════════════════════════════════════════════════
# PROGRESS & ANALYTICS
# ══════════════════════════════════════════════════════════════════════
@app.route('/api/progress/<uid>', methods=['GET'])
def get_progress(uid):
    user = get_user(uid)
    if not user: return jsonify({"error":"Not found"}), 404

    # Weekly XP (simulated + real)
    weekly = [random.randint(30, 150) for _ in range(6)]
    weekly.append(user['xp'] % 200 + 20)

    # Quiz accuracy per week
    qh = user.get('quiz_history', [])
    quiz_trend = [round(q['score']) for q in qh[-7:]] if qh else [72,85,91,78,95,88,93]

    return jsonify({
        "weekly_xp": weekly,
        "quiz_trend": quiz_trend,
        "skill_breakdown": ai.compute_skill_breakdown(user),
        "heatmap": ai.generate_heatmap(),
        "badges": user.get('badges', []),
        "total_study_hours": round(len(user.get('enrolled_courses',{}))*2.5 + len(qh)*0.1, 1)
    })

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    uid = request.args.get('uid')
    user = get_user(uid) if uid else None
    lb = list(DB['leaderboard'])
    if user:
        lb.append({"name": user['name'], "xp": user['xp'], "avatar": user['avatar'],
                   "level": user['level'], "streak": user['streak'], "is_you": True})
    lb.sort(key=lambda x: x['xp'], reverse=True)
    for i, entry in enumerate(lb):
        entry['rank'] = i + 1
    return jsonify(lb[:12])

@app.route('/api/recommendations/<uid>', methods=['GET'])
def get_recommendations(uid):
    user = get_user(uid)
    if not user: return jsonify([])
    return jsonify(ai.generate_recommendations(user, DB['courses']))

# ══════════════════════════════════════════════════════════════════════
# HELPERS
# ══════════════════════════════════════════════════════════════════════
def _check_level_up(user):
    levels = [0,500,1200,2200,3500,5000,7000,9500,12500,16000,20000]
    for i, threshold in enumerate(levels):
        if user['xp'] < threshold:
            user['level'] = max(1, i)
            user['xp_max'] = threshold
            break
    else:
        user['level'] = 10
    return user

def _check_badges(user):
    badges = user.setdefault('badges', [])
    badge_ids = [b['id'] for b in badges]
    checks = [
        ("streak7", "🔥", "7-Day Streak",  user.get('streak',0) >= 7),
        ("quiz10",  "🎯", "Quiz Master",    len(user.get('quiz_history',[])) >= 10),
        ("xp500",   "⚡", "XP Champion",   user['xp'] >= 500),
        ("enroll3", "📚", "Course Collector", len(user.get('enrolled_courses',{})) >= 3),
        ("lesson10","✅", "Lesson Hero",    sum(len(v.get('done_lessons',[])) for v in user.get('enrolled_courses',{}).values()) >= 10),
        ("chat5",   "💬", "Curious Learner", len(user.get('chat_history',[])) >= 10),
    ]
    for bid, icon, name, earned in checks:
        if earned and bid not in badge_ids:
            badges.append({"id": bid, "icon": icon, "name": name, "earned_at": datetime.now().isoformat()})
    return user

if __name__ == '__main__':
    print("\n" + "="*55)
    print("  ✦ LearnAI Backend — http://localhost:5000")
    print("="*55)
    print("  Open your browser at: http://localhost:5000")
    print("  API Health:           http://localhost:5000/api/health")
    print("="*55 + "\n")
    app.run(debug=True, host='0.0.0.0', port=5000)

@app.route('/api/health')
def health():
    return jsonify({"status":"ok","users":len(DB['users']),"timestamp":datetime.now().isoformat()})
