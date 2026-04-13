import React, { useEffect, useRef, useCallback, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import PinLock from './components/ui/PinLock';
import FullScreenLoader from './components/FullScreenLoader';
import OfflineBanner from './components/ui/OfflineBanner';
import { useAuthStore, useAppStore, usePinStore } from './store/index.js';

import { Suspense, lazy } from 'react';

// ── Route-level code splitting ────────────────────────────────────────────────
// Each page chunk loads only when first visited — initial bundle ~40% smaller.
const LandingPage        = lazy(() => import('./pages/landing-page'));
const LoginPage          = lazy(() => import('./pages/login'));
const RegisterPage       = lazy(() => import('./pages/register'));
const Dashboard          = lazy(() => import('./pages/dashboard'));
const TransactionsList   = lazy(() => import('./pages/transactions-list'));
const AddTransaction     = lazy(() => import('./pages/add-transaction'));
const ReportsAnalytics   = lazy(() => import('./pages/reports-analytics'));
const WalletsPage        = lazy(() => import('./pages/wallets'));
const BudgetsPage        = lazy(() => import('./pages/budgets'));
const GoalsPage          = lazy(() => import('./pages/goals'));
const DebtsPage          = lazy(() => import('./pages/debts'));
const CalendarPage       = lazy(() => import('./pages/calendar'));
const SettingsPage       = lazy(() => import('./pages/settings'));
const StatisticsPage     = lazy(() => import('./pages/statistics'));
const NotFound           = lazy(() => import('./pages/NotFound'));
const OnboardingPage     = lazy(() => import('./pages/onboarding'));
const ForgotPasswordPage = lazy(() => import('./pages/forgot-password'));
const ResetPasswordPage  = lazy(() => import('./pages/reset-password'));
const RecurringPage      = lazy(() => import('./pages/recurring'));

const applyTheme = () => {
  const saved = localStorage.getItem('expensly-theme') || 'system';
  const dark  = saved === 'dark' || (saved === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
};
applyTheme();
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if ((localStorage.getItem('expensly-theme') || 'system') === 'system') applyTheme();
});

function RequireAuth({ children }) {
  const user     = useAuthStore(s => s.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function RedirectIfAuth({ children }) {
  const user = useAuthStore(s => s.user);
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function DataLoader({ children }) {
  const user      = useAuthStore(s => s.user);
  const bootstrap = useAppStore(s => s.bootstrap);
  const location  = useLocation();
  const loaded    = useRef(false);
  const [booting, setBooting] = useState(false);

  // Public pages — never show loading screen, just render immediately
  const isPublicPage = ['/', '/landing-page', '/login', '/register',
    '/forgot-password', '/reset-password'].includes(location.pathname);

  useEffect(() => {
    if (user && !loaded.current) {
      loaded.current = true;
      // On public pages (landing/login), bootstrap silently in background
      // so landing page shows instantly — no loading spinner blocking it
      if (!isPublicPage) setBooting(true);
      bootstrap().finally(() => setBooting(false));
    }
    if (!user) { loaded.current = false; setBooting(false); }
  }, [user, bootstrap]);

  // Only show loading on protected pages (dashboard, wallets etc.)
  if (booting && !isPublicPage) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-xl shadow-lg">
            💸
          </div>
          <div>
            <p className="text-base font-bold text-foreground">Expensly</p>
            <p className="text-xs text-muted-foreground">Loading your data…</p>
          </div>
        </div>
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full animate-pulse w-3/4" />
        </div>
      </div>
    );
  }

  return children;
}

function PinActivityTracker({ children }) {
  const user         = useAuthStore(s => s.user);
  const pinEnabled   = usePinStore(s => s.pinEnabled);
  const touch        = usePinStore(s => s.touch);
  const checkAndLock = usePinStore(s => s.checkAndLock);
  const isLocked     = usePinStore(s => s.isLocked);
  const handleActivity = useCallback(() => { if (!isLocked) touch(); }, [isLocked, touch]);
  useEffect(() => {
    if (!user || !pinEnabled) return;
    const evts = ['mousedown','keydown','touchstart','scroll','mousemove'];
    evts.forEach(e => document.addEventListener(e, handleActivity, { passive: true }));
    return () => evts.forEach(e => document.removeEventListener(e, handleActivity));
  }, [user, pinEnabled, handleActivity]);
  useEffect(() => {
    if (!user || !pinEnabled) return;
    const id = setInterval(checkAndLock, 30_000);
    return () => clearInterval(id);
  }, [user, pinEnabled, checkAndLock]);
  useEffect(() => {
    if (!user || !pinEnabled) return;
    const h = () => { if (document.visibilityState === 'visible') checkAndLock(); };
    document.addEventListener('visibilitychange', h);
    return () => document.removeEventListener('visibilitychange', h);
  }, [user, pinEnabled, checkAndLock]);
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <OfflineBanner />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background:  'var(--color-card)',
              color:       'var(--color-foreground)',
              border:      '1px solid var(--color-border)',
              fontFamily:  "'Inter', sans-serif",
              fontSize:    13,
              boxShadow:   '0 4px 16px rgba(0,0,0,0.12)',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
          }}
        />
        <DataLoader>
          <PinActivityTracker>
            <PinLock />
            <Suspense fallback={<FullScreenLoader />}>
            <Routes>
              <Route path="/"              element={<LandingPage />} />
              <Route path="/landing-page"  element={<LandingPage />} />
              <Route path="/login"         element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
              <Route path="/register"      element={<RedirectIfAuth><RegisterPage /></RedirectIfAuth>} />
              <Route path="/forgot-password" element={<RedirectIfAuth><ForgotPasswordPage /></RedirectIfAuth>} />
              <Route path="/reset-password"  element={<ResetPasswordPage />} />
              <Route path="/onboarding"          element={<RequireAuth><OnboardingPage /></RequireAuth>} />
              <Route path="/dashboard"           element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/transactions-list"   element={<RequireAuth><TransactionsList /></RequireAuth>} />
              <Route path="/add-transaction"     element={<RequireAuth><AddTransaction /></RequireAuth>} />
              <Route path="/reports-analytics"   element={<RequireAuth><ReportsAnalytics /></RequireAuth>} />
              <Route path="/wallets"             element={<RequireAuth><WalletsPage /></RequireAuth>} />
              <Route path="/budgets"             element={<RequireAuth><BudgetsPage /></RequireAuth>} />
              <Route path="/goals"               element={<RequireAuth><GoalsPage /></RequireAuth>} />
              <Route path="/debts"               element={<RequireAuth><DebtsPage /></RequireAuth>} />
              <Route path="/calendar"            element={<RequireAuth><CalendarPage /></RequireAuth>} />
              <Route path="/statistics"          element={<RequireAuth><StatisticsPage /></RequireAuth>} />
              <Route path="/recurring"           element={<RequireAuth><RecurringPage /></RequireAuth>} />
              <Route path="/settings"            element={<RequireAuth><SettingsPage /></RequireAuth>} />
              <Route path="*"                    element={<NotFound />} />
            </Routes>
            </Suspense>
          </PinActivityTracker>
        </DataLoader>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
