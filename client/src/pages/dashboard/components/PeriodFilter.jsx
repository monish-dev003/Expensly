import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/AppIcon';

const PRESETS = [
  { label: 'This Month',   value: 'this_month'    },
  { label: 'Last Month',   value: 'last_month'    },
  { label: 'Last 3 Months',value: 'last_3_months' },
  { label: 'This Year',    value: 'this_year'     },
];

export default function PeriodFilter({ preset, setPreset, from, to, setFrom, setTo }) {
  const [custom, setCustom] = useState(false);

  const handlePreset = (v) => { setPreset(v); setCustom(false); };
  const handleCustom = () => setCustom(v => !v);

  return (
    <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Select period">
      {PRESETS.map(p => (
        <button key={p.value} onClick={() => handlePreset(p.value)}
          aria-pressed={preset === p.value && !custom}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
            ${preset === p.value && !custom
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'}`}>
          {p.label}
        </button>
      ))}

      <button onClick={handleCustom} aria-pressed={custom}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5
          ${custom ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'}`}>
        <Icon name="Calendar" size={11} /> Custom
      </button>

      <AnimatePresence>
        {custom && (
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2">
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              aria-label="From date"
              className="h-8 px-2 text-xs bg-muted border border-border rounded-xl text-foreground
                outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20" />
            <span className="text-xs text-muted-foreground">to</span>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              aria-label="To date"
              className="h-8 px-2 text-xs bg-muted border border-border rounded-xl text-foreground
                outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
