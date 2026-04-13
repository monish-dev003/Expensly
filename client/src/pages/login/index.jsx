import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, animate, useMotionValue, useTransform } from 'framer-motion';
import { useAuthStore } from '../../store/index.js';
import ExpenslyLogo from '../../components/ExpenslyLogo.jsx';
import { signInWithGoogle } from '../../firebase.js';
import { Helmet } from 'react-helmet-async';

// ── Finance showcase ──────────────────────────────────────────────────────────
function FinanceShowcase() {
  const TXNS = [
    { icon: '🛒', name: 'Blinkit Groceries', cat: 'Food', amt: '-₹840', color: 'text-red-300' },
    { icon: '💼', name: 'Monthly Salary', cat: 'Income', amt: '+₹45k', color: 'text-emerald-300' },
    { icon: '📱', name: 'JioHotstar', cat: 'Subscription', amt: '-₹299', color: 'text-red-300' },
    { icon: '🎯', name: 'Goa Trip Goal', cat: 'Savings', amt: '+₹5,000', color: 'text-blue-300' },
  ];
  return (
    <div className="h-full flex flex-col gap-2.5 rounded-2xl border border-white/15 p-4 relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)' }}>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle,#60a5fa,transparent)' }} />
      <div className="flex items-start justify-between flex-shrink-0">
        <div>
          <p className="text-white/40 text-[10px] font-medium">Total Balance</p>
          <p className="text-2xl font-extrabold text-white leading-none mt-0.5">₹1,24,580</p>
          <div className="flex gap-3 mt-1.5">
            <span className="text-emerald-300 text-[10px] font-bold">+₹45k income</span>
            <span className="text-white/30 text-[10px]">·</span>
            <span className="text-red-300 text-[10px] font-bold">-₹18.4k spent</span>
          </div>
        </div>
        <motion.div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }} />
      </div>
      <div className="flex-1 min-h-0 flex flex-col justify-between mt-2">
        <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-2">
          Recent Activity
        </p>
        <div className="flex-1 flex flex-col justify-between gap-1.5">
          {TXNS.map((t, i) => (
            <motion.div key={t.name}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.08 }}
              className="flex-1 flex items-center justify-between bg-white/5 border border-white/8 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-base flex-shrink-0">{t.icon}</span>
                <div className="min-w-0">
                  <p className="text-white/80 text-[11px] font-semibold truncate">{t.name}</p>
                  <p className="text-white/40 text-[9px] mt-0.5">{t.cat}</p>
                </div>
              </div>
              <span className={`text-[11px] font-extrabold flex-shrink-0 ml-2 ${t.color}`}>{t.amt}</span>
            </motion.div>
          ))}
        </div>
      </div>
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-3 right-3 rounded-xl px-2.5 py-1.5 border border-white/20 shadow-lg"
        style={{ background: 'rgba(16,185,129,0.2)', backdropFilter: 'blur(12px)' }}>
        <p className="text-[8px] text-white/60">🤖 AI</p>
        <p className="text-[10px] font-extrabold text-emerald-300">-₹3.2k/mo</p>
      </motion.div>
    </div>
  );
}

// ── Left Branding Panel ───────────────────────────────────────────────────────
const CARDS = [
  { id: 'goal', icon: '🎯', label: 'Goal Progress', value: '68% reached', grad: 'from-blue-500 to-indigo-500', delay: 0.1, y: [-4, 4, -4] },
  { id: 'saved', icon: '💰', label: 'Monthly Saved', value: '+₹8,580', grad: 'from-emerald-500 to-teal-500', delay: 0.2, y: [4, -4, 4] },
  { id: 'saved2', icon: '📈', label: 'Monthly Saved', value: '+₹26,580', grad: 'from-purple-500 to-violet-500', delay: 0.3, y: [-3, 3, -3] },
  { id: 'budget', icon: '🎯', label: 'Budget Alert', value: '₹2,000 left', grad: 'from-orange-500 to-amber-500', delay: 0.4, y: [3, -3, 3] },
];

