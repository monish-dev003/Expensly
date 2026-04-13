# Expensly v6 — Full Stack Personal Finance Manager

> **Professional MERN stack money manager** — React + Vite + Tailwind + Framer Motion + MongoDB + Express + JWT

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **MongoDB** (local: `mongodb://localhost:27017` or free Atlas cloud)

### 1. Backend
```bash
cd server
npm install
# Edit server/.env — set MONGODB_URI to your MongoDB connection string
npm run dev        # starts on http://localhost:5000
```

### 2. Frontend
```bash
cd client
npm install
npm run dev        # starts on http://localhost:5173
```

### 3. Seed demo account (optional)
```bash
cd server
node scripts/seed.js
# Demo: demo@expensly.app / Demo@123
```

---

## 🔧 Environment Setup

### `server/.env`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/expensly   # ← change this
JWT_ACCESS_SECRET=<already generated>
JWT_REFRESH_SECRET=<already generated>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d
CLIENT_URL=http://localhost:5173

# Optional — only needed for Google/Phone login
FIREBASE_SERVICE_ACCOUNT_B64=

# Optional — only needed for forgot-password emails
GMAIL_USER=your@gmail.com
GMAIL_PASS=xxxx xxxx xxxx xxxx
```

### `client/.env`
```env
VITE_API_URL=http://localhost:5000/api
# Optional — Firebase for Google/phone login
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
```

---

## ✅ Feature Checklist

| Feature | Status |
|---------|--------|
| Email/password register & login | ✅ |
| Google & phone (OTP) login via Firebase | ✅ Optional |
| JWT access + refresh token rotation | ✅ |
| 4-digit PIN lock with brute-force protection | ✅ |
| Auto-lock after idle (configurable) | ✅ |
| Dark / Light / System theme | ✅ |
| Dashboard with real-time balance, charts | ✅ |
| Wallets (cash, bank, credit, investment…) | ✅ |
| Add/edit/delete transactions | ✅ |
| Category breakdown (built-in + custom) | ✅ |
| Recurring transactions (cron) | ✅ |
| Budgets with over-limit alerts | ✅ |
| Savings Goals with contribution tracking | ✅ |
| Debt Tracker (owe / lent) | ✅ |
| Reports & Analytics (charts, trends) | ✅ |
| Statistics page (period comparison) | ✅ |
| Calendar view by day | ✅ |
| Export CSV & Excel | ✅ |
| Settings: currency, month start, notifications | ✅ |
| Avatar upload (Cloudinary) | ✅ Optional |
| Onboarding flow for new users | ✅ |
| Offline banner | ✅ |
| PWA manifest | ✅ |
| Full-screen loading skeleton | ✅ |
| Race-condition-safe API calls | ✅ |
| Mobile responsive + bottom nav | ✅ |

---

## 🏗️ Project Structure

```
expensly-v6/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── api/index.js        # Axios instance + JWT interceptor
│   │   ├── store/index.js      # Zustand stores (auth, pin, app data)
│   │   ├── utils/categories.js # Shared category constants (single source of truth)
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── BottomTabNavigation.jsx  # Collapsible sidebar + mobile nav
│   │   │   │   ├── PinLock.jsx              # Full-screen PIN overlay
│   │   │   │   └── PageLayout.jsx           # Shared layout wrapper
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── FullScreenLoader.jsx
│   │   └── pages/
│   │       ├── dashboard/       # Main overview with charts
│   │       ├── transactions-list/
│   │       ├── add-transaction/
│   │       ├── wallets/
│   │       ├── budgets/
│   │       ├── goals/
│   │       ├── debts/
│   │       ├── reports-analytics/
│   │       ├── statistics/      # NEW — period comparison page
│   │       ├── calendar/
│   │       └── settings/
│   └── public/manifest.json    # PWA manifest
│
└── server/                     # Express + MongoDB backend
    ├── app.js                  # Express setup, security, graceful shutdown
    ├── controllers/
    │   ├── authController.js   # Register, login, PIN, password reset
    │   ├── resourceController.js # Wallets, budgets, goals, debts, categories
    │   ├── transactionController.js # CRUD + export (CSV/Excel)
    │   └── statsController.js  # Aggregation pipelines for charts
    ├── models/index.js         # All Mongoose schemas + indexes
    ├── middleware/
    │   ├── auth.js             # JWT protect + assertOwner helper
    │   └── errorHandler.js     # Global error handler
    ├── jobs/recurringJob.js    # node-cron for recurring transactions
    └── scripts/seed.js         # Demo account seeder
```

---

## 🔒 Security Features
- JWT access tokens (15m) + refresh tokens (30d) with rotation
- Bcrypt password + PIN hashing (rounds 12/10)
- Helmet.js with Content Security Policy
- CORS restricted to CLIENT_URL in production
- Rate limiting: 20 req/15min for auth, 300 req/15min general
- NoSQL injection sanitization middleware
- `assertOwner()` helper prevents IDOR attacks
- `.env` files excluded via `.gitignore`

---

## 📦 Tech Stack

**Frontend**  
React 18, Vite 5, TailwindCSS 3, Framer Motion 11, Recharts, Zustand 4, react-hot-toast, react-helmet-async, lucide-react, date-fns, Firebase SDK (optional)

**Backend**  
Node.js, Express 4, MongoDB + Mongoose 8, JWT, bcryptjs, Helmet, CORS, Morgan, ExcelJS, node-cron, Nodemailer, Firebase Admin SDK (optional), Cloudinary (optional)
