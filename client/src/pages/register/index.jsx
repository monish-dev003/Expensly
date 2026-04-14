import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { useAuthStore } from '../../store/index.js';
import ExpenslyLogo from '../../components/ExpenslyLogo.jsx';
import { signInWithGoogle } from '../../firebase.js';
import { Helmet } from 'react-helmet-async';

// ── Logo ──────────────────────────────────────────────────────────────────────
const LogoLight = () => (
  <div className="flex items-center gap-2.5 select-none">
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="19" stroke="#2563EB" strokeWidth="2" />
      <circle cx="20" cy="20" r="14" fill="#2563EB" opacity="0.12" />
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
        fill="#2563EB" fontSize="17" fontWeight="800" fontFamily="system-ui">₹</text>
      <rect x="10" y="29" width="3" height="4" rx="1" fill="#10B981" opacity="0.7" />
      <rect x="15" y="27" width="3" height="6" rx="1" fill="#10B981" opacity="0.85" />
      <rect x="20" y="25" width="3" height="8" rx="1" fill="#10B981" />
      <rect x="25" y="28" width="3" height="5" rx="1" fill="#10B981" opacity="0.7" />
    </svg>
    <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
      Expensly
    </span>
  </div>
);

const LogoDark = () => (
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
    <span className="text-xl font-extrabold tracking-tight text-white">
      Expensly
    </span>
  </div>
);

const Logo = ({ dark = false }) => dark ? <LogoDark /> : <LogoLight />;

// ── Floating ₹ particles ──────────────────────────────────────────────────────
function RupeeParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: 5 + (i * 5.3) % 90,
    delay: i * 0.4,
    duration: 6 + (i % 5),
    size: i % 3 === 0 ? 14 : i % 3 === 1 ? 10 : 8,
    opacity: i % 3 === 0 ? 0.25 : i % 3 === 1 ? 0.15 : 0.10,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <Helmet>
        <title>Create Account — Expensly</title>
        <meta name="description" content="Create your free Expensly account and start tracking your finances today." />
      </Helmet>
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute font-black text-white select-none"
          style={{ left: `${p.x}%`, bottom: '-20px', fontSize: p.size, opacity: 0 }}
          animate={{ y: [0, -700], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        >₹</motion.div>
      ))}
    </div>
  );
}

