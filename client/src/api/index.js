import axios from 'axios';

// @ts-ignore
// @ts-ignore
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE });

// ── Request interceptor: attach token ─────────────────────────────────────────
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: handle 401 ─────────────────────────────────────────
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;

    // Skip retry for auth endpoints to avoid infinite loops
    const isAuthEndpoint = original?.url?.includes('/auth/');

    if (err.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
        const newAccess = data.data.accessToken;
        const newRefresh = data.data.refreshToken;

        localStorage.setItem('accessToken', newAccess);
        localStorage.setItem('refreshToken', newRefresh);
        original.headers.Authorization = `Bearer ${newAccess}`;

        return api(original);
      } catch (_) {
        // CRITICAL FIX: clear BOTH localStorage AND Zustand persist store
        // Without clearing 'expensly-auth', Zustand rehydrates with stale user
        // and RequireAuth keeps redirecting back — user gets stuck in a loop
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('expensly-auth');  // ← THIS was the missing fix
        localStorage.removeItem('expensly-pin');
        window.location.href = '/login';
      }
    }

    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: d => api.post('/auth/register', d),
  login: d => api.post('/auth/login', d),
  firebaseAuth: d => api.post('/auth/firebase', d),
  logout: () => api.post('/auth/logout'),
  setPin: d => api.put('/auth/pin', d),
  disablePin: d => api.delete('/auth/pin', { data: d }),
  verifyPin: d => api.post('/auth/verify-pin', d),
  changePassword: d => api.post('/auth/change-password', d),
  forgotPassword: d => api.post('/auth/forgot-password', d),
  resetPassword: d => api.post('/auth/reset-password', d),
  resetPin: d => api.post('/auth/reset-pin', d),
  refreshToken: d => api.post('/auth/refresh', d),
};

// ── User ──────────────────────────────────────────────────────────────────────
export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: d => api.put('/users/me', d),
  uploadAvatar: f => {
    const fd = new FormData();
    fd.append('avatar', f);
    return api.post('/users/me/avatar', fd);
  },
};

// ── Wallets ───────────────────────────────────────────────────────────────────
export const walletAPI = {
  getAll: () => api.get('/wallets'),
  create: d => api.post('/wallets', d),
  update: (id, d) => api.put(`/wallets/${id}`, d),
  remove: id => api.delete(`/wallets/${id}`),
};

// ── Categories ────────────────────────────────────────────────────────────────
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  create: d => api.post('/categories', d),
  update: (id, d) => api.put(`/categories/${id}`, d),
  remove: id => api.delete(`/categories/${id}`),
};

// ── Transactions ──────────────────────────────────────────────────────────────
export const transactionAPI = {
  getAll: p => api.get('/transactions', { params: p }),
  getOne: id => api.get(`/transactions/${id}`),
  create: d => api.post('/transactions', d),
  update: (id, d) => api.put(`/transactions/${id}`, d),
  remove: id => api.delete(`/transactions/${id}`),
  uploadReceipt: (id, f) => {
    const fd = new FormData();
    fd.append('receipt', f);
    return api.post(`/transactions/${id}/receipt`, fd);
  },
  export: p => api.get('/transactions/export', { params: p, responseType: 'blob' }),
};

// ── Budgets ───────────────────────────────────────────────────────────────────
export const budgetAPI = {
  getAll: () => api.get('/budgets'),
  create: d => api.post('/budgets', d),
  update: (id, d) => api.put(`/budgets/${id}`, d),
  remove: id => api.delete(`/budgets/${id}`),
};

// ── Goals ─────────────────────────────────────────────────────────────────────
export const goalAPI = {
  getAll: () => api.get('/goals'),
  create: d => api.post('/goals', d),
  update: (id, d) => api.put(`/goals/${id}`, d),
  remove: id => api.delete(`/goals/${id}`),
};

// ── Debts ─────────────────────────────────────────────────────────────────────
export const debtAPI = {
  getAll: p => api.get('/debts', { params: p }),
  create: d => api.post('/debts', d),
  update: (id, d) => api.put(`/debts/${id}`, d),
  remove: id => api.delete(`/debts/${id}`),
};

// ── Stats ─────────────────────────────────────────────────────────────────────
export const statsAPI = {
  getSummary: p => api.get('/stats/summary', { params: p }),
  getByCategory: p => api.get('/stats/by-category', { params: p }),
  getTrend: p => api.get('/stats/trend', { params: p }),
  getCalendar: p => api.get('/stats/calendar', { params: p }),
};


// ── Recurring Transactions ────────────────────────────────────────────────────
export const recurringAPI = {
  getAll:  ()        => api.get('/recurring'),
  create:  d         => api.post('/recurring', d),
  update:  (id, d)   => api.put(`/recurring/${id}`, d),
  remove:  id        => api.delete(`/recurring/${id}`),
  toggle:  id        => api.patch(`/recurring/${id}/toggle`),
};

// ── AI ────────────────────────────────────────────────────────────────────────

export default api;