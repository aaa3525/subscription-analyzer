#Subscription Analyzer - README
Live URLs
Component	URL
Frontend	https://subscription-analyzer-git-main-aaa3525s-projects.vercel.app/login
Backend API	https://subscription-analyzer-production.up.railway.app
Project Overview
Subscription Analyzer is a full-stack MERN application that solves "subscription creep" – the gradual accumulation of unused recurring payments. The system automatically classifies subscriptions using user-defined rules and provides actionable recommendations to save money.

Key Features
✅ User authentication (JWT-based)

✅ Add/view/delete subscriptions

✅ Rule-based automatic classification

✅ Actionable recommendations for wasteful subscriptions

✅ Spending analytics by classification type

✅ Protected routes and data isolation

Tech Stack
Layer	Technology
Frontend	React, React Router, Axios
Backend	Node.js, Express.js
Database	MongoDB Atlas
Authentication	JWT + bcrypt
Hosting	Vercel (frontend) + Railway (backend)
API Endpoints
Authentication
Method	Endpoint	Description
POST	/api/auth/register	Create new account
POST	/api/auth/login	Login and receive JWT token
Subscriptions
Method	Endpoint	Description
GET	/api/subscriptions	Get all user subscriptions
POST	/api/subscriptions	Add new subscription
DELETE	/api/subscriptions/:id	Delete subscription
GET	/api/subscriptions/analytics/spending-by-classification	Aggregated spending by type
GET	/api/subscriptions/analytics/actionable	Filtered waste/expensive subscriptions
Rules
Method	Endpoint	Description
GET	/api/rules	Get user's classification rules
POST	/api/rules	Create new rule
PUT	/api/rules/:id	Update rule
DELETE	/api/rules/:id	Delete rule
Sample API Requests
Login
bash
POST https://subscription-analyzer-production.up.railway.app/api/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123"
}
Add Subscription
bash
POST https://subscription-analyzer-production.up.railway.app/api/subscriptions
x-auth-token: <your-jwt-token>

{
    "name": "Netflix",
    "cost": 15.99,
    "billingCycle": "monthly",
    "usageFrequency": 80
}
Get Actionable Subscriptions
bash
GET https://subscription-analyzer-production.up.railway.app/api/subscriptions/analytics/actionable
x-auth-token: <your-jwt-token>
Rule Engine Logic
The system classifies subscriptions based on user-defined rules:

Condition	Meaning	Example
cost_gt	Cost > threshold	cost > 20 → "expensive"
cost_lt	Cost < threshold	cost < 10 → "good_value"
usage_lt	Usage < threshold	usage < 30 → "waste"
usage_gt	Usage > threshold	usage > 70 → "essential"
cycle_eq	Cycle equals value	cycle = "yearly" → "expensive"
Example: Gym membership ($50, 10% usage) → matches cost_gt AND usage_lt → classified as "waste" → recommendation: "Cancel immediately"

Database Schema
Users Collection
javascript
{ name: String, email: String(unique), password: String(hashed), createdAt: Date }
Subscriptions Collection
javascript
{
    user: ObjectId(ref: 'User'),
    name: String,
    cost: Number(min:0),
    billingCycle: ['monthly','yearly','weekly'],
    usageFrequency: Number(0-100),
    classification: ['essential','waste','expensive','infrequent','good_value','pending'],
    isActive: Boolean
}
Rules Collection
javascript
{
    user: ObjectId(ref: 'User'),
    condition: ['cost_gt','cost_lt','usage_lt','usage_gt','cycle_eq'],
    threshold: Number,
    classification: String
}
Running Locally
Prerequisites
Node.js (v14+)

MongoDB Atlas account or local MongoDB

Backend Setup
bash
git clone <repo>
cd backend
npm install

# Create .env file
echo "MONGODB_URI=your_mongodb_connection_string" >> .env
echo "JWT_SECRET=your_secret_key" >> .env

npm start
Frontend Setup
bash
cd frontend
npm install
npm start
Security Features
Feature	Implementation
Password protection	bcrypt hashing (10 rounds)
Authentication	JWT tokens (7-day expiry)
Route protection	Auth middleware on all protected endpoints
Data isolation	All queries include user: req.user.id
Input validation	Mongoose schema validation (min, max, enum)
Live Testing
Register at: https://subscription-analyzer-git-main-aaa3525s-projects.vercel.app/register

Login at: https://subscription-analyzer-git-main-aaa3525s-projects.vercel.app/login

Add subscriptions with cost and usage frequency

Create classification rules in the Rules page

View recommendations on Dashboard

Project Status
✅ Frontend deployed (Vercel)
✅ Backend deployed (Railway)
✅ MongoDB Atlas connected
✅ JWT authentication working
✅ Rule engine functional
✅ Analytics queries implemented

Author
Amnah Asrar | Roll No: 23i-5550
