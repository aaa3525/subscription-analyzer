<div align="center">

# 📱 Subscription Analyzer

### *Beat Subscription Creep with Intelligent Classification*

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://subscription-analyzer-git-main-aaa3525s-projects.vercel.app/login)
[![Backend API](https://img.shields.io/badge/Backend-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://subscription-analyzer-production.up.railway.app)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)

**Student:** Amnah Asrar | **Roll No:** 23i-5550

</div>

---

## 📖 Problem Statement

Modern digital consumers face a significant financial problem known as **"subscription creep"** – the gradual accumulation of recurring payments that users forget about or no longer use.

> The average person spends **$200-300/month** on subscriptions, with nearly **40%** going completely unused.

### Three Core Problems Solved

| 🚫 Problem | ✅ Solution |
|------------|-------------|
| Lack of visibility across multiple payment methods | Centralized subscription dashboard |
| No intelligent classification of expenses | Rule-based automatic categorization |
| No decision support for cancellations | Actionable recommendations with priority sorting |

---

## 🚀 Live URLs

| Component | URL |
|-----------|-----|
| **Frontend** | https://subscription-analyzer-git-main-aaa3525s-projects.vercel.app/login |
| **Backend API** | https://subscription-analyzer-production.up.railway.app |

---

## 🏗️ System Architecture
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Browser │────▶│ Vercel │────▶│ Railway │────▶│ MongoDB │
│ (React) │ │ (Frontend) │ │ (Backend) │ │ Atlas │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
│ │ │
React Router Express.js 3 Collections
Axios Client JWT Auth users/rules
localStorage Rule Engine subscriptions

text

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React + React Router | UI components, protected routes |
| HTTP Client | Axios | API calls, automatic JWT injection |
| Backend | Node.js + Express | REST API, middleware, rule engine |
| Database | MongoDB Atlas | Flexible document storage |
| Authentication | JWT + bcrypt | Stateless auth, password hashing |

---

## 🗄️ Database Design

### Collection Schema


// Users Collection
{
    name: String,
    email: String (unique),
    password: String (bcrypt hashed),
    createdAt: Date
}

// Subscriptions Collection
{
    user: ObjectId (ref: 'User'),
    name: String,
    cost: Number (0-10000),
    billingCycle: ['monthly', 'yearly', 'weekly'],
    usageFrequency: Number (0-100),
    classification: ['essential', 'waste', 'expensive', 'infrequent', 'good_value', 'pending'],
    isActive: Boolean
}

// Rules Collection
{
    user: ObjectId (ref: 'User'),
    condition: ['cost_gt', 'cost_lt', 'usage_lt', 'usage_gt', 'cycle_eq'],
    threshold: Number,
    classification: String
}
Relationship Design: Referencing
Reason	Why Referencing
Rules change frequently	Update ONE rule instead of 50+ subscriptions
Document size limit	Subscriptions remain small, no 16MB risk
Query flexibility	Pagination, filtering, aggregation all supported
Data isolation	Each document has explicit user reference
⚙️ Core Logic: Rule-Based Classification Engine
How It Works
text
User Rules ──▶ Rule Engine ──▶ Subscription ──▶ Classification ──▶ Recommendation
   │               │                │                  │                  │
   ▼               ▼                ▼                  ▼                  ▼
cost>20        Evaluate         Netflix:           "waste"           "Cancel to
usage<30       each rule         $15.99, 80%                         save $192/year"
Rule Conditions
Condition	Meaning	Classification
cost_gt	Cost > threshold	expensive
cost_lt	Cost < threshold	good_value
usage_lt	Usage < threshold	waste
usage_gt	Usage > threshold	essential
cycle_eq	Billing cycle equals	expensive
Example Trace
Subscription	Cost	Usage	Rules Matched	Result	Recommendation
Netflix	$15.99	80%	usage > 70	🟢 essential	"Keep this"
Gym	$50.00	10%	cost > 20 AND usage < 30	🔴 waste	"Cancel - save $600/year"
Spotify	$9.99	25%	usage < 30	🔴 waste	"Cancel - save $120/year"
📊 Key Queries
Query 1: Spending Analytics by Classification
javascript
GET /api/subscriptions/analytics/spending-by-classification

// Aggregation pipeline
db.subscriptions.aggregate([
    { $match: { user: userId, isActive: true } },
    { $group: { _id: '$classification', totalCost: { $sum: '$cost' }, count: { $sum: 1 } } },
    { $sort: { totalCost: -1 } }
])
Sample Output:

json
[
    { "_id": "waste", "totalCost": 59.99, "count": 2 },
    { "_id": "expensive", "totalCost": 20.99, "count": 1 },
    { "_id": "essential", "totalCost": 15.99, "count": 1 }
]
Query 2: Actionable Subscriptions
javascript
GET /api/subscriptions/analytics/actionable

db.subscriptions.find({
    user: userId,
    classification: { $in: ['waste', 'expensive', 'infrequent'] },
    isActive: true
}).sort({ cost: -1 })  // Highest cost first
Why meaningful: Uses $in operator, database-side sorting, powers the "Action Needed" UI.

🔒 Security Features
#	Feature	Implementation	Protects Against
1	JWT Authentication	jwt.sign() + jwt.verify()	Unauthorized API access
2	Protected Routes	React Router redirects	Direct URL access
3	Input Validation	Mongoose schemas (min, max, enum)	Invalid/malicious data
4	Password Hashing	bcrypt (10 salt rounds)	Password exposure
5	Data Isolation	All queries include user: req.user.id	Cross-user data access
Key Security Code
javascript
// JWT Middleware
const token = req.header('x-auth-token');
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded;

// Password Hashing
UserSchema.pre('save', async function(next) {
    this.password = await bcrypt.hash(this.password, 10);
});

// Data Isolation
await Subscription.findOneAndDelete({ _id: id, user: req.user.id });
📈 Scalability: 10,000 Users
What Breaks & How to Fix
Limitation	Problem	Fix	Impact
No indexes	5-10 second queries	Compound indexes	20x faster
CPU-bound rules	O(n×m) evaluations	Pre-compile functions	3-5x faster
Connection pool	Default 100 exhausted	maxPoolSize: 500	Handles more users
No rate limiting	DoS vulnerability	Redis rate limiter	Security
Large bundle	500KB initial load	React.lazy() code splitting	10x smaller per page
No caching	Every request hits DB	Redis cache (5min TTL)	50x faster analytics
Scaled Architecture
text
CDN → Load Balancer → 3× Node.js Servers → Redis Cluster → MongoDB Atlas (3-node replica)
Cost Estimate: ~$707/month for 10,000 users
🧪 API Documentation
Authentication Endpoints
Method	Endpoint	Body
POST	/api/auth/register	{ name, email, password }
POST	/api/auth/login	{ email, password }
Subscription Endpoints
Method	Endpoint	Headers	Body
GET	/api/subscriptions	x-auth-token	-
POST	/api/subscriptions	x-auth-token	{ name, cost, billingCycle, usageFrequency }
DELETE	/api/subscriptions/:id	x-auth-token	-
GET	/api/subscriptions/analytics/spending-by-classification	x-auth-token	-
GET	/api/subscriptions/analytics/actionable	x-auth-token	-
Rule Endpoints
Method	Endpoint	Body
GET	/api/rules	-
POST	/api/rules	{ name, condition, threshold, classification }
PUT	/api/rules/:id	Updated rule fields
DELETE	/api/rules/:id	-
Sample API Call
bash
# Login
curl -X POST https://subscription-analyzer-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Response: { "token": "eyJhbGciOiJIUzI1NiIs..." }

# Add Subscription
curl -X POST https://subscription-analyzer-production.up.railway.app/api/subscriptions \
  -H "x-auth-token: eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"name":"Netflix","cost":15.99,"billingCycle":"monthly","usageFrequency":80}'
💻 Local Development
Prerequisites
Node.js (v14+)

MongoDB Atlas account (or local MongoDB)

Backend Setup
bash
cd backend
npm install

# Create .env file
cat > .env << EOF
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
PORT=5000
EOF

npm start
# Server runs on http://localhost:5000
Frontend Setup
bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
Environment Variables
Variable	Purpose
MONGODB_URI	MongoDB Atlas connection string
JWT_SECRET	Secret key for JWT signing
PORT	Backend server port (default: 5000)
🧪 Testing the Live App
Register: https://subscription-analyzer-git-main-aaa3525s-projects.vercel.app/register

Login: https://subscription-analyzer-git-main-aaa3525s-projects.vercel.app/login

Add subscriptions with cost and usage frequency

Create rules in the Rules page (e.g., "cost > 20 = expensive")

View dashboard for automatic classification and recommendations

📁 Project Structure
text
subscription-analyzer/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Subscription.js
│   │   └── Rule.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── subscriptions.js
│   │   └── rules.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   └── ruleEngine.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   └── Rules.js
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.js
│   └── package.json
└── README.md
🔜 Future Improvements
Email notifications for upcoming renewals

Payment method integration (Plaid API)

Monthly spending reports (PDF export)

Multi-currency support

Mobile app (React Native)

👩‍💻 Author
Amnah Asrar
Roll Number: 23i-5550

https://img.shields.io/badge/GitHub-aaa3525-181717?style=flat&logo=github

<div align="center">
📊 Total Savings Potential
*Identify and cancel just ONE wasteful subscription to save up to $600/year*