function BrandingPanel() {
  return (
    <div className="hidden lg:flex lg:w-[52%] h-screen overflow-hidden relative flex-col"
      style={{ background: 'linear-gradient(135deg,#1d4ed8 0%,#4338ca 40%,#0d9488 100%)' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle,#93c5fd,transparent 70%)' }}
          animate={{ scale: [1, 1.5, 1], rotate: [0, 180, 0] }} transition={{ duration: 20, repeat: Infinity }} />
        <motion.div className="absolute top-1/2 right-0 w-64 h-64 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle,#5eead4,transparent 70%)' }}
          animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 14, repeat: Infinity, delay: 4 }} />
        <motion.div className="absolute bottom-0 left-1/3 w-56 h-56 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle,#a78bfa,transparent 70%)' }}
          animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 11, repeat: Infinity, delay: 7 }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle,#34d399,transparent)' }} />
      </div>
      <div className="relative flex flex-col h-full px-9 py-7 z-10 gap-4">
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 select-none">
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="19" stroke="#93c5fd" strokeWidth="2" />
              <circle cx="20" cy="20" r="14" fill="#93c5fd" opacity="0.15" />
              <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
                fill="#93c5fd" fontSize="17" fontWeight="800" fontFamily="system-ui">₹</text>
              <rect x="10" y="29" width="3" height="4" rx="1" fill="#6ee7b7" opacity="0.7" />
              <rect x="15" y="27" width="3" height="6" rx="1" fill="#6ee7b7" opacity="0.85" />
              <rect x="20" y="25" width="3" height="8" rx="1" fill="#6ee7b7" />
              <rect x="25" y="28" width="3" height="5" rx="1" fill="#6ee7b7" opacity="0.7" />
            </svg>
            <span className="text-xl font-extrabold tracking-tight text-white">Expensly</span>
          </div>
          <Link to="/" className="text-white/50 text-sm hover:text-white flex items-center gap-1.5 transition-colors group">
            <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span> Home
          </Link>
        </div>
        <div className="flex items-stretch gap-2.5 flex-shrink-0">
          {CARDS.map(c => (
            <motion.div key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: c.y }}
              transition={{
                opacity: { delay: c.delay, duration: 0.5 },
                y: { duration: 3.5 + c.delay, repeat: Infinity, ease: 'easeInOut', delay: c.delay },
              }}
              className="flex-1 rounded-xl px-2.5 py-2.5 border border-white/20 min-w-0"
              style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(14px)' }}>
              <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${c.grad} flex items-center justify-center text-[10px] mb-1.5 shadow-sm`}>
                {c.icon}
              </div>
              <p className="text-white/45 text-[8px] font-semibold leading-none mb-0.5 truncate">{c.label}</p>
              <p className="text-white text-[10px] font-extrabold leading-tight truncate">{c.value}</p>
            </motion.div>
          ))}
        </div>
        <motion.div className="flex-shrink-0"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}>
          <h1 className="text-3xl font-extrabold text-white leading-tight">
            Track Every Rupee.<br />
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg,#fde68a,#6ee7b7)' }}>
              Stress Less.
            </span>
          </h1>
          <p className="text-white/55 text-sm mt-2 leading-relaxed max-w-xs">
            Track wallets, budgets & goals — every rupee accounted for, every month.
          </p>
        </motion.div>
        <motion.div className="flex-1 min-h-0"
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.7 }}>
          <FinanceShowcase />
        </motion.div>
        <motion.div className="grid grid-cols-3 gap-2 flex-shrink-0"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }}>
          {[['72k+', 'Active Users'], ['₹48Cr+', 'Tracked'], ['12+', 'Banks']].map(([n, l]) => (
            <div key={l} className="rounded-xl py-2 px-2 text-center border border-white/12"
              style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)' }}>
              <p className="text-white font-extrabold text-sm tabular-nums">{n}</p>
              <p className="text-white/35 text-[8px] mt-0.5">{l}</p>
            </div>
          ))}
        </motion.div>
        <motion.div className="flex flex-wrap gap-1.5 flex-shrink-0"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95, duration: 0.6 }}>
          {['Free Forever', 'Bank Security', 'UPI', 'Instant Reports'].map(s => (
            <span key={s} className="text-[10px] font-semibold text-white/65 px-2.5 py-1 rounded-full border border-white/15"
              style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(6px)' }}>
              ✦ {s}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
const EYE_ON = <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const EYE_OFF = <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" /></svg>;

function Field({ label, type = 'text', value, onChange, error, placeholder, autoComplete, rightEl }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className={`relative flex items-center rounded-xl border-2 bg-white transition-all duration-200 ${error ? 'border-red-400' : focused ? 'border-blue-500 shadow-sm shadow-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
        <input type={type} value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={placeholder} autoComplete={autoComplete}
          className="flex-1 px-4 py-3 bg-transparent text-gray-900 text-sm rounded-xl outline-none placeholder:text-gray-400" />
        {rightEl && <div className="pr-3 flex-shrink-0">{rightEl}</div>}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-xs text-red-500 mt-1 flex items-center gap-1">⚠ {error}</motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Login ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithFirebase, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [show, setShow] = useState(false);
  const [rem, setRem] = useState(false);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem('expensly-remember');
    if (s) { setEmail(s); setRem(true); }
  }, []);

  useEffect(() => {
    if (!email) return;
    setErrs(e => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? { ...e, email: 'Enter valid email' } : (({ email: _, ...r }) => r)(e));
  }, [email]);

  useEffect(() => {
    if (!pwd) return;
    setErrs(e => pwd.length < 6
      ? { ...e, pwd: 'Minimum 6 characters' } : (({ pwd: _, ...r }) => r)(e));
  }, [pwd]);

  const validate = () => {
    const e = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter valid email';
    if (!pwd || pwd.length < 6) e.pwd = 'Minimum 6 characters';
    setErrs(e); return !Object.keys(e).length;
  };

  const handleSubmit = async ev => {
    ev.preventDefault();
    if (!validate()) return;
    setBusy(true);
    rem ? localStorage.setItem('expensly-remember', email) : localStorage.removeItem('expensly-remember');
    const res = await login({ email: email.trim(), password: pwd });
    setBusy(false);
    if (res.success) navigate('/dashboard');
  };

  const handleGoogle = async () => {
    setBusy(true);
    try {
      const idToken = await signInWithGoogle();
      const res = await loginWithFirebase(idToken);
      if (res.success) {
        navigate(res.isNewUser ? '/onboarding' : '/dashboard');
      }
    } catch (err) {
      console.error('Google login error:', err);
      const toast = (await import('react-hot-toast')).default;
      toast.error(err?.message || 'Google sign-in failed. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const fV = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
  const iV = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } } };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">
      <Helmet>
        <title>Sign In — Expensly</title>
        <meta name="description" content="Sign in to Expensly to track your income, expenses, and savings." />
      </Helmet>
      <BrandingPanel />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <ExpenslyLogo showText textClassName="text-xl" /><Link to="/" className="text-sm text-gray-500 hover:text-blue-600">← Home</Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <motion.div variants={fV} initial="hidden" animate="visible" className="w-full max-w-md">
            <motion.div variants={iV} className="mb-7">
              <div className="mb-6"><ExpenslyLogo showText textClassName="text-xl" /></div>
              <h2 className="text-2xl font-extrabold text-gray-900">Welcome back 👋</h2>
              <p className="text-gray-500 text-sm mt-1">
                New here?{' '}<Link to="/register" className="text-blue-600 font-semibold hover:underline">Create free account →</Link>
              </p>
            </motion.div>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <motion.div variants={iV}>
                <motion.button type="button" onClick={handleGoogle} disabled={busy}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-60">
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" />
                    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
                  </svg>
                  Continue with Google
                </motion.button>
              </motion.div>
              <motion.div variants={iV} className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or sign in with email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </motion.div>
              <motion.div variants={iV}>
                <Field label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  error={errs.email} placeholder="Enter Email Address" autoComplete="email" />
              </motion.div>
              <motion.div variants={iV}>
                <Field label="Password" type={show ? 'text' : 'password'} value={pwd} onChange={e => setPwd(e.target.value)}
                  error={errs.pwd} placeholder="Enter your password" autoComplete="current-password"
                  rightEl={<button type="button" onClick={() => setShow(v => !v)} className="text-gray-400 hover:text-gray-700 p-1">{show ? EYE_OFF : EYE_ON}</button>} />
              </motion.div>
              <motion.div variants={iV} className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div onClick={() => setRem(v => !v)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${rem ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
                    {rem && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </div>
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-blue-600 font-medium hover:underline">Forgot password?</Link>
              </motion.div>
              <motion.div variants={iV}>
                <motion.button type="submit" disabled={busy || loading}
                  whileHover={{ scale: busy ? 1 : 1.02, boxShadow: '0 8px 24px rgba(37,99,235,0.35)' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-blue-600 to-emerald-500 shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                  {busy
                    ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Signing in…</>
                    : <>Sign In to Expensly →</>}
                </motion.button>
              </motion.div>
            </form>
            <motion.div variants={iV} className="mt-6 flex flex-wrap justify-center gap-2">
              {[{ i: '👥', t: '72,000+ users' }, { i: '🔒', t: 'Bank-level security' }, { i: '✅', t: 'Free forever' }].map(c => (
                <span key={c.t} className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full font-medium">
                  {c.i} {c.t}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}