import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import PageLayout from '../../components/ui/PageLayout';
import { useAuthStore } from '../../store/index.js';
import { statsAPI } from '../../api/index.js';
import { Helmet } from 'react-helmet-async';
import { fmt } from '../../utils/format.js';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

const PIE_COLORS = ['#6366F1', '#F59E0B', '#10B981', '#EC4899', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#A78BFA'];

const CUSTOM_TOOLTIP = ({ active, payload, label, sym = '₹' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-financial-lg text-xs">
      {label && <p className="font-semibold text-foreground mb-2">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {sym}{Number(p.value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </p>
      ))}
    </div>
  );
};

export default function ReportsAnalytics() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const sym = user?.currencySymbol || '₹';

  const [period, setPeriod] = useState('monthly');
  const [months, setMonths] = useState(6);
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [catData, setCatData] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const p = { period, months };
    Promise.all([
      statsAPI.getSummary(p),
      statsAPI.getTrend(p),
      statsAPI.getByCategory({ ...p, type: 'expense' }),
      statsAPI.getCalendar(p),
    ]).then(([s, t, c, cal]) => {
      if (cancelled) return;
      setSummary(s.data.data);
      setTrend(t.data.data || []);
      setCatData(c.data.data || []);
      setCalendar(cal.data.data || []);
    }).catch(() => {
      if (!cancelled) { setSummary(null); setTrend([]); setCatData([]); }
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [period, months]);

  const totalIncome  = summary?.income  || 0;
  const totalExpense = summary?.expense || 0;
  const savings      = totalIncome - totalExpense;
  const savingsRate  = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

  return (
    <PageLayout>
      <Helmet>
        <title>Reports & Analytics — Expensly</title>
        <meta name="description" content="Charts and insights into your spending patterns and financial trends." />
      </Helmet>

      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Reports & Analytics</h1>
          <div className="flex items-center gap-2">
            {[1, 3, 6, 12].map(m => (
              <button key={m} onClick={() => setMonths(m)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  months === m ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}>{m}M</button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-8 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Loading analytics…</p>
            </div>
          </div>
        ) : (
          <>
            {/* KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Income',   val: fmt(totalIncome, sym),  color: 'text-success', icon: 'TrendingUp',   bg: 'bg-success/10' },
                { label: 'Total Expenses', val: fmt(totalExpense, sym), color: 'text-error',   icon: 'TrendingDown', bg: 'bg-error/10' },
                { label: 'Net Savings',    val: fmt(savings, sym),      color: savings >= 0 ? 'text-success' : 'text-error', icon: 'PiggyBank', bg: savings >= 0 ? 'bg-success/10' : 'bg-error/10' },
                { label: 'Savings Rate',   val: `${savingsRate}%`,      color: savingsRate >= 20 ? 'text-success' : savingsRate >= 10 ? 'text-warning' : 'text-error', icon: 'Percent', bg: 'bg-primary/10' },
              ].map(({ label, val, color, icon, bg }) => (
                <div key={label} className="bg-card border border-border rounded-2xl p-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
                    <Icon name={icon} size={16} className={color} />
                  </div>
                  <p className={`text-xl font-bold ${color}`}>{val}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Income vs Expense Area Chart */}
            {trend.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-sm font-semibold text-foreground mb-4">Income vs Expenses — {months} months</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="income-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expense-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false}
                      tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                    <Tooltip content={<CUSTOM_TOOLTIP sym={sym} />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="income"  name="Income"   stroke="#10B981" fill="url(#income-grad)"  strokeWidth={2} />
                    <Area type="monotone" dataKey="expense" name="Expenses" stroke="#EF4444" fill="url(#expense-grad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {catData.length > 0 && (
                <>
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <p className="text-sm font-semibold text-foreground mb-4">Expense by Category</p>
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width={160} height={160}>
                        <PieChart>
                          <Pie data={catData} cx="50%" cy="50%" innerRadius={40} outerRadius={72} dataKey="total" paddingAngle={2}>
                            {catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v) => [fmt(v, sym), 'Amount']}
                            contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 11 }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-2">
                        {catData.slice(0, 7).map((d, i) => {
                          const total = catData.reduce((s, c) => s + c.total, 0);
                          const p = total > 0 ? Math.round((d.total / total) * 100) : 0;
                          return (
                            <div key={i}>
                              <div className="flex justify-between text-xs mb-0.5">
                                <span className="text-foreground font-medium truncate max-w-[100px]">{String(d._id || 'Other')}</span>
                                <span className="text-muted-foreground">{p}%</span>
                              </div>
                              <div className="h-1 bg-muted rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${p}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-5">
                    <p className="text-sm font-semibold text-foreground mb-4">Top Spending Categories</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={catData.slice(0, 8)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false}
                          tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                        <YAxis type="category" dataKey="_id" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} width={70} />
                        <Tooltip formatter={(v) => [fmt(v, sym), 'Spent']}
                          contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 11 }} />
                        <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                          {catData.slice(0, 8).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>

            {/* Monthly Savings Bar Chart */}
            {trend.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-sm font-semibold text-foreground mb-4">Monthly Savings</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={trend.map(t => ({ ...t, savings: (t.income || 0) - (t.expense || 0) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false}
                      tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                    <Tooltip formatter={(v) => [fmt(v, sym), 'Savings']}
                      contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="savings" radius={[4, 4, 0, 0]}>
                      {trend.map((t, i) => {
                        const s = (t.income || 0) - (t.expense || 0);
                        return <Cell key={i} fill={s >= 0 ? '#10B981' : '#EF4444'} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Calendar Heatmap */}
            {calendar.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-sm font-semibold text-foreground mb-4">Daily Spending Calendar</p>
                <div className="grid grid-cols-7 gap-1">
                  {['S','M','T','W','T','F','S'].map((d, i) => (
                    <div key={i} className="text-center text-[10px] text-muted-foreground pb-1">{d}</div>
                  ))}
                  {calendar.slice(0, 56).map((day, i) => {
                    const intensity = day.expense > 0
                      ? Math.min(1, day.expense / (Math.max(...calendar.map(d => d.expense || 0)) || 1))
                      : 0;
                    return (
                      <div key={i} className="aspect-square rounded-sm relative group"
                        style={{ background: intensity > 0 ? `rgba(239,68,68,${0.1 + intensity * 0.8})` : 'var(--color-muted)' }}>
                        {intensity > 0 && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-card border border-border rounded px-1.5 py-0.5 text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all z-10 pointer-events-none">
                            {new Date(day.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {fmt(day.expense, sym)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">Darker = more spending</p>
              </div>
            )}

            {!trend.length && !catData.length && (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/10 to-emerald-500/10 border-2 border-dashed border-blue-200 dark:border-blue-800 flex items-center justify-center text-4xl">
                  📊
                </div>
                <div>
                  <p className="text-lg font-extrabold text-foreground mb-1">No data for this period</p>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    Add some transactions first, then come back to see your spending insights and trends.
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap justify-center">
                  <button onClick={() => navigate('/add-transaction')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all">
                    + Add Transaction
                  </button>
                  <button onClick={() => { setMonths(12); setPeriod('monthly'); }}
                    className="px-5 py-2.5 rounded-xl border-2 border-border text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-all">
                    Try Last 12 Months
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </PageLayout>
  );
}