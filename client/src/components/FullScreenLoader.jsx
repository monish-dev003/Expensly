import React from 'react';

/**
 * FullScreenLoader — shown during initial bootstrap() API call.
 * Matches the branding from login/register pages.
 */
export default function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-5 bg-background">
      {/* Animated logo */}
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-2xl">
          <span className="text-white font-extrabold text-2xl">₹</span>
        </div>
        {/* Spinner ring */}
        <div
          className="absolute -inset-2 rounded-3xl border-2 border-blue-500/20 border-t-blue-500"
          style={{ animation: 'spin 0.9s linear infinite' }}
        />
      </div>

      <div className="text-center">
        <p className="text-lg font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
            Expensly
          </span>
        </p>
        <p className="text-xs text-muted-foreground mt-1" style={{ animation: 'pulse 2s infinite' }}>
          Loading your finances…
        </p>
      </div>

      {/* Skeleton bars */}
      <div className="mt-2 space-y-2.5 w-56">
        {[75, 55, 65].map((w, i) => (
          <div
            key={i}
            className="h-2.5 rounded-full bg-muted"
            style={{ width: `${w}%`, opacity: 1 - i * 0.2, animation: `pulse ${1.2 + i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}
