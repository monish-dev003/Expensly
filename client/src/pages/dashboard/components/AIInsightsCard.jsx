import React, { useState } from 'react';

const TIPS = [
  { icon: '💡', title: 'Track Daily', tip: 'Log expenses daily — small amounts add up fast. 5 minutes a day saves you from month-end surprises.' },
  { icon: '📊', title: '50/30/20 Rule', tip: 'Allocate 50% to needs, 30% to wants, and 20% to savings. A simple framework that actually works.' },
  { icon: '🎯', title: 'Emergency Fund', tip: 'Keep 3–6 months of expenses saved. This buffer prevents you from going into debt during unexpected situations.' },
  { icon: '🔄', title: 'Review Monthly', tip: 'Check your biggest spending categories every month. Awareness is the first step to reducing waste.' },
  { icon: '📱', title: 'Automate Savings', tip: 'Set up auto-transfers on salary day. Pay yourself first — what you don\'t see, you don\'t spend.' },
  { icon: '🏦', title: 'Beat Inflation', tip: 'Idle money in savings accounts loses value. Even index funds or liquid funds beat inflation over time.' },
];

const AIInsightsCard = ({ className = '' }) => {
  const [idx, setIdx] = useState(0);
  const tip = TIPS[idx];

  return (
    <div className={`bg-card border border-border rounded-2xl p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
            <span className="text-white text-sm">✦</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Financial Tips</h3>
            <p className="text-[10px] text-muted-foreground">Smart money advice</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {TIPS.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-primary w-3' : 'bg-border hover:bg-muted-foreground'}`} />
          ))}
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
          {tip.icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground mb-0.5">{tip.title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{tip.tip}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={() => setIdx(i => (i - 1 + TIPS.length) % TIPS.length)}
          className="flex-1 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-all">
          ← Prev
        </button>
        <button onClick={() => setIdx(i => (i + 1) % TIPS.length)}
          className="flex-1 py-1.5 rounded-lg bg-primary/10 text-xs font-medium text-primary hover:bg-primary/20 transition-all">
          Next →
        </button>
      </div>
    </div>
  );
};

export default React.memo(AIInsightsCard);
