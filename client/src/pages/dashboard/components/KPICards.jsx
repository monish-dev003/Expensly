import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import CountUp from './CountUp.jsx';

const cardV = {
  hidden:  { opacity: 0, y: 20 },
  visible: i => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

const KPI_CFG = [
  { key: 'income',   label: 'Income',   icon: 'TrendingUp',   color: '#10b981', bg: 'from-emerald-500/15 to-teal-500/5',   border: 'border-emerald-500/20' },
  { key: 'expense',  label: 'Expenses', icon: 'TrendingDown', color: '#ef4444', bg: 'from-red-500/15 to-red-400/5',        border: 'border-red-500/20'     },
  { key: 'savings',  label: 'Net Saved',icon: 'PiggyBank',    color: '#6366f1', bg: 'from-indigo-500/15 to-violet-500/5', border: 'border-indigo-500/20'  },
  { key: 'burnRate', label: 'Burn Rate',icon: 'Flame',        color: '#f59e0b', bg: 'from-amber-500/15 to-orange-400/5',  border: 'border-amber-500/20'   },
];

export default function KPICards({ income, expense, sym }) {
  const savings  = income - expense;
  const burnRate = income > 0 ? Math.round((expense / income) * 100) : 0;
  const vals     = { income, expense, savings, burnRate };
  const isMoney  = { income: true, expense: true, savings: true, burnRate: false };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {KPI_CFG.map((k, i) => {
        const val = vals[k.key] || 0;
        return (
          <motion.div key={k.key} custom={i + 1} variants={cardV} initial="hidden" animate="visible"
            className={`bg-gradient-to-br ${k.bg} border ${k.border} rounded-2xl p-4 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-25 pointer-events-none"
              style={{ background: k.color }} />
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${k.color}20`, border: `1.5px solid ${k.color}35` }}>
                <Icon name={k.icon} size={15} style={{ color: k.color }} />
              </div>
            </div>
            <p className="text-muted-foreground text-xs font-medium mb-0.5">{k.label}</p>
            {isMoney[k.key]
              ? <CountUp to={Math.abs(val)} prefix={val < 0 ? `-${sym}` : sym}
                  className="text-xl font-extrabold text-foreground tabular-nums" duration={1.2} />
              : <CountUp to={Math.abs(val)} suffix="%"
                  className="text-xl font-extrabold text-foreground tabular-nums" duration={1} />
            }
          </motion.div>
        );
      })}
    </div>
  );
}
