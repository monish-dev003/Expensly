import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import {
  authAPI, userAPI, walletAPI, categoryAPI, transactionAPI,
  budgetAPI, goalAPI, debtAPI, statsAPI,
} from '../api/index.js';

// ── Helper: get readable error message ───────────────────────────────────────
const getErrMsg = (err, fallback = 'Something went wrong.') => {
  if (!err.response) {
    // Network error — server not reachable
    return '⚠️ Cannot reach server. Make sure server is running on port 5000.';
  }
  const status = err.response.status;
  const msg = err.response?.data?.message;
  if (status === 401) return 'Session expired. Please log in again.';
  if (status === 403) return 'You do not have permission to do this.';
  if (status === 404) return 'Item not found.';
  if (status === 409) return msg || 'Already exists.';
  if (status === 422) return msg || 'Invalid data.';
  if (status >= 500) return msg || 'Server error. Check server terminal for details.';
  return msg || fallback;
};

// ── Auth Store ────────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false,

      register: async (data) => {
        set({ loading: true });
        try {
          const res = await authAPI.register(data);
          const { user, accessToken, refreshToken } = res.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          set({ user, accessToken, refreshToken, loading: false });
          toast.success('Welcome to Expensly! 🎉');
          return { success: true };
        } catch (err) {
          set({ loading: false });
          const msg = getErrMsg(err, 'Registration failed.');
          toast.error(msg);
          return { success: false, message: msg };
        }
      },

      login: async (data) => {
        set({ loading: true });
        try {
          const res = await authAPI.login(data);
          const { user, accessToken, refreshToken } = res.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          set({ user, accessToken, refreshToken, loading: false });
          toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`);
          return { success: true };
        } catch (err) {
          set({ loading: false });
          const msg = getErrMsg(err, 'Invalid email or password.');
          toast.error(msg);
          return { success: false, message: msg };
        }
      },

      loginWithFirebase: async (idToken) => {
        set({ loading: true });
        try {
          const res = await authAPI.firebaseAuth({ idToken });
          const { user, accessToken, refreshToken, isNewUser } = res.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          set({ user, accessToken, refreshToken, loading: false });
          if (isNewUser) {
            toast.success(`Welcome to Expensly, ${user.name.split(' ')[0]}! 🎉`);
          } else {
            toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`);
          }
          return { success: true, isNewUser };
        } catch (err) {
          set({ loading: false });
          const msg = getErrMsg(err, 'Firebase login failed.');
          toast.error(msg);
          return { success: false, message: msg };
        }
      },

      logout: async () => {
        try { await authAPI.logout(); } catch (_) { }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('expensly-auth');
        localStorage.removeItem('expensly-pin');
        set({ user: null, accessToken: null, refreshToken: null });
        // Clear all app data to prevent stale data showing for next user
        try { useAppStore.getState().reset(); } catch (_) {}
        toast.success('Logged out successfully.');
      },

      updateUser: (user) => set({ user }),
    }),
    {
      name: 'expensly-auth',
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken }),
    }
  )
);

// ── PIN / Screen Lock Store ───────────────────────────────────────────────────
export const usePinStore = create(
  persist(
    (set, get) => ({
      pinEnabled: false,
      autoLockMinutes: 5,
      lastActiveAt: Date.now(),
      isLocked: false,
      failedAttempts: 0,
      lockedUntil: null,

      touch: () => {
        const { isLocked } = get();
        if (!isLocked) set({ lastActiveAt: Date.now() });
      },

      checkAndLock: () => {
        const { pinEnabled, autoLockMinutes, lastActiveAt, isLocked, lockedUntil } = get();
        if (!pinEnabled || autoLockMinutes === 0) return;
        if (lockedUntil && Date.now() < lockedUntil) { set({ isLocked: true }); return; }
        if (!isLocked) {
          const idleMs = Date.now() - lastActiveAt;
          if (idleMs >= autoLockMinutes * 60 * 1000) set({ isLocked: true });
        }
      },

      unlock: () => set({ isLocked: false, lastActiveAt: Date.now(), failedAttempts: 0, lockedUntil: null }),

      recordFailedAttempt: () => {
        const { failedAttempts } = get();
        const next = failedAttempts + 1;
        if (next >= 5) {
          set({ failedAttempts: next, lockedUntil: Date.now() + 5 * 60 * 1000 });
          toast.error('Too many attempts. Locked for 5 minutes.');
        } else {
          set({ failedAttempts: next });
          toast.error(`Incorrect PIN. ${5 - next} attempts remaining.`);
        }
      },

      setPinEnabled: (v) => set({ pinEnabled: v }),
      setAutoLock: (m) => set({ autoLockMinutes: m }),
      lockNow: () => set({ isLocked: true }),
    }),
    {
      name: 'expensly-pin',
      partialize: (s) => ({
        pinEnabled: s.pinEnabled,
        autoLockMinutes: s.autoLockMinutes,
        lastActiveAt: s.lastActiveAt,
        lockedUntil: s.lockedUntil,
      }),
    }
  )
);