// ── Animated SVG savings growth line ─────────────────────────────────────────
function SavingsGrowthChart() {
  const pathRef = useRef(null);
  const [drawn, setDrawn] = useState(false);

  // Points: Month 0-12, savings growth curve
  const points = [
    [0, 100], [1, 95], [2, 88], [3, 80], [4, 70], [5, 58],
    [6, 45], [7, 34], [8, 24], [9, 16], [10, 10], [11, 5], [12, 2]
  ];
  const W = 260, H = 90;
  const toX = m => (m / 12) * W;
  const toY = v => (v / 100) * H;

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p[0])} ${toY(p[1])}`).join(' ');
  const areaD = pathD + ` L ${W} ${H} L 0 ${H} Z`;

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 600);
    return () => clearTimeout(t);
  }, []);

  const milestones = [
    { m: 0, label: 'Start', val: '₹0', color: '#94a3b8' },
    { m: 4, label: '4mo', val: '₹12k', color: '#60a5fa' },
    { m: 8, label: '8mo', val: '₹32k', color: '#a78bfa' },
    { m: 12, label: '1yr', val: '₹58k', color: '#34d399' },
  ];

  return (
    <div className="relative">
      <div className="flex justify-between items-end mb-1">
        <p className="text-white/55 text-[10px] font-semibold uppercase tracking-wider">Avg. User Savings Growth</p>
        <motion.span className="text-emerald-300 text-[10px] font-bold"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
          +₹58,000 in 1 year ✓
        </motion.span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Area fill */}
        <motion.path d={areaD} fill="url(#chartGrad)"
          initial={{ opacity: 0 }} animate={{ opacity: drawn ? 1 : 0 }}
          transition={{ delay: 0.8, duration: 1 }} />

        {/* Grid lines */}
        {[25, 50, 75].map(y => (
          <line key={y} x1="0" y1={toY(y)} x2={W} y2={toY(y)}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
        ))}

        {/* Animated line */}
        {drawn && (
          <motion.path
            d={pathD}
            fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: 'easeInOut', delay: 0.2 }}
          />
        )}

        {/* Milestone dots */}
        {milestones.map((ms, i) => (
          <motion.g key={ms.m}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.4, type: 'spring', stiffness: 300 }}>
            <circle cx={toX(ms.m)} cy={toY(points[ms.m]?.[1] ?? 2)} r="4"
              fill={ms.color} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          </motion.g>
        ))}
      </svg>

      {/* Milestone labels */}
      <div className="flex justify-between mt-1">
        {milestones.map((ms, i) => (
          <motion.div key={ms.m} className="text-center"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + i * 0.3 }}>
            <p className="font-extrabold text-[10px] tabular-nums" style={{ color: ms.color }}>{ms.val}</p>
            <p className="text-white/35 text-[8px]">{ms.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Achievement badges (pop in with glow) ────────────────────────────────────
const ACHIEVEMENTS = [
  { icon: '💳', title: 'Wallet Added', sub: 'SBI Savings linked', color: '#3b82f6', delay: 0.5 },
  { icon: '🎯', title: 'Goal Created', sub: 'Goa Trip · ₹50,000', color: '#8b5cf6', delay: 1.1 },
  { icon: '🎯', title: 'Budget Created', sub: '₹30,000/month', color: '#f59e0b', delay: 1.7 },
  { icon: '💰', title: 'First ₹10k Saved!', sub: 'Month 2', color: '#10b981', delay: 2.3 },
];

function AchievementBadge({ ach }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30, scale: 0.85 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay: ach.delay, type: 'spring', stiffness: 260, damping: 20 }}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 border border-white/20"
      style={{ background: 'rgba(255,255,255,0.09)', backdropFilter: 'blur(14px)' }}
    >
      {/* Glow ring */}
      <div className="relative flex-shrink-0">
        <motion.div className="absolute inset-0 rounded-lg blur-sm"
          style={{ background: ach.color, opacity: 0.5 }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: ach.delay }} />
        <div className="relative w-8 h-8 rounded-lg flex items-center justify-center text-base"
          style={{ background: `${ach.color}30`, border: `1.5px solid ${ach.color}60` }}>
          {ach.icon}
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-white text-[11px] font-bold leading-tight truncate">{ach.title}</p>
        <p className="text-white/45 text-[9px] truncate">{ach.sub}</p>
      </div>
      <motion.div className="ml-auto flex-shrink-0"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: ach.delay + 0.3, type: 'spring' }}>
        <div className="w-4 h-4 rounded-full bg-emerald-500/30 border border-emerald-400/50 flex items-center justify-center">
          <span className="text-emerald-300 text-[8px] font-bold">✓</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Count({ to, prefix = '', suffix = '', decimals = 0 }) {
  const val = useMotionValue(0);
  const display = useTransform(val, v =>
    `${prefix}${decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('en-IN')}${suffix}`
  );
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        animate(val, to, { duration: 1.8, ease: 'easeOut' });
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <motion.span ref={ref}>{display}</motion.span>;
}

// ── Right Branding Panel — "Your Financial Transformation" ───────────────────
function BrandingPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-[52%] h-screen overflow-hidden relative flex-col"
      style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 25%,#1d4ed8 60%,#0d9488 100%)' }}
    >
      {/* Rupee particle background */}
      <RupeeParticles />

      {/* Mesh orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle,#a78bfa,transparent 65%)' }}
          animate={{ scale: [1, 1.4, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle,#34d399,transparent 65%)' }}
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }} />
        <motion.div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle,#60a5fa,transparent 65%)', translateX: '-50%', translateY: '-50%' }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 7 }} />
        {/* Dot grid */}
        <div className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px,transparent 1px)', backgroundSize: '22px 22px' }} />
        {/* Diagonal shimmer */}
        <motion.div className="absolute inset-0 opacity-5"
          style={{ background: 'linear-gradient(45deg,transparent 40%,rgba(255,255,255,0.3) 50%,transparent 60%)' }}
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear', repeatDelay: 3 }} />
      </div>

      <div className="relative flex flex-col h-full px-9 py-7 z-10 gap-4">

        {/* ── 1. Logo + Back ── */}
        <div className="flex items-center justify-between flex-shrink-0">
          <Logo dark />
          <Link to="/" className="text-white/45 text-sm hover:text-white flex items-center gap-1.5 transition-colors group">
            <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span> Home
          </Link>
        </div>

        {/* ── 2. Power Headline with animated word ── */}
        <div className="flex-shrink-0">
          <motion.div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 text-xs font-semibold text-white/70 mb-3"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}>🚀</motion.span>
            Join 72,000+ smart Indians
          </motion.div>

          <motion.h1 className="text-3xl font-extrabold text-white leading-tight"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}>
            Turn Your Salary Into{' '}
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg,#c4b5fd,#6ee7b7)' }}>
                Real Wealth
              </span>
              <motion.div className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full"
                style={{ background: 'linear-gradient(90deg,#c4b5fd,#6ee7b7)' }}
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }} />
            </span>
          </motion.h1>

          <motion.p className="text-white/50 text-sm mt-2 leading-relaxed max-w-xs"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.7 }}>
            People who track their expenses save <span className="text-emerald-300 font-bold">23% more</span> in the first year. Start your transformation today.
          </motion.p>
        </div>

        {/* ── 3. Savings Growth Chart ── */}
        <motion.div className="flex-shrink-0 rounded-2xl p-4 border border-white/15"
          style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)' }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}>
          <SavingsGrowthChart />
        </motion.div>

        {/* ── 4. Achievement Badges (fills flex-1) ── */}
        <div className="flex-1 min-h-0 flex flex-col justify-center gap-2">
          <motion.p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest flex-shrink-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            🏆 What you unlock with Expensly
          </motion.p>
          {ACHIEVEMENTS.map(a => (
            <AchievementBadge key={a.title} ach={a} />
          ))}

          {/* Live notification simulation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 3.2, type: 'spring', stiffness: 200 }}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 border border-emerald-400/30"
            style={{ background: 'rgba(16,185,129,0.12)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"
              animate={{ scale: [1, 1.8, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }} />
            <p className="text-emerald-300 text-[11px] font-semibold">.</p>
          </motion.div>
        </div>

        {/* ── 5. Stats strip ── */}
        <motion.div className="grid grid-cols-3 gap-2 flex-shrink-0"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.7 }}>
          {[
            { to: 72000, prefix: '', suffix: '+', label: 'Active Users' },
            { to: 48, prefix: '₹', suffix: 'Cr+', label: 'Total Tracked' },
            { to: 23, prefix: '', suffix: '%', label: 'More Savings' },
          ].map(s => (
            <div key={s.label} className="rounded-xl py-2.5 px-2 text-center border border-white/12"
              style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)' }}>
              <p className="text-white font-extrabold text-sm tabular-nums">
                <Count to={s.to} prefix={s.prefix} suffix={s.suffix} />
              </p>
              <p className="text-white/35 text-[8px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── 6. Trust tagline ── */}
        <motion.div className="flex items-center justify-center gap-2 flex-shrink-0"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
          <motion.div className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          <p className="text-white/40 text-[11px] font-medium">
            Free forever · No credit card · Bank-level 256-bit security
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ── Password strength ─────────────────────────────────────────────────────────
const gStr = p => {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
};
const SC = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500'];
const SL = ['', 'Weak', 'Fair', 'Good', 'Strong 🔒'];
const ST = ['', 'text-red-500', 'text-orange-500', 'text-yellow-600', 'text-emerald-600'];

// ── Eye icons ─────────────────────────────────────────────────────────────────
const EYE_ON = <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const EYE_OFF = <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" /></svg>;

// ── Input Field ───────────────────────────────────────────────────────────────
function Field({ label, type = 'text', value, onChange, error, success, placeholder, autoComplete, rightEl, hint }) {
  const [focused, setFocused] = useState(false);
  const ok = success && !error && value;
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className={`relative flex items-center rounded-xl border-2 bg-white transition-all duration-200 ${error ? 'border-red-400 shadow-sm shadow-red-50'
        : ok ? 'border-emerald-400 shadow-sm shadow-emerald-50'
          : focused ? 'border-violet-500 shadow-sm shadow-violet-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}>
        <input type={type} value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={placeholder} autoComplete={autoComplete}
          className="flex-1 px-4 py-2.5 bg-transparent text-gray-900 text-sm rounded-xl outline-none placeholder:text-gray-400" />
        {ok && !rightEl && <span className="pr-3 text-emerald-500 text-sm">✓</span>}
        {rightEl && <div className="pr-3 flex-shrink-0">{rightEl}</div>}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-xs text-red-500 mt-1">⚠ {error}</motion.p>
        )}
      </AnimatePresence>
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

