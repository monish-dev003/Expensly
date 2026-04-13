import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../../components/AppIcon';
import PageLayout from '../../components/ui/PageLayout';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import { useAuthStore, useAppStore } from '../../store/index.js';
import { BUILTIN_CATS } from '../../utils/categories.js';
import { statsAPI } from '../../api/index.js';
import { Helmet } from 'react-helmet-async';
import { fmt } from '../../utils/format.js';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const PIE_COLORS = ['#6366F1','#F59E0B','#10B981','#EC4899','#EF4444','#8B5CF6','#06B6D4','#84CC16','#F97316'];

function StatCard({ label, value, sub, icon, color = 'text-primary', bg = 'bg-primary/10' }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex justify-between items-start mb-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center text-lg`}>{icon}</div>
      </div>
      <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, sym }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 text-xs shadow-lg">
      {label && <p className="font-semibold text-foreground mb-1.5">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-medium" style={{ color: p.color }}>
          {p.name}: {sym}{Number(p.value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </p>
      ))}
    </div>
  );
};

export default function StatisticsPage() {
  const { user } = useAuthStore();
  const { transactions } = useAppStore();
  const sym = user?.currencySymbol || '₹';

  const [period, setPeriod] = useState('monthly');
  const [catData, setCatData] = useState([]);
  const [trend, setTrend] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      statsAPI.getSummary({ period }),
      statsAPI.getTrend({ period, months: 6 }),
      statsAPI.getByCategory({ period, type: 'expense' }),
    ]).then(([s, t, c]) => {
      if (cancelled) return;
      setSummary(s.data.data || { income: 0, expense: 0 });
      setTrend(t.data.data || []);
      setCatData((c.data.data || []).slice(0, 8));
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [period]);

  const totalIncome  = summary.income  || 0;
  const totalExpense = summary.expense || 0;
  const savings      = totalIncome - totalExpense;
  const savingsRate  = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;
  const avgTx        = transactions.length > 0
    ? transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) /
      Math.max(transactions.filter(t => t.type === 'expense').length, 1)
    : 0;

  return (
    <PageLayout>
      <Helmet>
        <title>Statistics — Expensly</title>
        <meta name="description" content="Detailed period-by-period financial statistics and breakdowns." />
      </Helmet>

      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Statistics</h1>
          <div className="flex gap-1 bg-muted rounded-xl p-1">
            {['weekly','monthly','yearly'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all
                  ${period === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8 space-y-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Income"    value={fmt(totalIncome, sym)}  icon="📈" color="text-success" bg="bg-success/10" />
              <StatCard label="Total Expenses"  value={fmt(totalExpense, sym)} icon="📉" color="text-error"   bg="bg-error/10" />
              <StatCard label="Net Savings"     value={fmt(savings, sym)}      icon="💎"
                color={savings >= 0 ? 'text-success' : 'text-error'}
                bg={savings >= 0 ? 'bg-success/10' : 'bg-error/10'}
                sub={`${Math.max(0, savingsRate)}% savings rate`} />
              <StatCard label="Avg Transaction" value={fmt(avgTx, sym)}        icon="🧮" color="text-primary" bg="bg-primary/10"
                sub={`of ${transactions.filter(t => t.type === 'expense').length} expenses`} />
            </div>

            {/* Trend Chart */}
            {trend.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-semibold text-foreground mb-4">Income vs Expenses Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trend} margin={{ top: 5, right: 5, bottom: 5, left: -10 }} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false}
                        tickFormatter={v => `${sym}${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip sym={sym} />} />
                      <Bar dataKey="income"  name="Income"  fill="var(--color-success)" radius={[4,4,0,0]} />
                      <Bar dataKey="expense" name="Expense" fill="var(--color-error)"   radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {catData.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-semibold text-foreground mb-4">Spending by Category</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={catData} cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={2} dataKey="total">
                          {catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={v => [`${sym}${v.toLocaleString()}`, '']}
                          contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-3">
                    {catData.slice(0, 5).map((c, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-sm text-foreground flex-1 truncate">{c.icon || '📦'} {c.name || String(c._id)}</span>
                        <span className="text-sm font-bold text-foreground">{fmt(c.total, sym)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {catData.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-semibold text-foreground mb-4">Category Share</h3>
                  <div className="space-y-3">
                    {catData.map((c, i) => {
                      const total = catData.reduce((s, x) => s + x.total, 0);
                      const p     = total > 0 ? Math.round((c.total / total) * 100) : 0;
                      return (
                        <div key={i}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-foreground">{c.icon || '📦'} {c.name || String(c._id)}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{p}%</span>
                              <span className="text-sm font-bold text-foreground w-20 text-right">{fmt(c.total, sym)}</span>
                            </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="h-2 rounded-full transition-all duration-700"
                              style={{ width: `${p}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Transaction Summary */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-4">Transaction Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: 'Total',   val: transactions.length,                                       color: 'text-foreground' },
                  { label: 'Income',  val: transactions.filter(t => t.type === 'income').length,      color: 'text-success'    },
                  { label: 'Expense', val: transactions.filter(t => t.type === 'expense').length,     color: 'text-error'      },
                ].map(s => (
                  <div key={s.label} className="bg-muted rounded-2xl p-4">
                    <p className={`text-2xl font-extrabold ${s.color}`}>{s.val}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
      <FloatingActionButton />
    </PageLayout>
  );
}