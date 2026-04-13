import React from 'react';
import { motion } from 'framer-motion';

const REVIEWS = [
  { name: 'Priya S.', city: 'Mumbai', rating: 5, text: 'Finally a finance app that understands how Indians actually spend. The budget tracker is absolutely spot on!' },
  { name: 'Rahul K.', city: 'Bangalore', rating: 5, text: 'Debt tracker saved me from so many awkward conversations. I know exactly who owes what at all times.' },
  { name: 'Anjali M.', city: 'Delhi', rating: 5, text: 'Set a savings goal for my Europe trip and Expensly kept me on track every month. Booked tickets last month!' },
  { name: 'Karan P.', city: 'Pune', rating: 5, text: 'The analytics charts are beautiful. I actually understand my spending patterns now — and I am saving more.' },
  { name: 'Sneha R.', city: 'Hyderabad', rating: 5, text: 'Multi-wallet support is brilliant. All my accounts in one place. No more switching between apps ever.' },
  { name: 'Amit T.', city: 'Chennai', rating: 4, text: 'Simple, clean, and actually works. Been using for 3 months and my savings are up by 30%. Love it!' },
];

const CERTS = [
  { icon: '🛡️', title: 'SSL Encrypted', desc: '256-bit encryption' },
  { icon: '🔒', title: 'GDPR Compliant', desc: 'Data protection' },
  { icon: '✅', title: 'SOC 2 Ready', desc: 'Security audited' },
  { icon: '🌐', title: 'ISO 27001', desc: 'Info security' },
];

export default function SocialProofSection() {
  return (
    <section id="reviews" className="min-h-screen flex items-center px-6 lg:px-12 py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-sm font-semibold border border-purple-100 dark:border-purple-800 mb-3">
            🏆 Trusted Platform
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Trusted by{' '}
            <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
              50,000+ Indians
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">Real reviews from real users across India</p>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {REVIEWS.map((r, i) => (
            <motion.div key={r.name}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.07 }} viewport={{ once: true }}
              whileHover={{ y: -3 }}
              className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.city}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(r.rating)].map((_, j) => <span key={j} className="text-amber-400 text-sm">★</span>)}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">"{r.text}"</p>
            </motion.div>
          ))}
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {CERTS.map((c, i) => (
            <motion.div key={c.title}
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }} viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-md transition-all">
              <span className="text-2xl">{c.icon}</span>
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-white">{c.title}</p>
                <p className="text-xs text-gray-400">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}