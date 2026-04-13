const router            = require('express').Router();
const multer            = require('multer');
const { protect }       = require('../middleware/auth');
const auth              = require('../controllers/authController');
const rc                = require('../controllers/resourceController');
const tc                = require('../controllers/transactionController');
const sc                = require('../controllers/statsController');
const { upload }        = require('../config/cloudinary');

const memStorage = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post  ('/auth/register',         auth.register);
router.post  ('/auth/login',            auth.login);
router.post  ('/auth/firebase',         auth.firebaseAuth);
router.post  ('/auth/refresh',          auth.refreshToken);
router.post  ('/auth/logout',           protect, auth.logout);
router.put   ('/auth/pin',              protect, auth.setPin);
router.delete('/auth/pin',              protect, auth.disablePin);
router.post  ('/auth/verify-pin',       protect, auth.verifyPin);
router.post  ('/auth/change-password',  protect, auth.changePassword);
router.post  ('/auth/forgot-password',           auth.forgotPassword);
router.post  ('/auth/reset-password',            auth.resetPassword);
router.post  ('/auth/reset-pin',        protect, auth.resetPin);

// ── Users ─────────────────────────────────────────────────────────────────────
router.get ('/users/me',         protect, rc.getMe);
router.put ('/users/me',         protect, rc.updateMe);
router.post('/users/me/avatar',  protect, upload.single('avatar'), rc.uploadAvatar);

// ── Accounts ──────────────────────────────────────────────────────────────────
router.get   ('/accounts',      protect, rc.getAccounts);
router.post  ('/accounts',      protect, rc.createAccount);
router.delete('/accounts/:id',  protect, rc.deleteAccount);

// ── Wallets ───────────────────────────────────────────────────────────────────
router.get   ('/wallets',      protect, rc.getWallets);
router.post  ('/wallets',      protect, rc.createWallet);
router.put   ('/wallets/:id',  protect, rc.updateWallet);
router.delete('/wallets/:id',  protect, rc.deleteWallet);

// ── Categories ────────────────────────────────────────────────────────────────
router.get   ('/categories',      protect, rc.getCategories);
router.post  ('/categories',      protect, rc.createCategory);
router.put   ('/categories/:id',  protect, rc.updateCategory);
router.delete('/categories/:id',  protect, rc.deleteCategory);

// ── Transactions ──────────────────────────────────────────────────────────────
router.get   ('/transactions/export',      protect, tc.exportData);
router.get   ('/transactions',             protect, tc.getAll);
router.post  ('/transactions',             protect, tc.create);
router.get   ('/transactions/:id',         protect, tc.getOne);
router.put   ('/transactions/:id',         protect, tc.update);
router.delete('/transactions/:id',         protect, tc.remove);
router.post  ('/transactions/:id/receipt', protect, upload.single('receipt'), tc.uploadReceipt);

// ── Budgets ───────────────────────────────────────────────────────────────────
router.get   ('/budgets',      protect, rc.getBudgets);
router.post  ('/budgets',      protect, rc.createBudget);
router.put   ('/budgets/:id',  protect, rc.updateBudget);
router.delete('/budgets/:id',  protect, rc.deleteBudget);

// ── Goals ─────────────────────────────────────────────────────────────────────
router.get   ('/goals',      protect, rc.getGoals);
router.post  ('/goals',      protect, rc.createGoal);
router.put   ('/goals/:id',  protect, rc.updateGoal);
router.delete('/goals/:id',  protect, rc.deleteGoal);

// ── Debts ─────────────────────────────────────────────────────────────────────
router.get   ('/debts',      protect, rc.getDebts);
router.post  ('/debts',      protect, rc.createDebt);
router.put   ('/debts/:id',  protect, rc.updateDebt);
router.delete('/debts/:id',  protect, rc.deleteDebt);

// ── Recurring Transactions
router.get   ('/recurring',            protect, rc.getRecurring);
router.post  ('/recurring',            protect, rc.createRecurring);
router.put   ('/recurring/:id',        protect, rc.updateRecurring);
router.delete('/recurring/:id',        protect, rc.deleteRecurring);
router.patch ('/recurring/:id/toggle', protect, rc.toggleRecurring);

// ── Statistics ────────────────────────────────────────────────────────────────
router.get('/stats/summary',     protect, sc.getSummary);
router.get('/stats/by-category', protect, sc.getByCategory);
router.get('/stats/trend',       protect, sc.getTrend);
router.get('/stats/calendar',    protect, sc.getCalendar);

module.exports = router;