// ── App Data Store ────────────────────────────────────────────────────────────
export const useAppStore = create((set, get) => ({
  wallets: [],
  categories: [],
  transactions: [],
  budgets: [],
  goals: [],
  debts: [],
  stats: null,
  loading: {},

  setLoading: (key, val) => set(s => ({ loading: { ...s.loading, [key]: val } })),

  bootstrap: async () => {
    const {
      fetchWallets, fetchCategories, fetchTransactions,
      fetchBudgets, fetchGoals, fetchDebts,
    } = get();
    // Promise.allSettled ensures one failing fetch doesn't block others
    await Promise.allSettled([
      fetchWallets(),
      fetchCategories(),
      fetchTransactions({ limit: 200 }),
      fetchBudgets(),
      fetchGoals(),
      fetchDebts(),
    ]);
  },

  // ── Reset all app data (called on logout) ───────────────────────────────────
  reset: () => set({
    wallets: [], categories: [], transactions: [],
    budgets: [], goals: [], debts: [],
    stats: null, loading: {}, transactionPagination: null,
  }),

  // ── Wallets ───────────────────────────────────────────────────────────────
  fetchWallets: async () => {
    try {
      const r = await walletAPI.getAll();
      set({ wallets: r.data.data });
    } catch (err) {
      console.error('[fetchWallets]', getErrMsg(err));
    }
  },

  addWallet: async (data) => {
    try {
      const r = await walletAPI.create(data);
      set(s => ({ wallets: [...s.wallets, r.data.data] }));
      toast.success('Wallet created! ✓');
      return { success: true, data: r.data.data };
    } catch (err) {
      const msg = getErrMsg(err, 'Failed to create wallet.');
      toast.error(msg);
      return { success: false, message: msg };
    }
  },

  updateWallet: async (id, data) => {
    try {
      const r = await walletAPI.update(id, data);
      set(s => ({ wallets: s.wallets.map(w => w._id === id ? r.data.data : w) }));
      toast.success('Wallet updated! ✓');
      return { success: true };
    } catch (err) {
      const msg = getErrMsg(err, 'Failed to update wallet.');
      toast.error(msg);
      return { success: false, message: msg };
    }
  },

  removeWallet: async (id) => {
    try {
      await walletAPI.remove(id);
      set(s => ({ wallets: s.wallets.filter(w => w._id !== id) }));
      toast.success('Wallet removed.');
    } catch (err) {
      toast.error(getErrMsg(err, 'Failed to remove wallet.'));
    }
  },

  // ── Categories ────────────────────────────────────────────────────────────
  fetchCategories: async () => {
    try {
      const r = await categoryAPI.getAll();
      set({ categories: r.data.data });
    } catch (err) {
      console.error('[fetchCategories]', getErrMsg(err));
    }
  },

  addCategory: async (data) => {
    try {
      const r = await categoryAPI.create(data);
      set(s => ({ categories: [...s.categories, r.data.data] }));
      toast.success('Category created!');
      return { success: true, data: r.data.data };
    } catch (err) {
      toast.error(getErrMsg(err, 'Failed to create category.'));
      return { success: false };
    }
  },

  removeCategory: async (id) => {
    try {
      await categoryAPI.remove(id);
      set(s => ({ categories: s.categories.filter(c => c._id !== id) }));
      toast.success('Category removed.');
    } catch (err) {
      toast.error(getErrMsg(err, 'Failed.'));
    }
  },

  // ── Transactions ──────────────────────────────────────────────────────────
  transactionPagination: null,

  fetchTransactions: async (params = {}) => {
    get().setLoading('transactions', true);
    try {
      const r = await transactionAPI.getAll({ limit: 200, ...params });
      set({ transactions: r.data.data, transactionPagination: r.data.pagination || null });
    } catch (err) {
      console.error('[fetchTransactions]', getErrMsg(err));
    }
    get().setLoading('transactions', false);
  },

  addTransaction: async (data) => {
    try {
      const r = await transactionAPI.create(data);
      set(s => ({ transactions: [r.data.data, ...s.transactions] }));
      await get().fetchWallets();
      toast.success('Transaction added! ✓');
      return { success: true, data: r.data.data };
    } catch (err) {
      const msg = getErrMsg(err, 'Failed to add transaction.');
      toast.error(msg);
      return { success: false, message: msg };
    }
  },

  editTransaction: async (id, data) => {
    try {
      const r = await transactionAPI.update(id, data);
      set(s => ({ transactions: s.transactions.map(t => t._id === id ? r.data.data : t) }));
      await get().fetchWallets();
      toast.success('Transaction updated! ✓');
      return { success: true };
    } catch (err) {
      const msg = getErrMsg(err, 'Failed to update transaction.');
      toast.error(msg);
      return { success: false };
    }
  },

  removeTransaction: async (id) => {
    try {
      await transactionAPI.remove(id);
      set(s => ({ transactions: s.transactions.filter(t => t._id !== id) }));
      await get().fetchWallets();
      toast.success('Transaction deleted.');
    } catch (err) {
      toast.error(getErrMsg(err, 'Failed to delete transaction.'));
    }
  },

  // ── Budgets ───────────────────────────────────────────────────────────────
  fetchBudgets: async () => {
    try {
      const r = await budgetAPI.getAll();
      set({ budgets: r.data.data });
    } catch (err) {
      console.error('[fetchBudgets]', getErrMsg(err));
    }
  },

  addBudget: async (data) => {
    try {
      const r = await budgetAPI.create(data);
      set(s => ({ budgets: [...s.budgets, r.data.data] }));
      toast.success('Budget created! ✓');
      return { success: true, data: r.data.data };
    } catch (err) {
      const msg = getErrMsg(err, 'Failed to create budget.');
      toast.error(msg);
      return { success: false, message: msg };
    }
  },

  updateBudget: async (id, data) => {
    try {
      const r = await budgetAPI.update(id, data);
      set(s => ({ budgets: s.budgets.map(b => b._id === id ? r.data.data : b) }));
      toast.success('Budget updated! ✓');
      return { success: true };
    } catch (err) {
      const msg = getErrMsg(err, 'Failed to update budget.');
      toast.error(msg);
      return { success: false };
    }
  },

  removeBudget: async (id) => {
    try {
      await budgetAPI.remove(id);
      set(s => ({ budgets: s.budgets.filter(b => b._id !== id) }));
      toast.success('Budget removed.');
    } catch (err) {
      toast.error(getErrMsg(err, 'Failed.'));
    }
  },

  // ── Goals ─────────────────────────────────────────────────────────────────
  fetchGoals: async () => {
    try {
      const r = await goalAPI.getAll();
      set({ goals: r.data.data });
    } catch (err) {
      console.error('[fetchGoals]', getErrMsg(err));
    }
  },

  addGoal: async (data) => {
    try {
      const r = await goalAPI.create(data);
      set(s => ({ goals: [...s.goals, r.data.data] }));
      toast.success('Goal created! ✓');
      return { success: true, data: r.data.data };
    } catch (err) {
      const msg = getErrMsg(err, 'Failed to create goal.');
      toast.error(msg);
      return { success: false, message: msg };
    }
  },

  updateGoal: async (id, data) => {
    try {
      const r = await goalAPI.update(id, data);
      set(s => ({ goals: s.goals.map(g => g._id === id ? r.data.data : g) }));
      toast.success('Updated! ✓');
      return { success: true };
    } catch (err) {
      const msg = getErrMsg(err, 'Failed to update goal.');
      toast.error(msg);
      return { success: false };
    }
  },

  removeGoal: async (id) => {
    try {
      await goalAPI.remove(id);
      set(s => ({ goals: s.goals.filter(g => g._id !== id) }));
      toast.success('Goal removed.');
    } catch (err) {
      toast.error(getErrMsg(err, 'Failed.'));
    }
  },

  // ── Debts ─────────────────────────────────────────────────────────────────
  fetchDebts: async (params) => {
    try {
      const r = await debtAPI.getAll(params);
      set({ debts: r.data.data });
    } catch (err) {
      console.error('[fetchDebts]', getErrMsg(err));
    }
  },

  addDebt: async (data) => {
    try {
      const r = await debtAPI.create(data);
      set(s => ({ debts: [...s.debts, r.data.data] }));
      toast.success('Debt entry added! ✓');
      return { success: true, data: r.data.data };
    } catch (err) {
      const msg = getErrMsg(err, 'Failed to add debt entry.');
      toast.error(msg);
      return { success: false, message: msg };
    }
  },

  updateDebt: async (id, data) => {
    try {
      const r = await debtAPI.update(id, data);
      set(s => ({ debts: s.debts.map(d => d._id === id ? r.data.data : d) }));
      toast.success('Updated! ✓');
      return { success: true };
    } catch (err) {
      const msg = getErrMsg(err, 'Failed to update debt.');
      toast.error(msg);
      return { success: false };
    }
  },

  removeDebt: async (id) => {
    try {
      await debtAPI.remove(id);
      set(s => ({ debts: s.debts.filter(d => d._id !== id) }));
      toast.success('Removed.');
    } catch (err) {
      toast.error(getErrMsg(err, 'Failed.'));
    }
  },
}));