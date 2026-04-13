import React from 'react';
import { motion } from 'framer-motion';

const BENEFITS = [
  { icon: '🇮🇳', title: 'Built for India', desc: 'INR-first, UPI-aware, supports SBI, HDFC, ICICI, Axis and all major Indian banks out of the box.' },
  { icon: '🎯', title: 'Smart Budgeting', desc: 'Set monthly spending limits per category and get real-time alerts at 80% so you never overspend again.' },
  { icon: '🔒', title: 'Bank-Level Security', desc: 'End-to-end encryption on all your data. We never share or sell your financial information to anyone.' },
  { icon: '📊', title: 'Instant Insights', desc: 'Beautiful charts and trends show exactly where your money goes every month — income, expenses, savings.' },
  { icon: '🏆', title: 'Goal Tracking', desc: 'Set savings targets for anything — travel, gadgets, emergencies — and watch progress grow over time.' },
  { icon: '🤝', title: 'Debt Management', desc: 'Track every IOU clearly. Know exactly who owes you and what you owe — with payment history.' },
];

const STATS = [
  { val: '50,000+', label: 'Active Users', color: 'from-blue-500 to-indigo-500', icon: '👥' },
  { val: '₹100Cr+', label: 'Expenses Tracked', color: 'from-emerald-500 to-teal-500', icon: '💰' },
  { val: '4.8/5', label: 'App Rating', color: 'from-amber-400 to-orange-500', icon: '⭐' },
  { val: '100%', label: 'Free Forever', color: 'from-purple-500 to-violet-500', icon: '🎁' },
];

export default function BenefitsSection() {
  return (
    <section id="benefits" className="min-h-screen flex items-center px-6 lg:px-12 py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold border border-emerald-100 dark:border-emerald-800 mb-3">
            ✨ Why Expensly
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Designed for{' '}
            <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
              Real Financial Clarity
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">Everything you need to take control of your money.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {STATS.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: i * 0.08 }} viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="text-center p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-all">
              <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl shadow-md`}>{s.icon}</div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{s.val}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {BENEFITS.map((b, i) => (
            <motion.div key={b.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.08 }} viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg transition-all duration-200">
              <div className="text-3xl mb-3">{b.icon}</div>
              <p className="text-base font-bold text-gray-800 dark:text-white mb-2">{b.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}