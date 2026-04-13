/**
 * Demo Account Seed Script
 * ========================
 * Creates a realistic Indian user with 6 months of transaction history.
 *
 * Run:  node server/scripts/seed.js
 *
 * Demo Login:
 *   Email:    demo@expensly.app
 *   Password: Demo@123
 */

'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ── Models (inline to avoid import issues) ───────────────────────────────────
const User = require('../models/User');
const { Account, Wallet, Budget, SavingsGoal, Debt, Transaction } = require('../models/index');

// ── Config ────────────────────────────────────────────────────────────────────
const DEMO_EMAIL    = 'demo@expensly.app';
const DEMO_PASSWORD = 'Demo@123';
const DEMO_NAME     = 'Rahul Sharma';

// ── Category definitions (matching client BUILTIN_CATS) ──────────────────────
const CAT = {
  salary:      { name: 'Salary',         icon: '💼', color: '#10B981', slug: 'salary'      },
  freelance:   { name: 'Freelance',      icon: '💻', color: '#6366f1', slug: 'freelance'   },
  food:        { name: 'Food & Dining',  icon: '🍜', color: '#f6ad55', slug: 'food'        },
  grocery:     { name: 'Groceries',      icon: '🛒', color: '#48bb78', slug: 'grocery'     },
  transport:   { name: 'Transport',      icon: '🚗', color: '#63b3ed', slug: 'trans'       },
  fuel:        { name: 'Fuel',           icon: '⛽', color: '#f6c90e', slug: 'fuel'        },
  utility:     { name: 'Utilities',      icon: '💡', color: '#fc8181', slug: 'util'        },
  mobile:      { name: 'Mobile',         icon: '📱', color: '#b794f4', slug: 'mobile'      },
  internet:    { name: 'Internet',       icon: '🌐', color: '#76e4f7', slug: 'internet'    },
  rent:        { name: 'Rent',           icon: '🏠', color: '#fc8181', slug: 'rent'        },
  shopping:    { name: 'Shopping',       icon: '🛍️',  color: '#b794f4', slug: 'shop'       },
  health:      { name: 'Health',         icon: '💊', color: '#f687b3', slug: 'health'      },
  gym:         { name: 'Gym & Fitness',  icon: '🏋️',  color: '#4fd1c5', slug: 'gym'        },
  ent:         { name: 'Entertainment',  icon: '🎬', color: '#76e4f7', slug: 'ent'         },
  subscription:{ name: 'Subscriptions', icon: '📺', color: '#a78bfa', slug: 'sub'         },
  transfer:    { name: 'Transfer',       icon: '↔️',  color: '#a0aec0', slug: 'transfer'   },
  investment:  { name: 'Investment',     icon: '📈', color: '#10B981', slug: 'invest'      },
  snacks:      { name: 'Snacks & Chai',  icon: '☕', color: '#f6ad55', slug: 'snacks'      },
  misc:        { name: 'Miscellaneous',  icon: '📦', color: '#a0aec0', slug: 'misc'        },
};

// ── Helper: make a date ───────────────────────────────────────────────────────
function d(year, month, day, hour = 10, min = 0) {
  return new Date(year, month - 1, day, hour, min);
}

// ── Helper: pick random from array ───────────────────────────────────────────
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Transaction template builder ─────────────────────────────────────────────
function txn(type, amount, cat, note, date, walletField) {
  return { type, amount, cat, note, date, walletField };
}

