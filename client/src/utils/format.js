/**
 * utils/format.js
 * Single source of truth for all number/date formatting helpers.
 * Previously every page file redefined its own `fmt` function — this fixes that.
 */

/**
 * Format a number as a currency string.
 * fmt(1234567, '₹')  → "₹12,34,567"   (Indian locale)
 * fmt(-500, '$')     → "$500"          (abs value, sign handled by caller)
 */
export const fmt = (n, sym = '₹') =>
  `${sym}${Math.abs(Number(n) || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

/**
 * Full precision currency (2 decimal places).
 * fmtFull(1234.5, '₹')  → "₹1,234.50"
 */
export const fmtFull = (n, sym = '₹') =>
  `${sym}${Math.abs(Number(n) || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/**
 * Compact format — uses k/L/Cr suffixes for large numbers.
 * fmtCompact(125000, '₹') → "₹1.25L"
 * fmtCompact(10000000, '₹') → "₹1Cr"
 */
export const fmtCompact = (n, sym = '₹') => {
  const v = Math.abs(Number(n) || 0);
  if (v >= 10_000_000) return `${sym}${(v / 10_000_000).toFixed(1)}Cr`;
  if (v >= 100_000)    return `${sym}${(v / 100_000).toFixed(1)}L`;
  if (v >= 1_000)      return `${sym}${(v / 1_000).toFixed(1)}k`;
  return fmt(n, sym);
};

/**
 * Percentage — clamps between 0 and 100.
 * pct(35, 100) → 35
 * pct(120, 100) → 100
 */
export const pct = (a, b) =>
  b === 0 ? 0 : Math.min(100, Math.max(0, Math.round((a / b) * 100)));

/**
 * Today's date as ISO string YYYY-MM-DD.
 */
export const todayISO = () => new Date().toISOString().slice(0, 10);

/**
 * Format a date string/object for display.
 * dateLabel(new Date())           → "Today"
 * dateLabel(yesterday)            → "Yesterday"
 * dateLabel('2024-03-15')         → "15 Mar 2024"
 */
export const dateLabel = (d) => {
  const date = new Date(d);
  const now   = new Date();
  const yday  = new Date(now); yday.setDate(now.getDate() - 1);
  if (date.toDateString() === now.toDateString())  return 'Today';
  if (date.toDateString() === yday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/**
 * Short date: "15 Mar"
 */
export const shortDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
