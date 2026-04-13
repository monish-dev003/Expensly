import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../../api/index.js';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const Logo = () => (
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

const EYE = <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const EYE_OFF = <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>;

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const token = params.get('token');

    const [pwd, setPwd] = useState('');
    const [cpwd, setCpwd] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!token) {
            toast.error('Invalid reset link.');
            navigate('/forgot-password');
        }
    }, [token]);

    const getStrength = (p) => {
        let s = 0;
        if (p.length >= 8) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;
        return s;
    };
    const str = getStrength(pwd);
    const strColors = ['bg-red-400', 'bg-red-400', 'bg-yellow-400', 'bg-emerald-400', 'bg-emerald-500'];
    const strLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        const e2 = {};
        if (!pwd || pwd.length < 8) e2.pwd = 'Minimum 8 characters';
        if (pwd !== cpwd) e2.cpwd = 'Passwords do not match';
        if (Object.keys(e2).length) { setErrors(e2); return; }
        setErrors({});
        setBusy(true);
        try {
            await authAPI.resetPassword({ token, newPassword: pwd });
            setDone(true);
            toast.success('Password reset successfully!');
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Link expired. Please request a new one.');
        } finally {
            setBusy(false);
        }
    };

    if (done) return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center px-4">
          <Helmet>
            <title>New Password — Expensly</title>
            <meta name="description" content="Create a new secure password for your Expensly account." />
          </Helmet>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 max-w-md w-full text-center">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Password Reset!</h2>
                <p className="text-gray-500 text-sm mb-6">Redirecting you to login…</p>
                <Link to="/login" className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white text-sm font-bold shadow-md inline-block">
                    Go to Login →
                </Link>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center px-4">
            <motion.div className="fixed top-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl pointer-events-none"
                animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 7, repeat: Infinity }} />

            <div className="w-full max-w-md">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">

                    <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500" />

                    <div className="p-8">
                        <div className="mb-6"><Logo /></div>

                        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Set new password 🔐</h2>
                        <p className="text-gray-500 text-sm mb-6">Choose a strong password for your Expensly account.</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                                <div className="relative">
                                    <input type={showPwd ? 'text' : 'password'} value={pwd}
                                        onChange={e => { setPwd(e.target.value); setErrors(p => ({ ...p, pwd: '' })); }}
                                        placeholder="Min 8 characters" autoFocus
                                        className={`w-full px-4 py-3 pr-11 rounded-xl border-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all
                      ${errors.pwd ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`} />
                                    <button type="button" onClick={() => setShowPwd(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPwd ? EYE_OFF : EYE}
                                    </button>
                                </div>
                                {pwd && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 mb-1">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= str ? strColors[str] : 'bg-gray-200'}`} />
                                            ))}
                                        </div>
                                        <p className="text-[11px] font-semibold text-gray-500">{strLabels[str]}</p>
                                    </div>
                                )}
                                {errors.pwd && <p className="text-xs text-red-500 mt-1">{errors.pwd}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                                <input type={showPwd ? 'text' : 'password'} value={cpwd}
                                    onChange={e => { setCpwd(e.target.value); setErrors(p => ({ ...p, cpwd: '' })); }}
                                    placeholder="Re-enter password"
                                    className={`w-full px-4 py-3 rounded-xl border-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all
                    ${errors.cpwd ? 'border-red-400 focus:border-red-500' : cpwd && cpwd === pwd ? 'border-emerald-400' : 'border-gray-200 focus:border-blue-500'}`} />
                                {errors.cpwd && <p className="text-xs text-red-500 mt-1">{errors.cpwd}</p>}
                                {cpwd && cpwd === pwd && !errors.cpwd && (
                                    <p className="text-xs text-emerald-600 font-semibold mt-1">✓ Passwords match</p>
                                )}
                            </div>

                            <motion.button type="submit" disabled={busy}
                                whileHover={{ scale: busy ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                                {busy
                                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Resetting…</>
                                    : 'Reset Password →'}
                            </motion.button>
                        </form>

                        <p className="text-center text-sm text-gray-500 mt-6">
                            <Link to="/login" className="text-blue-600 font-semibold hover:underline">← Back to Sign In</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}