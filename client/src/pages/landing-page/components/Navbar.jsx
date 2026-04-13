import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../../store/index.js';

const SECTIONS = [
    { id: 'hero', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'benefits', label: 'Benefits' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'cta', label: 'Get Started' },
];

const Logo = () => (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="19" stroke="url(#lg)" strokeWidth="2" />
        <circle cx="20" cy="20" r="14" fill="url(#lg)" opacity="0.12" />
        <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
            fill="url(#lg)" fontSize="17" fontWeight="800" fontFamily="system-ui">₹</text>
        <rect x="10" y="29" width="3" height="4" rx="1" fill="url(#lg)" opacity="0.7" />
        <rect x="15" y="27" width="3" height="6" rx="1" fill="url(#lg)" opacity="0.85" />
        <rect x="20" y="25" width="3" height="8" rx="1" fill="url(#lg)" />
        <rect x="25" y="28" width="3" height="5" rx="1" fill="url(#lg)" opacity="0.7" />
        <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
        </defs>
    </svg>
);

export default function Navbar({ activeSection = 'hero', onSectionChange }) {
    const navigate = useNavigate();
    const user = useAuthStore(s => s.user);
    const [menuOpen, setMenuOpen] = useState(false);

    const go = (id) => {
        onSectionChange?.(id);
        setMenuOpen(false);
    };

    return (
        <nav className="flex-shrink-0 w-full bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-50">
            <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center relative">

                {/* ── LEFT: Logo + Name ───────────────────────────────────────────── */}
                <div
                    className="flex items-center gap-2.5 cursor-pointer select-none flex-shrink-0"
                    onClick={() => go('hero')}
                >
                    <Logo />
                    <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent tracking-tight">
                        Expensly
                    </span>
                </div>

                {/* ── CENTER: Section tabs (absolutely centered in full navbar width) ── */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center bg-gray-100 dark:bg-gray-800/60 rounded-full p-1 gap-0.5">
                    {SECTIONS.map(s => (
                        <button
                            key={s.id}
                            onClick={() => go(s.id)}
                            className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 whitespace-nowrap ${activeSection === s.id
                                    ? 'text-white'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                                }`}
                        >
                            {activeSection === s.id && (
                                <motion.div
                                    layoutId="navPill"
                                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"
                                    transition={{ type: 'spring', stiffness: 400, damping: 36 }}
                                />
                            )}
                            <span className="relative z-10">{s.label}</span>
                        </button>
                    ))}
                </div>

                {/* ── RIGHT: Auth buttons ─────────────────────────────────────────── */}
                <div className="hidden md:flex items-center gap-2 ml-auto flex-shrink-0">
                    {user ? (
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate('/dashboard')}
                            className="px-5 py-2 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 shadow-md hover:shadow-lg transition-all"
                        >
                            Go to Dashboard →
                        </motion.button>
                    ) : (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate('/login')}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                Sign In
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate('/register')}
                                className="px-5 py-2 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 shadow-md hover:shadow-lg transition-all"
                            >
                                Get Started Free
                            </motion.button>
                        </>
                    )}
                </div>

                {/* ── MOBILE: Hamburger ───────────────────────────────────────────── */}
                <button
                    className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-auto"
                    onClick={() => setMenuOpen(v => !v)}
                    aria-label="Menu"
                >
                    <span className="block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 mb-1.5 transition-all"
                        style={{ transform: menuOpen ? 'rotate(45deg) translate(3px,4px)' : '' }} />
                    <span className="block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 mb-1.5 transition-all"
                        style={{ opacity: menuOpen ? 0 : 1 }} />
                    <span className="block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all"
                        style={{ transform: menuOpen ? 'rotate(-45deg) translate(3px,-4px)' : '' }} />
                </button>
            </div>

            {/* ── MOBILE: Dropdown menu ────────────────────────────────────────── */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="md:hidden overflow-hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950"
                    >
                        <div className="px-4 py-3 space-y-1">
                            {SECTIONS.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => go(s.id)}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === s.id
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                            <div className="flex gap-2 pt-2">
                                {user ? (
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500"
                                    >
                                        Go to Dashboard →
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="flex-1 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                        >
                                            Sign In
                                        </button>
                                        <button
                                            onClick={() => navigate('/register')}
                                            className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500"
                                        >
                                            Get Started
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}