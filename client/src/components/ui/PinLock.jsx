import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore, usePinStore } from '../../store/index.js';
import { authAPI } from '../../api/index.js';
import Icon from '../AppIcon';

export default function PinLock() {
  const user           = useAuthStore(s => s.user);
  const logout         = useAuthStore(s => s.logout);
  const pinEnabled     = usePinStore(s => s.pinEnabled);
  const isLocked       = usePinStore(s => s.isLocked);
  const unlock         = usePinStore(s => s.unlock);
  const recordFailed   = usePinStore(s => s.recordFailedAttempt);
  const lockedUntil    = usePinStore(s => s.lockedUntil);

  const [pin, setPin]             = useState(['', '', '', '']);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [shake, setShake]         = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const inputRefs                 = useRef([]);

  const show = user && pinEnabled && isLocked;

  useEffect(() => {
    if (show) {
      setPin(['', '', '', '']);
      setError('');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [show]);

  // Countdown for locked state
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    if (!lockedUntil) return;
    const id = setInterval(() => {
      const remaining = Math.max(0, lockedUntil - Date.now());
      if (remaining === 0) { setCountdown(''); clearInterval(id); return; }
      const secs = Math.ceil(remaining / 1000);
      const mins = Math.floor(secs / 60);
      setCountdown(mins > 0 ? `${mins}m ${secs % 60}s` : `${secs}s`);
    }, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const handleDigit = (digit) => {
    const idx = pin.findIndex(d => d === '');
    if (idx === -1) return;
    const next = [...pin];
    next[idx] = digit;
    setPin(next);
    setError('');
    if (next.every(d => d !== '')) {
      submitPin(next.join(''));
    } else {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleBackspace = () => {
    const lastFilled = [...pin].reverse().findIndex(d => d !== '');
    if (lastFilled === -1) return;
    const idx = 3 - lastFilled;
    const next = [...pin];
    next[idx] = '';
    setPin(next);
    inputRefs.current[idx]?.focus();
  };

  const submitPin = async (pinStr) => {
    if (lockedUntil && Date.now() < lockedUntil) {
      setError(`Too many attempts. Wait ${countdown}`);
      setPin(['', '', '', '']);
      return;
    }
    setLoading(true);
    try {
      await authAPI.verifyPin({ pin: pinStr });
      unlock();
    } catch (_) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      recordFailed();
      setPin(['', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally { setLoading(false); }
  };

  if (!show) return null;

  const isThrottled = lockedUntil && Date.now() < lockedUntil;
  const sym = user?.currencySymbol || '₹';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center w-full max-w-xs px-6">

        {/* Logo */}
        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-financial-lg mb-6">
          <Icon name="DollarSign" size={30} className="text-primary-foreground" />
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-1">App Locked</h2>
        <p className="text-sm text-muted-foreground mb-8 text-center">
          Enter your 4-digit PIN to continue
        </p>

        {/* PIN dots */}
        <div className={`flex space-x-4 mb-6 ${shake ? 'animate-shake' : ''}`}>
          {pin.map((d, i) => (
            <div
              key={i}
              ref={el => inputRefs.current[i] = el}
              className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-150 ${
                d ? 'border-primary bg-primary/10' : 'border-border bg-muted'
              }`}
            >
              {d ? <div className="w-3 h-3 rounded-full bg-primary" /> : null}
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-error mb-4 text-center">{error}</p>}
        {isThrottled && <p className="text-sm text-warning mb-4 text-center">Locked for {countdown}</p>}

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-3 w-full mb-6">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button
              key={n}
              onClick={() => !isThrottled && !loading && handleDigit(String(n))}
              disabled={isThrottled || loading}
              className="h-14 rounded-xl bg-card border border-border text-xl font-semibold text-foreground hover:bg-muted active:scale-95 transition-all disabled:opacity-40"
            >
              {n}
            </button>
          ))}
          {/* Biometric placeholder / empty */}
          <div />
          <button
            onClick={() => !isThrottled && !loading && handleDigit('0')}
            disabled={isThrottled || loading}
            className="h-14 rounded-xl bg-card border border-border text-xl font-semibold text-foreground hover:bg-muted active:scale-95 transition-all disabled:opacity-40"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            disabled={loading}
            className="h-14 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 active:scale-95 transition-all flex items-center justify-center"
          >
            <Icon name="Delete" size={20} />
          </button>
        </div>

        {/* Forgot PIN */}
        <button
          onClick={() => setShowForgot(true)}
          className="text-sm text-primary hover:text-primary/80 transition-colors mb-4"
        >
          Forgot PIN?
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
        >
          <Icon name="LogOut" size={12} />
          <span>Sign out instead</span>
        </button>
      </div>

      {/* Forgot PIN modal */}
      {showForgot && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-financial-lg">
            <h3 className="text-lg font-semibold text-foreground mb-2">Forgot PIN?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              To reset your PIN, you will need to sign out and sign back in. Your data will be safe.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowForgot(false)}
                className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => { logout(); setShowForgot(false); }}
                className="flex-1 h-10 rounded-xl bg-error text-white text-sm font-medium hover:bg-error/90 transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}
