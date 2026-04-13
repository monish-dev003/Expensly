import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FEATURES = [
  {
    id: 1, icon: '💰', title: 'Multi-Wallet Management', badge: 'Finance Hub', badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', color: 'from-emerald-500 to-teal-500',
    detail: 'Track all bank accounts, UPI wallets, cards, and cash in one unified dashboard. Switch between SBI, HDFC, Paytm, PhonePe and cash — all balances in real time.',
    examples: ['🏦 SBI Savings: ₹45,280', '📱 Paytm: ₹2,150', '💵 Cash: ₹500']
  },
  {
    id: 2, icon: '📊', title: 'Smart Budget Tracking', badge: 'Most Popular', badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', color: 'from-blue-500 to-indigo-500',
    detail: 'Set monthly limits per category. Visual progress bars + alerts fire at 80% so you always know before you overspend.',
    examples: ['🍜 Food Budget: ₹4,000/mo', '⚠️ Alert at 80%', '✅ ₹1,600 remaining']
  },
  {
    id: 3, icon: '🎯', title: 'Savings Goals', badge: 'Goal Setter', badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', color: 'from-purple-500 to-violet-500',
    detail: 'Set a target — iPhone, trip, emergency fund — add contributions anytime and watch your progress grow step by step.',
    examples: ['🏖️ Goa Trip: 68% saved', '📱 New iPhone: ₹42k/₹90k', '🎓 Course Fund: On track']
  },
  {
    id: 4, icon: '📈', title: 'Comprehensive Analytics', badge: 'Insights', badgeColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', color: 'from-orange-500 to-amber-500',
    detail: 'Monthly breakdowns, 6-month trend charts, savings rate tracking, and budget vs actual comparisons — export to CSV or Excel anytime.',
    examples: ['📈 Monthly savings: +₹8,500', '🏷️ Top spend: Food ₹4,200', '📉 Down 12% vs last month']
  },
  {
    id: 5, icon: '🤝', title: 'Debt & Loan Tracker', badge: 'Stay Clear', badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400', color: 'from-cyan-500 to-blue-500',
    detail: 'Track money you owe and money owed to you — with payment history, partial payments, and due date reminders.',
    examples: ['📤 Rahul owes me: ₹5,000', '📥 I owe Priya: ₹2,500', '✅ Net balance: +₹2,500']
  },
];

export default function FeaturesSection() {
  const [active, setActive] = useState(0);
  const feat = FEATURES[active];

  return (
    <section id="features" className="min-h-screen flex items-center px-6 lg:px-12 py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-semibold border border-blue-100 dark:border-blue-800 mb-3">
            ⚡ Powerful Features
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Everything for{' '}
            <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
              Smart Money Management
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">Five powerful tools designed for how India spends and saves.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left list */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {FEATURES.map((f, i) => (
              <motion.button key={f.id} onClick={() => setActive(i)} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${active === i ? 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 shadow-md' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700'
                  }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-xl shadow-sm flex-shrink-0`}>{f.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold ${active === i ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>{f.title}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${f.badgeColor}`}>{f.badge}</span>
                    </div>
                  </div>
                  {active === i && <span className="text-blue-500 font-bold ml-auto">→</span>}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Right detail */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div key={active}
                initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.32 }}
                className="h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-52 h-52 bg-gradient-to-br ${feat.color} opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-3xl shadow-lg`}>{feat.icon}</div>
                    <div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${feat.badgeColor}`}>{feat.badge}</span>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1.5">{feat.title}</h3>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-base">{feat.detail}</p>
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Examples</p>
                    {feat.examples.map((ex, i) => (
                      <motion.div key={ex} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${feat.color} flex-shrink-0`} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ex}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-8 justify-center">
                    {FEATURES.map((_, i) => (
                      <button key={i} onClick={() => setActive(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${active === i ? 'w-6 bg-gradient-to-r from-blue-600 to-emerald-500' : 'w-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'}`} />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}