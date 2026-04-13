// ── Consistent theme key used throughout the entire app ──────────────────────
const THEME_KEY = 'expensly-theme';

export const applyTheme = (theme) => {
  localStorage.setItem(THEME_KEY, theme);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (theme === 'dark' || (theme === 'system' && prefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const getTheme = () => localStorage.getItem(THEME_KEY) || 'system';

export const toggleTheme = () => {
  const current = getTheme();
  const next = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
  applyTheme(next);
  return next;
};

// Keep old names as aliases for backward compatibility
export const setTheme  = applyTheme;
export const loadTheme = () => applyTheme(getTheme());
