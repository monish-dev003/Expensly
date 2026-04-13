import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Icon from '../../components/AppIcon';
import PageLayout from '../../components/ui/PageLayout';
import ExpenslyLogo from '../../components/ExpenslyLogo.jsx';
import { useAuthStore, useAppStore } from '../../store/index.js';
import { statsAPI } from '../../api/index.js';
import { fmt } from '../../utils/format.js';

// Sub-components
import HeroCard      from './components/HeroCard.jsx';
import KPICards      from './components/KPICards.jsx';
import MainChart     from './components/MainChart.jsx';
import CategoryDonut from './components/CategoryDonut.jsx';
import RecentTxns    from './components/RecentTxns.jsx';
import PeriodFilter  from './components/PeriodFilter.jsx';
import {
  HeroSkeleton, KPISkeleton, ChartRowSkeleton, WidgetRowSkeleton,
} from './components/DashboardSkeletons.jsx';

import BudgetStatusCard  from './components/BudgetStatusCard.jsx';
import FinancialTipsCard from './components/AIInsightsCard.jsx';
import QuickActionsCard  from './components/QuickActionsCard.jsx';

// GoalsCard, DebtsCard, CalHeatmap — files missing, removed

const cardV = {
  hidden:  { opacity: 0, y: 20 },
  visible: i => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem('expensly-theme') || 'system');
  const cycle = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
    localStorage.setItem('expensly-theme', next);
    const dark = next === 'dark' || (next === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
  };
  const ICON  = { light: 'Sun', dark: 'Moon', system: 'Monitor' };
  const LABEL = { light: 'Light', dark: 'Dark', system: 'Auto' };
  return (
    <motion.button onClick={cycle} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
      aria-label={`Theme: ${LABEL[theme]}`}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted text-muted-foreground hover:text-foreground text-xs font-medium transition-all border border-border">
      <Icon name={ICON[theme]} size={13} />
      <span className="hidden sm:block">{LABEL[theme]}</span>
    </motion.button>
  );
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { wallets, transactions, budgets, goals, debts, fetchTransactions, fetchWallets } = useAppStore();

  const sym = user?.currencySymbol || '₹';
  const now = new Date();

  const [statsLoading, setStatsLoading] = useState(true);
  const [trend,   setTrend]   = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0 });
  const [catData, setCatData] = useState([]);
  const [chartType, setChartType] = useState('area');
  const [preset, setPreset] = useState('this_month');
  const [from,   setFrom]   = useState('');
  const [to,     setTo]     = useState('');

  const getRange = useCallback(() => {
    const t = new Date();
    if (preset === 'this_month')
      return { start: new Date(t.getFullYear(), t.getMonth(), 1), end: new Date(t.getFullYear(), t.getMonth() + 1, 0, 23, 59, 59) };
    if (preset === 'last_month') {
      const m = t.getMonth() - 1, y = m < 0 ? t.getFullYear() - 1 : t.getFullYear(), mo = m < 0 ? 11 : m;
      return { start: new Date(y, mo, 1), end: new Date(y, mo + 1, 0, 23, 59, 59) };
    }
    if (preset === 'last_3_months') {
      const s = new Date(t); s.setMonth(s.getMonth() - 3); s.setDate(1);
      return { start: s, end: t };
    }
    if (preset === 'this_year') return { start: new Date(t.getFullYear(), 0, 1), end: t };
    if (from && to) return { start: new Date(from), end: new Date(to + 'T23:59:59') };
    return null;
  }, [preset, from, to]);

  const periodLabel = useCallback(() => {
    if (preset === 'this_month')    return `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    if (preset === 'last_month')    { const d = new Date(now); d.setMonth(d.getMonth() - 1); return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`; }
    if (preset === 'last_3_months') return 'Last 3 Months';
    if (preset === 'this_year')     return String(now.getFullYear());
    return from && to ? `${from} → ${to}` : 'This Month';
  }, [preset, from, to]);

  useEffect(() => { fetchTransactions({ limit: 100 }); }, []);

  useEffect(() => {
    const onFocus   = () => fetchWallets();
    const onVisible = () => { if (document.visibilityState === 'visible') fetchWallets(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const range = getRange();
    const p = range
      ? { period: 'custom', startDate: range.start.toISOString(), endDate: range.end.toISOString() }
      : { period: 'monthly' };
    setStatsLoading(true);
    Promise.all([
      statsAPI.getSummary(p),
      statsAPI.getTrend({ months: 6 }),
      statsAPI.getByCategory({ ...p, type: 'expense' }),
    ]).then(([s, t, c]) => {
      if (cancelled) return;
      setSummary(s.data.data  || { income: 0, expense: 0 });
      setTrend(t.data.data    || []);
      setCatData((c.data.data || []).slice(0, 6));
    }).catch(() => {
      if (!cancelled) { setSummary({ income: 0, expense: 0 }); setTrend([]); setCatData([]); }
    }).finally(() => { if (!cancelled) setStatsLoading(false); });
    return () => { cancelled = true; };
  }, [preset, from, to]);

  const totalBalance = useMemo(
    () => wallets.reduce((s, w) => w.includeInTotal !== false ? s + (w.balance || 0) : s, 0),
    [wallets]
  );
  const alertCount = useMemo(
    () => budgets.filter(b => (b.spent || 0) / b.limit >= 0.8).length,
    [budgets]
  );
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <PageLayout>
      <Helmet>
        <title>Dashboard — Expensly</title>
        <meta name="description" content="Your financial overview — balances, spending trends, and savings goals." />
      </Helmet>

      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="lg:hidden">
            <ExpenslyLogo size={32} showText textClassName="text-[15px]" />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-foreground">{greeting}, {user?.name?.split(' ')[0]} 👋</p>
            <p className="text-xs text-muted-foreground">
              {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />
            {alertCount > 0 && (
              <button onClick={() => navigate('/budgets')} aria-label={`${alertCount} budget alert`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-error/10 text-error rounded-xl text-xs font-semibold border border-error/20 hover:bg-error/20 transition-all">
                <Icon name="Bell" size={13} />
                <span>{alertCount} Alert{alertCount > 1 ? 's' : ''}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-5 pb-24 lg:pb-8 space-y-5">

        {wallets.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/10 to-emerald-500/10 border-2 border-dashed border-blue-200 dark:border-blue-800 flex items-center justify-center mb-5 text-4xl">💰</div>
            <h2 className="text-xl font-extrabold text-foreground mb-2">Welcome to Expensly!</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">Start by adding your first wallet.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/wallets')}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white text-sm font-bold shadow-lg flex items-center gap-2">
                <Icon name="Plus" size={16} /> Add Your First Wallet
              </motion.button>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-8 w-full max-w-sm">
              {[['💳','Add Wallet','/wallets'],['📊','Set Budget','/budgets'],['🎯','Set Goal','/goals']].map(([ic,lb,path]) => (
                <button key={path} onClick={() => navigate(path)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-muted/50 hover:bg-muted border border-border hover:border-primary/30 transition-all">
                  <span className="text-2xl">{ic}</span>
                  <span className="text-xs font-semibold text-muted-foreground">{lb}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {wallets.length > 0 && (<>
          <PeriodFilter preset={preset} setPreset={setPreset} from={from} to={to} setFrom={setFrom} setTo={setTo} />

          <motion.div custom={0} variants={cardV} initial="hidden" animate="visible">
            {statsLoading ? <HeroSkeleton /> : (
              <HeroCard balance={totalBalance} income={summary.income || 0} expense={summary.expense || 0} sym={sym} period={periodLabel()} />
            )}
          </motion.div>

          {statsLoading ? <KPISkeleton /> : <KPICards income={summary.income || 0} expense={summary.expense || 0} sym={sym} />}

          <motion.div custom={5} variants={cardV} initial="hidden" animate="visible">
            <QuickActionsCard />
          </motion.div>

          <motion.div custom={6} variants={cardV} initial="hidden" animate="visible">
            {statsLoading ? <ChartRowSkeleton /> : (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3"><MainChart data={trend} sym={sym} chartType={chartType} setChartType={setChartType} /></div>
                <div className="lg:col-span-2"><CategoryDonut data={catData} sym={sym} /></div>
              </div>
            )}
          </motion.div>

          <motion.div custom={7} variants={cardV} initial="hidden" animate="visible">
            {statsLoading ? <WidgetRowSkeleton /> : (
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                <BudgetStatusCard budgets={budgets} sym={sym} />
              </div>
            )}
          </motion.div>

          <motion.div custom={8} variants={cardV} initial="hidden" animate="visible">
            <FinancialTipsCard />
          </motion.div>

          <motion.div custom={9} variants={cardV} initial="hidden" animate="visible">
            <RecentTxns transactions={transactions} sym={sym} />
          </motion.div>
        </>)}
      </main>
    </PageLayout>
  );
}