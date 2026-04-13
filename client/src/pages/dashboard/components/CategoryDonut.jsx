import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { fmt } from '../../../utils/format.js';

const COLORS = ['#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6','#06b6d4'];

export default function CategoryDonut({ data, sym }) {
  const [active, setActive] = useState(null);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 h-full">
      <p className="text-sm font-semibold text-foreground mb-0.5">Spending by Category</p>
      <p className="text-xs text-muted-foreground mb-3">This period</p>

      {data.length === 0 ? (
        <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">
          No expense data
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <ResponsiveContainer width={110} height={110}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={33} outerRadius={52}
                  dataKey="total" paddingAngle={3}
                  onMouseEnter={(_, i) => setActive(i)}
                  onMouseLeave={() => setActive(null)}>
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]}
                      opacity={active === null || active === i ? 1 : 0.4} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {active !== null && data[active] && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[9px] text-muted-foreground leading-tight text-center px-1 truncate max-w-[72px]">
                  {data[active].name || String(data[active]._id || '')}
                </p>
                <p className="text-xs font-extrabold text-foreground">{fmt(data[active].total, sym)}</p>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-1.5 min-w-0">
            {data.slice(0, 6).map((d, i) => (
              <div key={i} className="flex items-center gap-2 cursor-default"
                onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-[11px] text-muted-foreground flex-1 truncate">
                  {d.icon && `${d.icon} `}{d.name || String(d._id || 'Other')}
                </span>
                <span className="text-[11px] font-bold text-foreground tabular-nums">
                  {fmt(d.total, sym)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