// ── Step Bar ──────────────────────────────────────────────────────────────────
const STEPS = [{ num: 1, label: 'Account', icon: '👤' }, { num: 2, label: 'Wallet', icon: '💳' }, { num: 3, label: 'Prefs', icon: '⚙️' }];

function StepBar({ cur }) {
  return (
    <div className="flex items-center gap-0 mb-3">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.num}>
          <div className="flex flex-col items-center gap-1">
            <motion.div
              animate={{
                background: cur === s.num ? 'linear-gradient(135deg,#7c3aed,#10B981)'
                  : cur > s.num ? '#10B981' : '#e5e7eb',
                scale: cur === s.num ? 1.08 : 1,
              }}
              transition={{ duration: 0.3 }}
              className="w-7 h-7 rounded-full flex items-center justify-center shadow-sm"
            >
              {cur > s.num
                ? <span className="text-white font-bold text-sm">✓</span>
                : <span className={`text-xs ${cur === s.num ? 'text-white' : 'text-gray-400'}`}>{s.icon}</span>}
            </motion.div>
            <span className={`text-[9px] font-semibold whitespace-nowrap ${cur === s.num ? 'text-violet-600' : cur > s.num ? 'text-emerald-600' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <motion.div className="flex-1 h-0.5 mx-2 mb-4 rounded-full"
              animate={{ background: cur > s.num ? '#10B981' : '#e5e7eb' }}
              transition={{ duration: 0.3 }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────
const W_ICONS = ['💵', '💳', '🏦', '💰', '📱', '🏠', '💎', '🎯'];
const W_TYPES = ['cash', 'bank', 'credit', 'savings', 'investment', 'other'];
const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: '₹ Indian Rupee' },
  { code: 'USD', symbol: '$', label: '$ US Dollar' },
  { code: 'EUR', symbol: '€', label: '€ Euro' },
  { code: 'GBP', symbol: '£', label: '£ British Pound' },
  { code: 'AED', symbol: 'د.إ', label: 'د.إ UAE Dirham' },
];

// ── Main Register Page ────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loginWithFirebase, loading } = useAuthStore();

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [busy, setBusy] = useState(false);
  const [errs, setErrs] = useState({});
  const [sp, setSp] = useState(false);
  const [sp2, setSp2] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [cpwd, setCpwd] = useState('');

  const [wName, setWName] = useState('My Wallet');
  const [wType, setWType] = useState('bank');
  const [wBal, setWBal] = useState('');
  const [wIcon, setWIcon] = useState('🏦');

  const [cur, setCur] = useState('INR');
  const [theme, setTheme] = useState('light');
  const [agreed, setAgreed] = useState(false);

  const str = gStr(pwd);

  // Real-time validations
  useEffect(() => {
    if (!name) return;
    setErrs(e => name.trim().length < 2 ? { ...e, name: 'Min 2 chars' } : (({ name: _, ...r }) => r)(e));
  }, [name]);
  useEffect(() => {
    if (!email) return;
    setErrs(e => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? { ...e, email: 'Enter valid email' } : (({ email: _, ...r }) => r)(e));
  }, [email]);
  useEffect(() => {
    if (!pwd) return;
    setErrs(e => pwd.length < 8 ? { ...e, pwd: 'Min 8 characters' } : (({ pwd: _, ...r }) => r)(e));
  }, [pwd]);
  useEffect(() => {
    if (!cpwd) return;
    setErrs(e => cpwd !== pwd ? { ...e, cpwd: 'Does not match' } : (({ cpwd: _, ...r }) => r)(e));
  }, [cpwd, pwd]);

  const v1 = () => {
    const e = {};
    if (!name.trim() || name.trim().length < 2) e.name = 'Enter full name';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Valid email required';
    if (!pwd || pwd.length < 8) e.pwd = 'Min 8 characters';
    if (!cpwd) e.cpwd = 'Confirm your password';
    else if (cpwd !== pwd) e.cpwd = 'Does not match';
    setErrs(e); return !Object.keys(e).length;
  };
  const v2 = () => {
    const e = {};
    if (!wName.trim()) e.wName = 'Wallet name required';
    setErrs(e); return !Object.keys(e).length;
  };

  const goNext = () => {
    if (step === 1 && !v1()) return;
    if (step === 2 && !v2()) return;
    setDir(1); setStep(s => s + 1);
  };
  const goPrev = () => { setDir(-1); setStep(s => s - 1); };

  const submit = async () => {
    if (!agreed) { setErrs({ agreed: 'Accept terms to continue' }); return; }
    setBusy(true);
    const c = CURRENCIES.find(x => x.code === cur) || CURRENCIES[0];
    const res = await register({
      name: name.trim(), email: email.trim().toLowerCase(), password: pwd,
      currency: c.code, currencySymbol: c.symbol, theme,
      wallets: [{ name: wName.trim(), type: wType, balance: parseFloat(wBal) || 0, icon: wIcon, color: '#48bb78' }],
    });
    setBusy(false);
    if (res.success) navigate('/onboarding');
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
      console.error('Google register error:', err);
      const toast = (await import('react-hot-toast')).default;
      toast.error(err?.message || 'Google sign-in failed. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const sv = {
    enter: d => ({ opacity: 0, x: d > 0 ? 35 : -35 }),
    center: { opacity: 1, x: 0 },
    exit: d => ({ opacity: 0, x: d > 0 ? -35 : 35 }),
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">

      {/* ── Left: Form ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <ExpenslyLogo showText textClassName="text-xl" /><Link to="/" className="text-sm text-gray-500 hover:text-violet-600">← Home</Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-0">
          <div className="w-full max-w-md">

            <div className="mb-3"><ExpenslyLogo showText textClassName="text-xl" /></div>
            <StepBar cur={step} />

            <motion.div key={`hdr${step}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-3">
              <h2 className="text-xl font-extrabold text-gray-900">
                {step === 1 ? 'Create your account' : step === 2 ? 'Set up your wallet' : 'Final preferences'}
              </h2>
              <p className="text-gray-500 text-sm mt-0.5">
                {step === 1
                  ? <span>Already registered? <Link to="/login" className="text-violet-600 font-semibold hover:underline">Sign in →</Link></span>
                  : step === 2 ? 'Add more wallets anytime after signup.'
                    : 'Almost there — last step!'}
              </p>
            </motion.div>

            {/* ── Step forms ── */}
            <AnimatePresence mode="wait" custom={dir}>
              {step === 1 && (
                <motion.div key="s1" custom={dir} variants={sv} initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.28 }} className="space-y-2.5">

                  {/* Google Sign Up Button */}
                  <motion.button type="button" onClick={handleGoogle} disabled={busy}
                    whileHover={{ scale: busy ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-60">
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" />
                      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
                      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
                    </svg>
                    {busy ? 'Signing in…' : 'Continue with Google'}
                  </motion.button>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 font-medium">or sign up with email</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  <Field label="Full Name" value={name} onChange={e => setName(e.target.value)}
                    error={errs.name} success placeholder="Monish Shekh" autoComplete="name" />
                  <Field label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)}
                    error={errs.email} success placeholder="you@example.com" autoComplete="email" />
                  <div>
                    <Field label="Password" type={sp ? 'text' : 'password'} value={pwd}
                      onChange={e => setPwd(e.target.value)} error={errs.pwd}
                      placeholder="Min 8 characters" autoComplete="new-password"
                      rightEl={<button type="button" onClick={() => setSp(v => !v)} className="text-gray-400 hover:text-gray-700 p-0.5">{sp ? EYE_OFF : EYE_ON}</button>} />
                    {pwd && (
                      <div className="mt-1.5">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= str ? SC[str] : 'bg-gray-200'}`} />
                          ))}
                        </div>
                        <p className={`text-[11px] font-semibold ${ST[str]}`}>{SL[str]}</p>
                      </div>
                    )}
                  </div>
                  <Field label="Confirm Password" type={sp2 ? 'text' : 'password'} value={cpwd}
                    onChange={e => setCpwd(e.target.value)} error={errs.cpwd}
                    success={cpwd === pwd && cpwd.length > 0}
                    placeholder="Re-enter password" autoComplete="new-password"
                    rightEl={<button type="button" onClick={() => setSp2(v => !v)} className="text-gray-400 hover:text-gray-700 p-0.5">{sp2 ? EYE_OFF : EYE_ON}</button>} />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" custom={dir} variants={sv} initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.28 }} className="space-y-2.5">
                  <Field label="Wallet Name" value={wName} onChange={e => setWName(e.target.value)}
                    error={errs.wName} success placeholder="e.g. SBI Savings, Cash" />
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Icon</label>
                    <div className="flex gap-2 flex-wrap">
                      {W_ICONS.map(ic => (
                        <motion.button key={ic} type="button" onClick={() => setWIcon(ic)}
                          whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.95 }}
                          className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border-2 transition-all ${wIcon === ic ? 'border-violet-500 bg-violet-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                          {ic}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {W_TYPES.map(t => (
                        <button key={t} type="button" onClick={() => setWType(t)}
                          className={`py-2 rounded-xl text-xs font-semibold border-2 capitalize transition-all ${wType === t ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Field label="Opening Balance (₹)" type="number" value={wBal}
                    onChange={e => setWBal(e.target.value)} placeholder="0" hint="Optional — your current balance" />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s3" custom={dir} variants={sv} initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.28 }} className="space-y-2.5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Currency</label>
                    <div className="space-y-1.5">
                      {CURRENCIES.map(c => (
                        <button key={c.code} type="button" onClick={() => setCur(c.code)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border-2 text-sm transition-all ${cur === c.code ? 'border-violet-500 bg-violet-50 text-violet-700 font-semibold' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                          <span>{c.label}</span>
                          {cur === c.code && <span className="text-violet-500">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Theme</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ v: 'light', l: '☀️ Light' }, { v: 'dark', l: '🌙 Dark' }, { v: 'system', l: '⚙️ System' }].map(t => (
                        <button key={t.v} type="button" onClick={() => setTheme(t.v)}
                          className={`py-2.5 rounded-xl border-2 text-sm font-semibold text-center transition-all ${theme === t.v ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                          {t.l}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Summary card */}
                  <div className="rounded-2xl p-4 border border-violet-100"
                    style={{ background: 'linear-gradient(135deg,#f5f3ff,#ecfdf5)' }}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Setup Summary</p>
                    <div className="space-y-1.5 text-sm">
                      {[['Name', name], ['Email', email], ['Wallet', `${wIcon} ${wName}`], ['Currency', CURRENCIES.find(c => c.code === cur)?.label]].map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-gray-500">{k}</span>
                          <span className="font-semibold text-gray-800 truncate ml-3 max-w-[180px]">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="flex items-start gap-2.5 cursor-pointer group">
                      <div onClick={() => setAgreed(v => !v)}
                        className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${agreed ? 'bg-violet-600 border-violet-600' : 'border-gray-300 group-hover:border-violet-400'}`}>
                        {agreed && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4.5l3 3 6-7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                      <span className="text-sm text-gray-600">
                        I agree to <a href="#" className="text-violet-600 font-semibold hover:underline">Terms</a> &amp; <a href="#" className="text-violet-600 font-semibold hover:underline">Privacy Policy</a>
                      </span>
                    </label>
                    <AnimatePresence>
                      {errs.agreed && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="text-xs text-red-500 mt-1.5">⚠ {errs.agreed}</motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className={`flex gap-3 mt-5 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
              {step > 1 && (
                <motion.button type="button" onClick={goPrev}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-300 transition-all">
                  ← Back
                </motion.button>
              )}
              {step < 3 ? (
                <motion.button type="button" onClick={goNext}
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 20px rgba(124,58,237,0.35)' }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#10B981)' }}>
                  Continue → <span className="text-xs opacity-70">Step {step + 1}/3</span>
                </motion.button>
              ) : (
                <motion.button type="button" onClick={submit} disabled={busy || loading}
                  whileHover={{ scale: busy ? 1 : 1.02, boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-70 transition-all flex items-center justify-center gap-2 shadow-md"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#10B981)' }}>
                  {busy ? (
                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>Creating…</>
                  ) : '🚀 Start My Journey'}
                </motion.button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── Right: Branding ─────────────────────────────────────────── */}
      <BrandingPanel />
    </div>
  );
}