// ── 6 months of realistic Indian data (Oct 2024 – Mar 2025) ─────────────────
function buildTransactions() {
  const list = [];

  const months = [
    { y: 2024, m: 10, label: 'October 2024'   },
    { y: 2024, m: 11, label: 'November 2024'  },
    { y: 2024, m: 12, label: 'December 2024'  },
    { y: 2025, m: 1,  label: 'January 2025'   },
    { y: 2025, m: 2,  label: 'February 2025'  },
    { y: 2025, m: 3,  label: 'March 2025'     },
  ];

  for (const { y, m } of months) {
    // ── Salary (25th of month) ──────────────────────────────────────────────
    list.push(txn('income', 65000, CAT.salary, 'Monthly salary - TechCorp India', d(y,m,25,10,0), 'hdfc'));

    // ── Freelance (some months) ─────────────────────────────────────────────
    if ([10, 12, 2].includes(m)) {
      list.push(txn('income', pick([8000, 12000, 9500]), CAT.freelance, 'Freelance project payment', d(y,m,pick([12,18,22]),15,30), 'hdfc'));
    }

    // ── Rent (1st of month) ─────────────────────────────────────────────────
    list.push(txn('expense', 18000, CAT.rent, 'Monthly rent - 2BHK Andheri West', d(y,m,1,9,0), 'hdfc'));

    // ── Electricity (varies ₹1800–₹2900) ───────────────────────────────────
    const elec = pick([1850, 2100, 2450, 2680, 2280, 1920]);
    list.push(txn('expense', elec, CAT.utility, 'MSEDCL Electricity bill', d(y,m,pick([5,7,8]),11,0), 'hdfc'));

    // ── Gas cylinder (once per month mostly) ────────────────────────────────
    if ([10, 11, 1, 3].includes(m)) {
      list.push(txn('expense', 903, CAT.utility, 'Indane LPG cylinder', d(y,m,pick([8,12,15]),12,0), 'cash'));
    }

    // ── Mobile recharge ──────────────────────────────────────────────────────
    list.push(txn('expense', 299, CAT.mobile, 'Jio 84-day recharge', d(y,m,pick([2,3,5]),18,0), 'hdfc'));

    // ── Internet / broadband ─────────────────────────────────────────────────
    list.push(txn('expense', 799, CAT.internet, 'Hathway broadband monthly', d(y,m,pick([8,10,12]),10,0), 'hdfc'));

    // ── Netflix ──────────────────────────────────────────────────────────────
    list.push(txn('expense', 649, CAT.subscription, 'Netflix Premium monthly', d(y,m,pick([7,8,9]),9,0), 'hdfc'));

    // ── Spotify ──────────────────────────────────────────────────────────────
    list.push(txn('expense', 119, CAT.subscription, 'Spotify Premium', d(y,m,pick([10,12,14]),9,0), 'hdfc'));

    // ── Gym ──────────────────────────────────────────────────────────────────
    list.push(txn('expense', 1500, CAT.gym, 'Anytime Fitness monthly membership', d(y,m,1,8,0), 'cash'));

    // ── Swiggy / Zomato ──────────────────────────────────────────────────────
    const foodOrders = [
      { note: 'Swiggy - Biryani Palace', amt: pick([320, 450, 520, 389]) },
      { note: 'Zomato - Burger King',    amt: pick([380, 420, 290]) },
      { note: 'Swiggy - Pizza Hut',      amt: pick([550, 620, 480]) },
      { note: 'Zomato - Thali Bhai',     amt: pick([220, 280, 310]) },
    ];
    const numOrders = pick([3, 4, 5]);
    for (let i = 0; i < numOrders; i++) {
      const fo = pick(foodOrders);
      list.push(txn('expense', fo.amt, CAT.food, fo.note, d(y,m,pick([3,5,8,10,12,15,18,20,22,25,28]),pick([12,13,19,20])), 'hdfc'));
    }

    // ── Groceries (BigBasket / Blinkit / DMart) ──────────────────────────────
    list.push(txn('expense', pick([1850, 2200, 1650, 2400]), CAT.grocery, 'BigBasket monthly grocery', d(y,m,pick([3,5,6]),11,0), 'hdfc'));
    list.push(txn('expense', pick([650, 820, 540, 720]), CAT.grocery, 'Blinkit - vegetables & daily items', d(y,m,pick([12,15,18]),18,0), 'hdfc'));
    if (m !== 2) {
      list.push(txn('expense', pick([1200, 980, 1100]), CAT.grocery, 'DMart monthly shopping', d(y,m,pick([20,22,24]),11,0), 'cash'));
    }

    // ── Fuel ─────────────────────────────────────────────────────────────────
    list.push(txn('expense', pick([2000, 2500, 1800, 2200]), CAT.fuel, 'Petrol - Hero Splendor', d(y,m,pick([7,14,21]),18,30), 'cash'));

    // ── Chai & snacks ─────────────────────────────────────────────────────────
    for (let i = 0; i < pick([3,4,5]); i++) {
      list.push(txn('expense', pick([40, 60, 80, 50, 120]), CAT.snacks, pick(['Chai with colleagues', 'Canteen lunch', 'Tea break', 'Vada pav', 'Samosa & chai']), d(y,m,pick([2,4,6,8,11,14,16,19,21,23,26]),pick([9,11,15,16])), 'cash'));
    }

    // ── Medicine / pharmacy ──────────────────────────────────────────────────
    if ([10, 1, 3].includes(m)) {
      list.push(txn('expense', pick([480, 360, 520, 290]), CAT.health, pick(['Pharmacy - cold & fever', 'Cipla vitamins', 'Dolo 650 + antibiotics']), d(y,m,pick([5,12,18]),19,0), 'cash'));
    }

    // ── Shopping ─────────────────────────────────────────────────────────────
    if ([10, 11, 12].includes(m)) {
      list.push(txn('expense', pick([1800, 2500, 1200, 3200]), CAT.shopping, pick(['Myntra - 2 shirts', 'Amazon - headphones case', 'Zara - casual wear', 'Ajio - joggers']), d(y,m,pick([14,16,18,20]),15,0), 'hdfc'));
    }
    if ([1, 2].includes(m)) {
      list.push(txn('expense', pick([899, 1299, 750]), CAT.shopping, pick(['H&M - winter jacket', 'Decathlon - sports shoes', 'Puma - gym wear']), d(y,m,pick([8,12,15]),16,0), 'hdfc'));
    }

    // ── Auto / Ola / Uber ────────────────────────────────────────────────────
    for (let i = 0; i < pick([2,3]); i++) {
      list.push(txn('expense', pick([120, 180, 220, 95, 150]), CAT.transport, pick(['Ola Auto - office', 'Uber cab - late night', 'Metro card recharge', 'Rapido bike']), d(y,m,pick([3,7,10,13,17,20,24,27]),pick([8,9,18,19,21])), 'cash'));
    }

    // ── Entertainment ───────────────────────────────────────────────────────
    if ([10, 11, 12, 1].includes(m)) {
      list.push(txn('expense', pick([500, 380, 720, 450]), CAT.ent, pick(['PVR Cinemas - 2 tickets', 'Inox movies', 'Bowling with friends', 'Escape room']), d(y,m,pick([13,19,20,26]),14,0), 'hdfc'));
    }

    // ── Transfer to parents ──────────────────────────────────────────────────
    list.push(txn('expense', 3000, CAT.transfer, 'UPI transfer - Parents (Mom)', d(y,m,pick([26,27,28]),10,0), 'hdfc'));

    // ── SIP / Investment ────────────────────────────────────────────────────
    list.push(txn('expense', 5000, CAT.investment, 'Zerodha - Nifty50 SIP investment', d(y,m,5,9,0), 'hdfc'));

    // ── ATM cash withdrawal (some months) ───────────────────────────────────
    if ([10, 12, 2, 3].includes(m)) {
      list.push(txn('expense', pick([3000, 5000, 2000]), CAT.misc, 'ATM withdrawal - HDFC', d(y,m,pick([4,11,19]),11,0), 'hdfc'));
    }

    // ── Water bill (quarterly - Oct, Jan) ───────────────────────────────────
    if ([10, 1].includes(m)) {
      list.push(txn('expense', pick([350, 420, 280]), CAT.utility, 'BMC water bill', d(y,m,pick([15,18,20]),11,0), 'hdfc'));
    }

    // ── Milk (daily, summarized weekly x4) ─────────────────────────────────
    for (let week = 1; week <= 4; week++) {
      list.push(txn('expense', pick([280, 320, 300, 260]), CAT.grocery, 'Amul milk - weekly', d(y,m,week*7,8,0), 'cash'));
    }
  }

  return list;
}

