import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/index.js';
import ExpenslyLogo from '../../components/ExpenslyLogo.jsx';
import { walletAPI, userAPI } from '../../api/index.js';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';


const CURRENCIES = [
    { code: 'INR', symbol: '₹', label: '₹ Indian Rupee', flag: '🇮🇳' },
    { code: 'USD', symbol: '$', label: '$ US Dollar', flag: '🇺🇸' },
    { code: 'EUR', symbol: '€', label: '€ Euro', flag: '🇪🇺' },
    { code: 'GBP', symbol: '£', label: '£ British Pound', flag: '🇬🇧' },
    { code: 'AED', symbol: 'د.إ', label: 'د.إ UAE Dirham', flag: '🇦🇪' },
];

const W_ICONS = ['💵', '💳', '🏦', '💰', '📱', '🏠', '💎', '🎯'];
const W_TYPES = ['bank', 'cash', 'credit', 'savings', 'investment'];

const STEPS = [
    { num: 1, label: 'Your Name', icon: '👤' },
    { num: 2, label: 'Wallet', icon: '💳' },
    { num: 3, label: 'Preferences', icon: '⚙️' },
];

function StepBar({ cur }) {
    return (
        <div className="flex items-center gap-0 mb-8">
          <Helmet>
            <title>Getting Started — Expensly</title>
            <meta name="description" content="Set up your Expensly account with your first wallet and preferences." />
          </Helmet>
            {STEPS.map((s, i) => (
                <React.Fragment key={s.num}>
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-sm"
                            style={{ background: cur >= s.num ? 'linear-gradient(135deg,#2563EB,#10B981)' : '#e5e7eb' }}>
                            {cur > s.num
                                ? <span className="text-white text-xs font-bold">✓</span>
                                : <span className={cur === s.num ? 'text-white' : 'text-gray-400'}>{s.icon}</span>}
                        </div>
                        <span className={`text-[10px] font-semibold ${cur === s.num ? 'text-blue-600' : cur > s.num ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {s.label}
                        </span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div className="flex-1 h-0.5 mb-4 mx-1 rounded-full bg-gray-200 overflow-hidden">
                            <motion.div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500"
                                initial={{ width: 0 }}
                                animate={{ width: cur > s.num ? '100%' : '0%' }}
                                transition={{ duration: 0.4 }} />
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

function Field({ label, value, onChange, placeholder, type = 'text', error }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
            <input type={type} value={value} onChange={onChange} placeholder={placeholder}
                className={`w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-all bg-white text-gray-900 placeholder-gray-400
          ${error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`} />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

export default function OnboardingPage() {
    const navigate = useNavigate();
    const user = useAuthStore(s => s.user);

    const [step, setStep] = useState(1);
    const [dir, setDir] = useState(1);
    const [busy, setBusy] = useState(false);
    const [errs, setErrs] = useState({});

    const [name, setName] = useState(user?.name || '');
    const [pwd, setPwd] = useState('');
    const [cpwd, setCpwd] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [skipPwd, setSkipPwd] = useState(false);
    const [wName, setWName] = useState('My Wallet');
    const [wType, setWType] = useState('bank');
    const [wBal, setWBal] = useState('');
    const [wIcon, setWIcon] = useState('🏦');
    const [cur, setCur] = useState('INR');
    const [theme, setTheme] = useState('light');

    const goNext = () => {
        const e = {};
        if (step === 1) {
            if (!name.trim() || name.trim().length < 2) e.name = 'Please enter your full name';
            if (!skipPwd && pwd) {
                if (pwd.length < 8) e.pwd = 'Min 8 characters';
                if (cpwd !== pwd) e.cpwd = 'Passwords do not match';
            }
        }
        if (step === 2 && !wName.trim()) e.wName = 'Wallet name is required';
        if (Object.keys(e).length) { setErrs(e); return; }
        setErrs({});
        setDir(1);
        setStep(s => s + 1);
    };

    const goPrev = () => { setDir(-1); setStep(s => s - 1); };

    const finish = async () => {
        setBusy(true);
        try {
            const currency = CURRENCIES.find(x => x.code === cur) || CURRENCIES[0];
            const updateData = {
                name: name.trim(),
                currency: currency.code,
                currencySymbol: currency.symbol,
                theme,
            };
            // If user set a password, update it
            if (!skipPwd && pwd && pwd.length >= 8) {
                updateData.newPassword = pwd;
            }
            await userAPI.updateMe(updateData);
            await walletAPI.create({
                name: wName.trim(),
                type: wType,
                balance: parseFloat(wBal) || 0,
                icon: wIcon,
                color: '#48bb78',
            });
            const res = await userAPI.getMe();
            if (res.data?.data) useAuthStore.setState({ user: res.data.data });
            toast.success(`All set, ${name.split(' ')[0]}! Welcome to Expensly 🎉`);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    const sv = {
        enter: d => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
        center: { opacity: 1, x: 0 },
        exit: d => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center px-4 py-8">
            <motion.div className="fixed top-1/4 right-1/4 w-72 h-72 rounded-full bg-blue-400/10 blur-3xl pointer-events-none"
                animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 7, repeat: Infinity }} />
            <motion.div className="fixed bottom-1/4 left-1/4 w-56 h-56 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none"
                animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 9, repeat: Infinity, delay: 2 }} />

            <div className="w-full max-w-lg">
                <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">

                    {/* Top gradient bar */}
                    <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500" />

                    <div className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <ExpenslyLogo showText textClassName="text-xl" />
                            <span className="text-xs text-gray-400 font-medium bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
                                Step {step} of 3
                            </span>
                        </div>

                        <StepBar cur={step} />

                        <AnimatePresence mode="wait" custom={dir}>

                            {/* ── Step 1: Confirm Name ──────────────────────────────── */}
                            {step === 1 && (
                                <motion.div key="s1" custom={dir} variants={sv} initial="enter" animate="center" exit="exit"
                                    transition={{ duration: 0.3 }}>
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-extrabold text-gray-900">Hey there! 👋</h2>
                                        <p className="text-gray-500 text-sm mt-1">You signed in with Google — let's confirm your name.</p>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100 mb-6">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                            {(user?.name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{user?.name || 'Google User'}</p>
                                            <p className="text-xs text-gray-500">{user?.email || ''}</p>
                                        </div>
                                        <div className="ml-auto text-xs text-emerald-600 font-semibold flex items-center gap-1">
                                            ✓ Verified
                                        </div>
                                    </div>
                                    <Field label="Your Full Name" value={name} onChange={e => setName(e.target.value)}
                                        placeholder="e.g. Rahul Sharma" error={errs.name} />

                                    {/* Optional password setup */}
                                    <div className="border-t border-gray-100 pt-4 mt-2">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700">Set a Password <span className="text-gray-400 font-normal">(Optional)</span></p>
                                                <p className="text-xs text-gray-400 mt-0.5">Lets you also log in with email + password</p>
                                            </div>
                                            <button type="button" onClick={() => setSkipPwd(v => !v)}
                                                className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${skipPwd ? 'border-gray-200 text-gray-400' : 'border-blue-200 text-blue-600 bg-blue-50'}`}>
                                                {skipPwd ? 'Add password' : 'Skip for now'}
                                            </button>
                                        </div>
                                        {!skipPwd && (
                                            <div className="space-y-3">
                                                <div className="relative">
                                                    <input type={showPwd ? 'text' : 'password'} value={pwd}
                                                        onChange={e => setPwd(e.target.value)}
                                                        placeholder="Min 8 characters"
                                                        className={`w-full px-4 py-3 pr-10 rounded-xl border-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all ${errs.pwd ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'}`} />
                                                    <button type="button" onClick={() => setShowPwd(v => !v)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                        {showPwd ? '🙈' : '👁️'}
                                                    </button>
                                                    {errs.pwd && <p className="text-xs text-red-500 mt-1">{errs.pwd}</p>}
                                                </div>
                                                <input type={showPwd ? 'text' : 'password'} value={cpwd}
                                                    onChange={e => setCpwd(e.target.value)}
                                                    placeholder="Confirm password"
                                                    className={`w-full px-4 py-3 rounded-xl border-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all ${errs.cpwd ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'}`} />
                                                {errs.cpwd && <p className="text-xs text-red-500 mt-1">{errs.cpwd}</p>}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400">Name and email can be changed anytime in Settings.</p>
                                </motion.div>
                            )}

                            {/* ── Step 2: Wallet Setup ─────────────────────────────── */}
                            {step === 2 && (
                                <motion.div key="s2" custom={dir} variants={sv} initial="enter" animate="center" exit="exit"
                                    transition={{ duration: 0.3 }} className="space-y-4">
                                    <div className="mb-2">
                                        <h2 className="text-2xl font-extrabold text-gray-900">Set up your wallet 💳</h2>
                                        <p className="text-gray-500 text-sm mt-1">Add your first wallet — you can add more anytime.</p>
                                    </div>
                                    <Field label="Wallet Name" value={wName} onChange={e => setWName(e.target.value)}
                                        placeholder="e.g. SBI Savings, HDFC, Cash" error={errs.wName} />
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Icon</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {W_ICONS.map(ic => (
                                                <motion.button key={ic} type="button" onClick={() => setWIcon(ic)}
                                                    whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.95 }}
                                                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${wIcon === ic ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                                                    {ic}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Wallet Type</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {W_TYPES.map(t => (
                                                <button key={t} type="button" onClick={() => setWType(t)}
                                                    className={`py-2.5 rounded-xl text-xs font-semibold border-2 capitalize transition-all ${wType === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <Field label="Opening Balance (optional)" type="number" inputMode="decimal" value={wBal}
                                        onChange={e => setWBal(e.target.value)} placeholder="0" />
                                </motion.div>
                            )}

                            {/* ── Step 3: Preferences ──────────────────────────────── */}
                            {step === 3 && (
                                <motion.div key="s3" custom={dir} variants={sv} initial="enter" animate="center" exit="exit"
                                    transition={{ duration: 0.3 }} className="space-y-5">
                                    <div className="mb-2">
                                        <h2 className="text-2xl font-extrabold text-gray-900">Almost done! ⚙️</h2>
                                        <p className="text-gray-500 text-sm mt-1">Set your currency and preferred theme.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
                                        <div className="space-y-2">
                                            {CURRENCIES.map(cc => (
                                                <button key={cc.code} type="button" onClick={() => setCur(cc.code)}
                                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm transition-all ${cur === cc.code ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                                    <span className="flex items-center gap-2.5">
                                                        <span className="text-base">{cc.flag}</span>
                                                        <span>{cc.label}</span>
                                                    </span>
                                                    {cur === cc.code && <span className="text-blue-500 font-bold">✓</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">App Theme</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[{ val: 'light', label: 'Light', icon: '☀️' }, { val: 'dark', label: 'Dark', icon: '🌙' }, { val: 'system', label: 'System', icon: '💻' }].map(t => (
                                                <button key={t.val} type="button" onClick={() => setTheme(t.val)}
                                                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${theme === t.val ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                                    <span className="text-xl">{t.icon}</span>
                                                    <span className="text-xs font-semibold">{t.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Buttons */}
                        <div className="flex gap-3 mt-8">
                            {step > 1 && (
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={goPrev}
                                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 transition-all">
                                    ← Back
                                </motion.button>
                            )}
                            {step < 3 ? (
                                <motion.button whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }} whileTap={{ scale: 0.98 }}
                                    onClick={goNext}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white text-sm font-bold shadow-md">
                                    Continue →
                                </motion.button>
                            ) : (
                                <motion.button whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }} whileTap={{ scale: 0.98 }}
                                    onClick={finish} disabled={busy}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white text-sm font-bold shadow-md disabled:opacity-70 flex items-center justify-center gap-2">
                                    {busy
                                        ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Setting up…</>
                                        : <>🚀 Launch Expensly!</>}
                                </motion.button>
                            )}
                        </div>
                    </div>
                </motion.div>
                <p className="text-center text-xs text-gray-400 mt-4">
                    You can change all settings anytime from your profile.
                </p>
            </div>
        </div>
    );
}