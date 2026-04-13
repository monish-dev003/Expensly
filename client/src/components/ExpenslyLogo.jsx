import React, { useId } from 'react';

/**
 * Shared Expensly logo — matches the login/register page design exactly.
 * Uses React.useId() so each instance gets a unique SVG gradient ID,
 * preventing colour bleed when multiple logos appear on the same page.
 *
 * Usage:
 *   <ExpenslyLogo size={34} />
 *   <ExpenslyLogo size={32} showText />
 */
export default function ExpenslyLogo({ size = 36, showText = false, textClassName = '' }) {
  const uid = useId().replace(/:/g, '');
  const gid = `elg_${uid}`;

  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg
        width={size} height={size} viewBox="0 0 40 40" fill="none"
        aria-label="Expensly" role="img"
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#2563EB" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="19" stroke={`url(#${gid})`} strokeWidth="2" />
        <circle cx="20" cy="20" r="14" fill={`url(#${gid})`} opacity="0.12" />
        <text
          x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
          fill={`url(#${gid})`} fontSize="17" fontWeight="800"
          fontFamily="system-ui,sans-serif"
        >₹</text>
        <rect x="10" y="29" width="3" height="4" rx="1" fill="#10B981" opacity="0.7" />
        <rect x="15" y="27" width="3" height="6" rx="1" fill="#10B981" opacity="0.85" />
        <rect x="20" y="25" width="3" height="8" rx="1" fill="#10B981" />
        <rect x="25" y="28" width="3" height="5" rx="1" fill="#10B981" opacity="0.7" />
      </svg>

      {showText && (
        <span className={
          `font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent ${textClassName}`
        }>
          Expensly
        </span>
      )}
    </div>
  );
}
