import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState('email'); // 'email' | 'sent'
    const [email, setEmail] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }
        setBusy(true);
        try {
            const res = await authAPI.forgotPassword({ email: email.trim().toLowerCase() });
            if (res.data.success) {
                if (res.data.emailSent) {
                    // Email was sent — show confirmation screen
                    setStep('sent');
                    toast.success('Reset link sent to your email!');
                } else if (res.data.token) {
                    // Dev mode — no email configured, redirect directly
                    toast.success('Redirecting to reset page…');
                    navigate(`/reset-password?token=${res.data.token}`);
                } else {
                    setStep('sent');
                }
            }
        } catch (err) {
            console.error('Forgot password error:', err);
            const msg = err.response?.data?.message
                || err.message
                || 'Cannot reach server. Make sure server is running on port 5000.';
            setError(msg);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center px-4">
          <Helmet>
            <title>Reset Password — Expensly</title>
            <meta name="description" content="Reset your Expensly account password via email." />
          </Helmet>
            <motion.div className="fixed top-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl pointer-events-none"
                animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 7, repeat: Infinity }} />

            <div className="w-full max-w-md">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">

                    <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500" />

                    <div className="p-8">
                        <div className="mb-7">
                            <Logo />
                        </div>

                        <AnimatePresence mode="wait">
                            {step === 'email' && (
                                <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>

                                    <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Forgot password? 🔑</h2>
                                    <p className="text-gray-500 text-sm mb-6">
                                        Enter your registered email and we'll send you a reset link.
                                    </p>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={e => { setEmail(e.target.value); setError(''); }}
                                                placeholder="you@example.com"
                                                autoFocus
                                                className={`w-full px-4 py-3 rounded-xl border-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all
                          ${error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                                            />
                                            {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
                                        </div>

                                        <motion.button
                                            type="submit"
                                            disabled={busy}
                                            whileHover={{ scale: busy ? 1 : 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                        >
                                            {busy
                                                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending…</>
                                                : 'Send Reset Link →'}
                                        </motion.button>
                                    </form>

                                    <p className="text-center text-sm text-gray-500 mt-6">
                                        Remember your password?{' '}
                                        <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign In</Link>
                                    </p>
                                </motion.div>
                            )}

                            {step === 'sent' && (
                                <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4 }} className="text-center">

                                    <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-4xl">
                                        📧
                                    </div>

                                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Check your email!</h2>
                                    <p className="text-gray-500 text-sm mb-2">
                                        We sent a password reset link to:
                                    </p>
                                    <p className="text-blue-600 font-semibold text-sm mb-6 bg-blue-50 px-4 py-2 rounded-xl">
                                        {email}
                                    </p>

                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
                                        <p className="text-xs text-amber-700 font-semibold mb-1">📌 Not seeing the email?</p>
                                        <ul className="text-xs text-amber-600 space-y-1 list-disc list-inside">
                                            <li>Check your spam/junk folder</li>
                                            <li>Make sure you entered the right email</li>
                                            <li>The link expires in 1 hour</li>
                                        </ul>
                                    </div>

                                    <button onClick={() => setStep('email')}
                                        className="w-full py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all mb-3">
                                        Try a different email
                                    </button>

                                    <Link to="/login"
                                        className="block text-center text-sm text-blue-600 font-semibold hover:underline">
                                        ← Back to Sign In
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}