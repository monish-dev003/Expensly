import React from 'react';
import { motion } from 'framer-motion';
import { fmt } from '../../../utils/format.js';
import CountUp from './CountUp.jsx';

export default function HeroCard({ balance, income, expense, sym, period }) {
  const savings = income - expense;
  const rate    = income > 0 ? Math.round((savings / income) * 100) : 0;
  const mood    = rate >= 30
    ? { label: 'Excellent 🎉',  color: '#10b981', bg: 'rgba(16,185,129,0.2)'  }
    : rate >= 15
    ? { label: 'On Track ✓',   color: '#60a5fa', bg: 'rgba(96,165,250,0.2)'  }
    : rate >= 0
    ? { label: 'Watch Out ⚠️', color: '#f59e0b', bg: 'rgba(245,158,11,0.2)'  }
    : { label: 'Overspent 🔴', color: '#ef4444', bg: 'rgba(239,68,68,0.2)'   };

  return (
    <div className="relative rounded-2xl overflow-hidden p-5 sm:p-6"
      style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#1d4ed8 100%)' }}>

      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle,#818cf8,transparent 70%)' }}
          animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle,#34d399,transparent 70%)' }}
          animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 6, repeat: Infinity, delay: 3 }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-white/50 text-xs font-medium uppercase tracking-widest mb-1">
            Total Balance · {period}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-white/60 text-xl font-light">{sym}</span>
            <CountUp to={balance} className="text-4xl sm:text-5xl font-extrabold text-white tabular-nums" duration={1.4} />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: mood.bg, color: mood.color, border: `1px solid ${mood.color}40` }}>
              {mood.label}
            </span>
            <span className="text-white/40 text-xs">Savings rate: {rate}%</span>
          </div>
        </div>

        {/* Savings ring */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <svg viewBox="0 0 48 48" className="w-14 h-14 -rotate-90" aria-label={`Savings rate ${rate}%`}>
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
            <motion.circle cx="24" cy="24" r="20" fill="none"
              stroke={mood.color} strokeWidth="6" strokeLinecap="round"
              strokeDasharray="125.7"
              initial={{ strokeDashoffset: 125.7 }}
              animate={{ strokeDashoffset: 125.7 - Math.max(0, Math.min(100, rate)) * 1.257 }}
              transition={{ duration: 1.4, delay: 0.3, ease: 'easeOut' }} />
          </svg>
          <div>
            <p className="text-white/40 text-[10px]">Net Saved</p>
            <p className="text-white font-extrabold text-lg tabular-nums">
              {savings >= 0 ? '+' : ''}{fmt(savings, sym)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
