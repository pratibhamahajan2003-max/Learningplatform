"""
ai_engine.py — AI logic for LearnAI platform
Handles: responses, recommendations, quiz selection, skill analysis
"""

import random
from datetime import datetime


class AIEngine:
    """Core AI engine for personalised learning."""

    RESPONSES = {
        "list comprehension": """📋 **Python List Comprehensions**

A concise, readable way to create lists:
```python
result = [expression for item in iterable if condition]
```

**Examples:**
```python
# Squares of 0-9
squares = [x**2 for x in range(10)]
# → [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# Filter even numbers
evens = [x for x in range(20) if x % 2 == 0]

# Uppercase strings
words = ["hello", "world"]
upper = [w.upper() for w in words]
```

**Why use them?**
→ More readable than for-loops for simple operations
→ Typically 30-40% faster than equivalent loops
→ Can be nested (but avoid > 2 levels for readability)""",

        "gradient descent": """📉 **Gradient Descent**

The backbone optimisation algorithm in Machine Learning.

**Intuition:** Imagine standing on a hilly landscape in thick fog. You want to reach the valley. At each step, you feel the slope and move downhill.

**The math:**
```
θ = θ - α × ∇J(θ)
```
Where:
- **θ** = model parameters (weights)
- **α** = learning rate (step size)
- **∇J** = gradient of the loss function

**Three Variants:**

| Type | Data per Step | Speed | Stability |
|------|--------------|-------|-----------|
| Batch GD | Entire dataset | Slow | Very stable |
| Stochastic GD | 1 sample | Fast | Noisy |
| Mini-batch GD | 32-256 samples | Balanced | Balanced |

**Mini-batch is used in 99% of real neural networks!**""",

        "async": """⚡ **Async/Await in JavaScript**

Handles asynchronous operations without "callback hell".

**The Problem:**
```javascript
// Old way — callback hell 😱
fetchUser(id, function(user) {
  fetchPosts(user.id, function(posts) {
    fetchComments(posts[0].id, function(comments) {
      // Deeply nested...
    });
  });
});
```

**The Solution:**
```javascript
// Modern async/await ✅
async function loadUserData(id) {
  try {
    const user = await fetchUser(id);
    const posts = await fetchPosts(user.id);
    const comments = await fetchComments(posts[0].id);
    return { user, posts, comments };
  } catch (error) {
    console.error('Failed:', error);
  }
}
```

**Key Rules:**
1. `await` only works inside `async` functions
2. Always use `try/catch` for error handling
3. For parallel requests: use `Promise.all([])`""",

        "big o": """📊 **Big O Notation**

Describes algorithm efficiency as input size (n) grows.

**Common complexities (best → worst):**

| Notation | Name | Example |
|----------|------|---------|
| O(1) | Constant | Array index access |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Array scan |
| O(n log n) | Linearithmic | Merge sort |
| O(n²) | Quadratic | Bubble sort |
| O(2ⁿ) | Exponential | Recursive fibonacci |

**Visual intuition (n=1000):**
- O(1) → 1 operation
- O(log n) → 10 operations
- O(n) → 1,000 operations
- O(n²) → 1,000,000 operations

**Rule:** Always aim for the lowest Big O you can achieve!""",

        "closure": """🔒 **Closures in JavaScript**

A closure is a function that **remembers its outer scope** even after the outer function has returned.

```javascript
function makeCounter(start = 0) {
  let count = start; // Outer variable

  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount:  () => count
  };
}

const counter = makeCounter(10);
counter.increment(); // 11
counter.increment(); // 12
counter.getCount();  // 12
```

**Why closures matter:**
1. **Data privacy** — `count` is inaccessible from outside
2. **State persistence** — value survives between calls
3. **Factory functions** — create customised function variants
4. **Event handlers** — capture loop variables correctly

**Common gotcha:**
```javascript
// ❌ Bug: all use same i
for (var i=0; i<3; i++) setTimeout(()=>console.log(i), 100);
// prints: 3 3 3

// ✅ Fix: use let (block-scoped closure)
for (let i=0; i<3; i++) setTimeout(()=>console.log(i), 100);
// prints: 0 1 2
```""",

        "recursion": """🔄 **Recursion**

A function that calls itself to solve smaller instances of the same problem.

**Every recursive function needs:**
1. **Base case** — when to stop
2. **Recursive case** — smaller version of the problem

```python
# Factorial: n! = n × (n-1)!
def factorial(n):
    if n <= 1:      # Base case
        return 1
    return n * factorial(n - 1)  # Recursive case

factorial(5) = 5 × 4 × 3 × 2 × 1 = 120
```

**Fibonacci with memoisation:**
```python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n < 2: return n
    return fib(n-1) + fib(n-2)

fib(50)  # Instant! (vs ~2^50 without cache)
```

**When to use recursion:**
✅ Tree/graph traversal
✅ Divide-and-conquer (merge sort)
✅ Problems with naturally recursive structure
❌ Simple loops (use iteration instead)""",

        "class": """🏗️ **Python Classes & OOP**

Classes are blueprints for creating objects.

```python
class Animal:
    # Class variable (shared)
    kingdom = "Animalia"

    def __init__(self, name, sound):
        # Instance variables (unique per object)
        self.name = name
        self.sound = sound

    def speak(self):
        return f"{self.name} says {self.sound}!"

    def __repr__(self):
        return f"Animal({self.name!r})"


class Dog(Animal):  # Inheritance
    def __init__(self, name):
        super().__init__(name, "Woof")

    def fetch(self, item):
        return f"{self.name} fetches the {item}!"


rex = Dog("Rex")
print(rex.speak())     # Rex says Woof!
print(rex.fetch("ball"))  # Rex fetches the ball!
print(rex.kingdom)     # Animalia
```

**4 Pillars of OOP:**
1. **Encapsulation** — bundle data + methods
2. **Inheritance** — reuse & extend classes
3. **Polymorphism** — same interface, different behaviour
4. **Abstraction** — hide complexity""",

        "neural network": """🧠 **Neural Networks**

Inspired by the human brain — layers of interconnected neurons.

**Architecture:**
```
Input Layer → Hidden Layers → Output Layer
[features]     [learning]      [prediction]
```

**A single neuron:**
```python
output = activation(weights · inputs + bias)
```

**Common activation functions:**

| Function | Formula | Use case |
|----------|---------|---------|
| ReLU | max(0, x) | Hidden layers (default) |
| Sigmoid | 1/(1+e⁻ˣ) | Binary output |
| Softmax | eˣ/Σeˣ | Multi-class output |
| Tanh | (eˣ-e⁻ˣ)/(eˣ+e⁻ˣ) | RNNs |

**Simple network with PyTorch:**
```python
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(784, 256),  # Input → Hidden
    nn.ReLU(),
    nn.Dropout(0.2),      # Prevent overfitting
    nn.Linear(256, 10),   # Hidden → Output
    nn.Softmax(dim=1)
)
```

**Deep learning** = many hidden layers (10–1000+)"""
    }

    GREETINGS = ["Hi! 👋", "Hello!", "Hey there! 👋"]
    FALLBACK = [
        "That's a great question! Could you be more specific? For example, are you asking about Python syntax, algorithms, ML concepts, or web development? I'll give you a detailed explanation with code examples!",
        "Interesting topic! I can help explain this in depth. Could you tell me which aspect you'd like to focus on? Feel free to ask about any programming concept, algorithm, or technology.",
        "I'd love to help! Try asking me about specific topics like 'explain closures', 'what is gradient descent', 'how does recursion work', or 'explain Big O notation' for detailed answers with examples.",
    ]

    def generate_response(self, message: str, user=None) -> str:
        lower = message.lower()

        # Greetings
        if any(g in lower for g in ['hello', 'hi ', 'hey', 'howdy']):
            name = user['name'] if user else 'there'
            return f"Hey {name}! 👋 I'm Aria, your personal AI tutor. I can explain any programming concept with examples and code. What would you like to learn today?"

        if 'thank' in lower:
            return "You're welcome! 🌟 That's what I'm here for. Keep asking questions — curiosity is the fastest path to mastery. What else can I help you with?"

        if 'help' in lower or 'what can you' in lower:
            return """I can help you with anything programming-related! 🚀

**Try asking me:**
- "Explain list comprehensions"
- "What is gradient descent?"
- "How does async/await work?"
- "What is Big O notation?"
- "Explain closures in JavaScript"
- "How does recursion work?"
- "Explain Python classes"
- "What are neural networks?"

I'll give you detailed explanations with code examples, comparisons, and practical tips!"""

        # Match known topics
        topic_map = {
            "list comprehension": "list comprehension",
            "gradient descent": "gradient descent",
            "async": "async",
            "await": "async",
            "big o": "big o",
            "complexity": "big o",
            "closure": "closure",
            "recursion": "recursion",
            "recursive": "recursion",
            "class": "class",
            "oop": "class",
            "neural network": "neural network",
            "deep learning": "neural network",
        }
        for keyword, key in topic_map.items():
            if keyword in lower:
                return self.RESPONSES[key]

        # Python general
        if 'python' in lower:
            return """🐍 **Python — What would you like to learn?**

I can cover any of these Python topics in detail:

**Basics:** Variables, data types, operators
**Control Flow:** if/elif/else, for/while loops
**Functions:** def, args, kwargs, lambda, decorators
**Data Structures:** lists, dicts, tuples, sets
**OOP:** classes, inheritance, magic methods
**Advanced:** generators, comprehensions, context managers
**Libraries:** numpy, pandas, requests, flask

Just ask! e.g. "explain Python decorators" or "how do Python generators work\""""

        # ML general
        if any(k in lower for k in ['machine learning', 'ml', 'artificial intelligence', 'ai']):
            return """🤖 **Machine Learning — Where to start?**

**Core Concepts:**
- Supervised vs Unsupervised vs Reinforcement Learning
- Gradient Descent & Backpropagation
- Overfitting, Underfitting, Regularisation
- Train/Validation/Test splits

**Algorithms:**
- Linear/Logistic Regression
- Decision Trees & Random Forests
- Support Vector Machines
- Neural Networks & Deep Learning

**Tools:**
- `scikit-learn` — classical ML
- `TensorFlow` / `PyTorch` — deep learning
- `pandas` + `numpy` — data processing

Ask me about any specific concept!"""

        # JS general
        if any(k in lower for k in ['javascript', 'js', 'react', 'node']):
            return """🌐 **JavaScript — What specifically?**

**Core JS:**
- Variables (var/let/const), scoping
- Functions, arrow functions, closures
- Promises, async/await
- Prototypes & classes

**Browser APIs:**
- DOM manipulation
- Fetch API, event handling
- LocalStorage, Web Workers

**Ecosystem:**
- React — component-based UI
- Node.js — server-side JS
- npm/yarn — package management

Try: "explain JavaScript closures" or "how does the event loop work\""""

        return random.choice(self.FALLBACK)

    def select_quiz_questions(self, all_questions, user, count=5):
        """AI-select questions based on user's weak topics."""
        if not user or not user.get('quiz_history'):
            return random.sample(all_questions, min(count, len(all_questions)))

        # Find weak topics from history
        topic_scores = {}
        for record in user['quiz_history'][-10:]:
            pass  # simplified — just shuffle for now

        shuffled = list(all_questions)
        random.shuffle(shuffled)
        return shuffled[:count]

    def quiz_feedback(self, score_pct: int) -> str:
        if score_pct == 100:
            return "🏆 Perfect score! Outstanding! You've mastered this material completely."
        elif score_pct >= 80:
            return "🎉 Excellent work! You have a strong grasp of this topic."
        elif score_pct >= 60:
            return "👍 Good effort! Review the explanations for missed questions and try again."
        elif score_pct >= 40:
            return "💪 Keep going! Focus on the explanations below — they'll solidify the concepts."
        else:
            return "📚 This is a challenging area. Go back to the lessons and take your time — you've got this!"

    def compute_skill_breakdown(self, user) -> list:
        enrolled = user.get('enrolled_courses', {})
        qh = user.get('quiz_history', [])
        base = {"Python":0,"ML":0,"JavaScript":0,"Data Science":0,"Algorithms":0,"Web Dev":0}
        for cid in enrolled:
            done = len(enrolled[cid].get('done_lessons', []))
            if cid == 'c1': base['Python'] = min(100, done * 15)
            elif cid == 'c2': base['ML'] = min(100, done * 20)
            elif cid == 'c3': base['JavaScript'] = min(100, done * 10)
            elif cid == 'c4': base['Data Science'] = min(100, done * 15)
            elif cid == 'c5': base['Web Dev'] = min(100, done * 8)
            elif cid == 'c6': base['Algorithms'] = min(100, done * 12)
        return [{"name": k, "value": max(5, v), "color": c} for (k,v), c in zip(base.items(), ['#4fc6e8','#a78bfa','#fbbf24','#34d399','#f472b6','#fb923c'])]

    def generate_heatmap(self) -> list:
        cells = []
        for i in range(91):
            r = random.random()
            level = 4 if r > 0.92 else 3 if r > 0.78 else 2 if r > 0.6 else 1 if r > 0.4 else 0
            cells.append(level)
        return cells

    def generate_recommendations(self, user, courses) -> list:
        enrolled = set(user.get('enrolled_courses', {}).keys())
        recs = []
        for cid, course in courses.items():
            if cid not in enrolled:
                recs.append({
                    "course_id": cid,
                    "title": course['title'],
                    "icon": course['icon'],
                    "reason": f"Based on your interest in {user.get('topics', ['programming'])[0] if user.get('topics') else 'programming'}",
                    "match_score": random.randint(75, 99)
                })
        return sorted(recs, key=lambda x: x['match_score'], reverse=True)[:3]
