import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/index.js';

const STEPS = [
  { icon: '✏️', step: '01', title: 'Create Account', desc: 'Sign up free in under 60 seconds — no credit card needed, no setup fees ever.' },
  { icon: '💳', step: '02', title: 'Add Your Wallets', desc: 'Add bank accounts, UPI apps, credit cards, and cash wallets in one place.' },
  { icon: '💸', step: '03', title: 'Track Expenses', desc: 'Add transactions manually or set up recurring entries automatically.' },
  { icon: '📈', step: '04', title: 'Grow Your Savings', desc: 'Set budgets, create goals, and watch your savings grow month after month.' },
];

export default function CTASection() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  return (
    <section id="cta" className="min-h-screen flex items-center px-6 lg:px-12 py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-600" />
      <div className="absolute inset-0 opacity-20"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v6h6v-6h-6zm0-30v6h6V4h-6zM6 34v6h6v-6H6zM6 4v6h6V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
      <motion.div className="absolute top-0 left-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }} />
      <motion.div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 6, repeat: Infinity, delay: 2 }} />

      <div className="relative max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-semibold mb-4">
            🚀 Get Started in 4 Easy Steps
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-3">
            Up & Running in Under 5 Minutes
          </h2>
          <p className="text-white/70 text-lg max-w-xl mx-auto">No complex setup. No onboarding calls. Just sign up and start tracking.</p>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {STEPS.map((s, i) => (
            <motion.div key={s.step}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.12 }} viewport={{ once: true }}
              className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-white hover:bg-white/15 transition-all duration-300 group">
              {i < STEPS.length - 1 && <div className="hidden lg:block absolute top-8 -right-3 w-6 h-px bg-white/30 z-10" />}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{s.icon}</span>
                <span className="text-xs font-bold text-white/50 bg-white/10 px-2 py-1 rounded-lg">{s.step}</span>
              </div>
              <h3 className="font-bold text-base mb-2 group-hover:text-yellow-300 transition-colors">{s.title}</h3>
              <p className="text-sm text-white/70 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA card */}
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }} viewport={{ once: true }}
          className="bg-white dark:bg-gray-900 rounded-3xl p-8 text-center shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-left">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                className="text-4xl mb-3 inline-block">💸</motion.div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                Ready to Transform Your{' '}
                <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">Financial Future?</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-base mb-3 max-w-lg">
                Join 50,000+ Indians who stopped wondering where their money goes.
              </p>
              <div className="flex flex-wrap gap-5">
                {['✅ Free Forever', '✅ No Credit Card', '✅ Setup in 2 min', '✅ 100% Secure'].map(t => (
                  <span key={t} className="text-sm text-gray-400 font-medium">{t}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0">
              <motion.button whileHover={{ scale: 1.05, boxShadow: '0 16px 40px rgba(37,99,235,0.35)' }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(user ? '/dashboard' : '/register')}
                className="px-10 py-4 text-base font-bold text-white rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 shadow-lg flex items-center gap-2">
                Get Started — It's Free
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>🚀</motion.span>
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(user ? '/dashboard' : '/login')}
                className="px-10 py-3 text-base font-bold text-gray-700 dark:text-gray-300 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-all">
                Sign In to Your Account
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}