import React from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

function ChartTip({ active, payload, label, sym }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-xl text-xs">
      {label && <p className="font-semibold text-foreground mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {sym}{Number(p.value || 0).toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
}

const axisProps = {
  axisLine: false, tickLine: false,
};

export default function MainChart({ data, sym, chartType, setChartType }) {
  const empty = !data.length;

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Income vs Expenses</p>
          <p className="text-xs text-muted-foreground">6-month overview</p>
        </div>
        <div className="flex bg-muted rounded-xl p-0.5" role="group" aria-label="Chart type">
          {['area', 'bar'].map(t => (
            <button key={t} onClick={() => setChartType(t)}
              aria-pressed={chartType === t}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all
                ${chartType === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {empty ? (
        <div className="h-44 flex items-center justify-center text-muted-foreground text-sm">
          No data yet — add some transactions.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={190}>
          {chartType === 'area' ? (
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} {...axisProps} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} {...axisProps}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip content={<ChartTip sym={sym} />} />
              <Area type="monotone" dataKey="income"  name="Income"  stroke="#10b981" strokeWidth={2} fill="url(#gInc)" />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2} fill="url(#gExp)" />
            </AreaChart>
          ) : (
            <BarChart data={data} barGap={4} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} {...axisProps} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} {...axisProps}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip content={<ChartTip sym={sym} />} />
              <Bar dataKey="income"  name="Income"  fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
}
