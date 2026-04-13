import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/index.js';

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[260px] h-[500px]">
      <div className="w-full h-full rounded-[2.5rem] p-[2px] bg-gradient-to-b from-gray-300 to-gray-400 dark:from-white dark:to-gray-200 shadow-2xl">
        <div className="w-full h-full bg-gray-900 rounded-[2.4rem] p-[3px]">
          <div className="w-full h-full bg-white dark:bg-gray-100 rounded-[2.2rem] overflow-hidden flex flex-col">
            {/* Status bar */}
            <div className="bg-white flex items-center justify-between px-5 pt-3 pb-1">
              <span className="text-[11px] font-semibold text-gray-800">9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-5 h-2.5 rounded-sm border border-gray-600 relative">
                  <div className="absolute inset-0.5 bg-green-500 rounded-sm" />
                </div>
              </div>
            </div>
            {/* App content */}
            <div className="flex-1 bg-gray-50 px-3 py-2 space-y-2.5 overflow-hidden">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[11px] text-gray-500">Good Morning 👋</p>
                  <p className="text-sm font-bold text-gray-800">Monish Shekh</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center">
                  <span className="text-white text-[11px] font-bold">M</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-emerald-500 rounded-2xl p-3 text-white">
                <p className="text-[10px] opacity-80 font-medium">Total Balance</p>
                <p className="text-xl font-bold">₹1,24,580</p>
                <div className="flex gap-3 mt-1.5">
                  <div><p className="text-[9px] opacity-70">Income</p><p className="text-xs font-semibold text-green-200">+₹45,000</p></div>
                  <div className="w-px bg-white/30" />
                  <div><p className="text-[9px] opacity-70">Spent</p><p className="text-xs font-semibold text-red-200">-₹18,420</p></div>
                  <div className="w-px bg-white/30" />
                  <div><p className="text-[9px] opacity-70">Saved</p><p className="text-xs font-semibold">+₹26,580</p></div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[['💸', 'Expense'], ['💰', 'Income'], ['🔄', 'Transfer'], ['🎯', 'Goals']].map(([ic, lb]) => (
                  <div key={lb} className="bg-white rounded-xl p-2 flex flex-col items-center gap-0.5 shadow-sm">
                    <span className="text-base">{ic}</span>
                    <span className="text-[8px] text-gray-500 font-medium">{lb}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl p-2.5 shadow-sm">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-semibold text-gray-700">Monthly Budget</span>
                  <span className="text-[9px] text-emerald-600 font-semibold">62% left</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                    initial={{ width: 0 }} animate={{ width: '38%' }} transition={{ duration: 1.5, delay: 0.5 }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[8px] text-gray-400">₹11,200 spent</span>
                  <span className="text-[8px] text-gray-400">₹18,000 limit</span>
                </div>
              </div>
              <div className="bg-white rounded-xl p-2.5 shadow-sm space-y-1.5">
                <p className="text-[10px] font-bold text-gray-700">Recent</p>
                {[['🛒', 'Blinkit', 'Groceries', '-₹840', 'text-red-500'], ['💊', 'Apollo', 'Health', '-₹320', 'text-red-500'], ['💼', 'Salary', 'Income', '+₹45k', 'text-emerald-600']].map(([ic, nm, ct, am, cl]) => (
                  <div key={nm} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-[11px]">{ic}</div>
                      <div><p className="text-[9px] font-semibold text-gray-700">{nm}</p><p className="text-[8px] text-gray-400">{ct}</p></div>
                    </div>
                    <span className={`text-[10px] font-bold ${cl}`}>{am}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border-t border-gray-100 flex justify-around py-2 px-2">
              {['🏠', '📊', '💳', '🎯', '⚙️'].map((ic, i) => (
                <div key={i} className={`flex flex-col items-center gap-0.5 ${i === 0 ? 'opacity-100' : 'opacity-40'}`}>
                  <span className="text-sm">{ic}</span>
                  {i === 0 && <div className="w-1 h-1 rounded-full bg-blue-600" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  return (
    <section id="hero" className="min-h-screen flex items-center px-6 lg:px-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
      <motion.div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-400/15 blur-3xl"
        animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 7, repeat: Infinity }} />
      <motion.div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full bg-emerald-400/15 blur-3xl"
        animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 9, repeat: Infinity, delay: 2 }} />

      <div className="relative max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* LEFT — Text */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-sm font-semibold mb-6">
            <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}>🚀</motion.span>
            Made for India · Secure & Private
          </motion.div>

          <h1 className="text-5xl xl:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
            Master Your Money with{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">Smart Expense</span>
              <motion.div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.8 }} />
            </span>{' '}Tracking
          </h1>

          <p className="text-xl text-gray-500 dark:text-gray-400 mb-8 leading-relaxed max-w-xl">
            Stop guessing where your money goes. Expensly tracks your wallets, budgets, and expenses —
            giving you crystal-clear insights to{' '}
            <span className="text-blue-600 dark:text-blue-400 font-semibold">save more, stress less.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <motion.button whileHover={{ scale: 1.04, boxShadow: '0 12px 32px rgba(37,99,235,0.35)' }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate(user ? '/dashboard' : '/register')}
              className="px-8 py-4 text-base font-bold text-white rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 shadow-lg flex items-center justify-center gap-2">
              {user ? 'Go to Dashboard →' : "Get Started — It's Free"}
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              className="px-8 py-4 text-base font-bold text-gray-700 dark:text-gray-300 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-gray-900 transition-all">
              Already have an account? Sign In
            </motion.button>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-8">
            {['Free Forever', 'No Credit Card', 'Bank-level Security', 'Works Offline'].map(t => (
              <div key={t} className="flex items-center gap-2">
                <motion.div className="w-2 h-2 rounded-full bg-emerald-500"
                  animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                <span className="font-medium">{t}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-sm">
            {[['50,000+', 'Active Users'], ['₹100Cr+', 'Tracked'], ['4.8/5', 'Avg Rating']].map(([val, lbl]) => (
              <div key={lbl} className="text-center bg-white/70 dark:bg-gray-800/50 backdrop-blur rounded-2xl py-3 border border-gray-100 dark:border-gray-700 shadow-sm">
                <p className="text-lg font-extrabold text-gray-800 dark:text-white">{val}</p>
                <p className="text-xs text-gray-400 mt-0.5">{lbl}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT — Phone */}
        <motion.div initial={{ opacity: 0, x: 50, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }} className="relative flex justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/15 to-emerald-400/15 rounded-full blur-3xl scale-75" />
          <PhoneMockup />
          {/* Floating Goal card */}
          <motion.div animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
            className="absolute -top-2 -right-6 lg:-right-12 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-3 shadow-xl min-w-[150px]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xs">🎯</div>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Goal Progress</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold">68% reached!</p>
            <p className="text-[9px] text-gray-400 mt-0.5">Goa Trip · ₹34k saved</p>
          </motion.div>
          {/* Floating Savings card */}
          <motion.div animate={{ y: [8, -8, 8] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute -bottom-2 -left-6 lg:-left-12 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-3 shadow-xl min-w-[150px]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-xs">💰</div>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Monthly Saved</span>
            </div>
            <p className="text-[11px] text-blue-600 font-semibold">+₹8,580</p>
            <p className="text-[9px] text-gray-400 mt-0.5">Best month this year ✓</p>
          </motion.div>
          {/* Budget pill */}
          <motion.div animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
            className="absolute top-1/2 -right-2 lg:-right-8 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-3 shadow-xl">
            <p className="text-[9px] font-medium opacity-80">Budget Left</p>
            <p className="text-base font-extrabold">₹6,800</p>
            <p className="text-[9px] opacity-70 mt-0.5">Food · 3 days left</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}