// ── Main seed function ────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🌱 Expensly Demo Account Seeder\n' + '─'.repeat(40));

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expensly');
  console.log('✅ MongoDB connected');

  // ── 1. Clean up old demo account ─────────────────────────────────────────
  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) {
    console.log('♻️  Removing existing demo account...');
    const uid = existing._id;
    await Promise.all([
      Transaction.deleteMany({ userId: uid }),
      Budget.deleteMany({ userId: uid }),
      SavingsGoal.deleteMany({ userId: uid }),
      Debt.deleteMany({ userId: uid }),
      Wallet.deleteMany({ userId: uid }),
      Account.deleteMany({ userId: uid }),
      User.deleteOne({ _id: uid }),
    ]);
  }

  // ── 2. Create user ────────────────────────────────────────────────────────
  const user = await User.create({
    name:           DEMO_NAME,
    email:          DEMO_EMAIL,
    password:       DEMO_PASSWORD,  // pre-save hook hashes it
    currency:       'INR',
    currencySymbol: '₹',
    theme:          'dark',
    notifications:  { budgetAlerts: true, pushEnabled: false },
    monthStart:     1,
  });
  console.log(`✅ User created: ${DEMO_NAME} <${DEMO_EMAIL}>`);

  // ── 3. Create account ─────────────────────────────────────────────────────
  const account = await Account.create({
    userId: user._id, name: 'Personal', icon: '👤', color: '#63b3ed', isDefault: true,
  });

  // ── 4. Create wallets ─────────────────────────────────────────────────────
  const hdfc = await Wallet.create({
    userId: user._id, accountId: account._id,
    name: 'HDFC Savings', type: 'bank', balance: 0,
    icon: '🏦', color: '#2563EB', includeInTotal: true,
  });
  const cash = await Wallet.create({
    userId: user._id, accountId: account._id,
    name: 'Cash Wallet', type: 'cash', balance: 0,
    icon: '💵', color: '#10B981', includeInTotal: true,
  });
  const credit = await Wallet.create({
    userId: user._id, accountId: account._id,
    name: 'HDFC Credit Card', type: 'credit', balance: 0,
    icon: '💳', color: '#8B5CF6', creditLimit: 150000, includeInTotal: false,
  });
  console.log('✅ Wallets created: HDFC Savings, Cash Wallet, HDFC Credit Card');

  // ── 5. Insert transactions & compute balances ─────────────────────────────
  const rawTxns   = buildTransactions();
  let hdfcBal     = 0;
  let cashBal     = 0;

  const txnDocs = rawTxns.map(t => {
    const wid = t.walletField === 'hdfc' ? hdfc._id : cash._id;
    const signed = t.type === 'income' ? t.amount : -t.amount;
    if (t.walletField === 'hdfc') hdfcBal += signed;
    else cashBal += signed;
    return {
      userId:   user._id,
      type:     t.type,
      amount:   t.amount,
      catId:    t.cat.slug,
      category: { name: t.cat.name, icon: t.cat.icon, color: t.cat.color, slug: t.cat.slug },
      walletId: wid,
      date:     t.date,
      note:     t.note,
      tags:     [],
    };
  });

  await Transaction.insertMany(txnDocs);
  console.log(`✅ Inserted ${txnDocs.length} transactions`);

  // Update wallet balances
  await Wallet.findByIdAndUpdate(hdfc._id, { balance: Math.round(hdfcBal * 100) / 100 });
  await Wallet.findByIdAndUpdate(cash._id,  { balance: Math.max(0, Math.round(cashBal * 100) / 100) });
  console.log(`   HDFC balance: ₹${Math.round(hdfcBal).toLocaleString('en-IN')}`);
  console.log(`   Cash balance: ₹${Math.max(0, Math.round(cashBal)).toLocaleString('en-IN')}`);

  // ── 6. Create budgets ─────────────────────────────────────────────────────
  const budgetDefs = [
    { catId: 'food',    catName: 'Food & Dining',  catIcon: '🍜', catColor: '#f6ad55', limit: 8000  },
    { catId: 'shop',    catName: 'Shopping',        catIcon: '🛍️', catColor: '#b794f4', limit: 5000  },
    { catId: 'ent',     catName: 'Entertainment',   catIcon: '🎬', catColor: '#76e4f7', limit: 2000  },
    { catId: 'trans',   catName: 'Transport',       catIcon: '🚗', catColor: '#63b3ed', limit: 3000  },
    { catId: 'util',    catName: 'Utilities',       catIcon: '💡', catColor: '#fc8181', limit: 6000  },
    { catId: 'grocery', catName: 'Groceries',       catIcon: '🛒', catColor: '#48bb78', limit: 6000  },
    { catId: 'health',  catName: 'Health',          catIcon: '💊', catColor: '#f687b3', limit: 2000  },
  ];
  await Budget.insertMany(budgetDefs.map(b => ({
    userId: user._id, ...b, period: 'monthly', alertThreshold: 80, isActive: true,
  })));
  console.log(`✅ Created ${budgetDefs.length} budgets`);

  // ── 7. Create savings goals ───────────────────────────────────────────────
  const goals = [
    {
      name: 'Goa Trip 🏖️', targetAmount: 30000, currentAmount: 18500,
      icon: '✈️', color: '#06B6D4', targetDate: new Date('2025-06-01'),
    },
    {
      name: 'Emergency Fund 🛡️', targetAmount: 200000, currentAmount: 86000,
      icon: '🛡️', color: '#10B981', targetDate: new Date('2025-12-31'),
    },
    {
      name: 'New MacBook 💻', targetAmount: 120000, currentAmount: 34000,
      icon: '💻', color: '#6366f1', targetDate: new Date('2025-10-01'),
    },
    {
      name: 'Bike Upgrade 🏍️', targetAmount: 80000, currentAmount: 15000,
      icon: '🏍️', color: '#F59E0B', targetDate: new Date('2026-01-01'),
    },
  ];
  await SavingsGoal.insertMany(goals.map(g => ({ userId: user._id, ...g })));
  console.log(`✅ Created ${goals.length} savings goals`);

  // ── 8. Create debts ───────────────────────────────────────────────────────
  const debts = [
    {
      type: 'owe', person: 'Raj Patel', amount: 3500, paid: 0,
      dueDate: new Date('2025-04-30'), note: 'Birthday dinner split last month',
    },
    {
      type: 'owe', person: 'Sneha (Flatmate)', amount: 1200, paid: 0,
      dueDate: new Date('2025-04-15'), note: 'Electricity bill share this month',
    },
    {
      type: 'lent', person: 'Priya Singh', amount: 5000, paid: 2000,
      dueDate: new Date('2025-05-01'), note: 'Emergency money lent in February',
    },
    {
      type: 'lent', person: 'Vikram (Colleague)', amount: 800, paid: 0,
      dueDate: new Date('2025-04-10'), note: 'Office lunch last Friday',
    },
  ];
  await Debt.insertMany(debts.map(d => ({ userId: user._id, ...d })));
  console.log(`✅ Created ${debts.length} debt entries`);

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(40));
  console.log('🎉 Demo account seeded successfully!\n');
  console.log('  📧 Email:    demo@expensly.app');
  console.log('  🔑 Password: Demo@123');
  console.log('  👤 Name:     Rahul Sharma');
  console.log('  📊 Data:     Oct 2024 – Mar 2025 (6 months)');
  console.log('  💳 Wallets:  HDFC Savings + Cash + Credit Card');
  console.log('  📋 Budgets:  7 monthly budgets');
  console.log('  🎯 Goals:    4 savings goals');
  console.log('  🤝 Debts:    4 entries (2 owe, 2 lent)');
  console.log('  📈 Txns:     ' + txnDocs.length + ' transactions');
  console.log('═'.repeat(40) + '\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
