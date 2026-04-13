const { assertOwner } = require('../middleware/auth');
const mongoose = require('mongoose');
const { User, Wallet, Account, Category, Budget, Transaction, SavingsGoal, Debt } = require('../models/index');

// ── Helper: safely check if a value is a valid ObjectId hex string ────────────
const isObjectId = (val) => {
  if (!val) return false;
  try {
    return mongoose.Types.ObjectId.isValid(val) &&
      String(new mongoose.Types.ObjectId(String(val))) === String(val);
  } catch (_) { return false; }
};

// ═══════════════════════════════════════════════════════════════════
// USER
// ═══════════════════════════════════════════════════════════════════
exports.getMe = async (req, res, next) => {
  try { res.json({ success: true, data: req.user }); } catch (err) { next(err); }
};

exports.updateMe = async (req, res, next) => {
  try {
    const allowed = ['name', 'currency', 'currencySymbol', 'language', 'monthStart', 'theme', 'notifications', 'pinEnabled'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    if (req.body.password) return res.status(400).json({ success: false, message: 'Use /auth/change-password to change password.' });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════
// WALLETS
// ═══════════════════════════════════════════════════════════════════
exports.getWallets = async (req, res, next) => {
  try {
    const wallets = await Wallet.find({ userId: req.user._id, isActive: true })
      .populate('accountId', 'name icon color').sort('createdAt').lean();
    const total = wallets.filter(w => w.includeInTotal).reduce((s, w) => s + w.balance, 0);
    res.json({ success: true, data: wallets, meta: { total } });
  } catch (err) { next(err); }
};

exports.createWallet = async (req, res, next) => {
  try {
    const { name, type, balance, currency, currencySymbol, icon, color, accountId, creditLimit, paymentDate, includeInTotal } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ success: false, message: 'Wallet name is required.' });
    if (name.trim().length > 50)
      return res.status(400).json({ success: false, message: 'Wallet name must be 50 characters or less.' });
    const validTypes = ['cash','bank','credit','savings','investment','other'];
    if (type && !validTypes.includes(type))
      return res.status(400).json({ success: false, message: `type must be one of: ${validTypes.join(', ')}.` });
    const parsedBalance = parseFloat(balance) || 0;
    if (balance !== undefined && isNaN(parseFloat(balance)))
      return res.status(400).json({ success: false, message: 'balance must be a valid number.' });
    if (Math.abs(parsedBalance) > 1_000_000_000)
      return res.status(400).json({ success: false, message: 'Balance value is too large.' });

    const wallet = await Wallet.create({
      userId: req.user._id, name: name.trim(), type: type || 'cash',
      balance: parsedBalance,
      currency: currency || req.user.currency || 'INR',
      currencySymbol: currencySymbol || req.user.currencySymbol || '₹',
      icon: icon || '💵', color: color || '#48bb78',
      accountId: accountId || null, creditLimit: creditLimit || null,
      paymentDate: paymentDate || null, includeInTotal: includeInTotal !== false,
    });
    res.status(201).json({ success: true, data: wallet });
  } catch (err) { next(err); }
};

exports.updateWallet = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id }, req.body, { new: true, runValidators: true }
    );
    if (!wallet) return res.status(404).json({ success: false, message: 'Wallet not found.' });
    res.json({ success: true, data: wallet });
  } catch (err) { next(err); }
};

exports.deleteWallet = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ _id: req.params.id, userId: req.user._id });
    if (!wallet) return res.status(404).json({ success: false, message: 'Wallet not found.' });
    wallet.isActive = false;
    await wallet.save();
    res.json({ success: true, message: 'Wallet removed.' });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════
// ACCOUNTS
// ═══════════════════════════════════════════════════════════════════
exports.getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({ userId: req.user._id }).sort('createdAt');
    res.json({ success: true, data: accounts });
  } catch (err) { next(err); }
};

exports.createAccount = async (req, res, next) => {
  try {
    const { name, icon, color } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Account name required.' });
    const account = await Account.create({ userId: req.user._id, name, icon: icon || '💼', color: color || '#63b3ed' });
    res.status(201).json({ success: true, data: account });
  } catch (err) { next(err); }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    await Account.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Account deleted.' });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════════
exports.getCategories = async (req, res, next) => {
  try {
    const cats = await Category.find({ $or: [{ userId: req.user._id }, { isSystem: true }] }).sort('order name').lean();
    res.json({ success: true, data: cats });
  } catch (err) { next(err); }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, icon, color, type, parentId } = req.body;
    if (!name || !type) return res.status(400).json({ success: false, message: 'name and type required.' });
    const cat = await Category.create({ userId: req.user._id, name, icon: icon || '📦', color: color || '#a0aec0', type, parentId: parentId || null });
    res.status(201).json({ success: true, data: cat });
  } catch (err) { next(err); }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const cat = await Category.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true });
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, data: cat });
  } catch (err) { next(err); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await Category.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Category deleted.' });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════
// BUDGETS
// ═══════════════════════════════════════════════════════════════════

/**
 * CRITICAL BUG FIX:
 * Old code: mongoose.Types.ObjectId.createFromHexString(catId.toString())
 * This crashed when catId was a string slug like 'food', 'trans', etc.
 * (BSONError: Argument passed must be 24 hex chars)
 * Fix: check isObjectId() first, otherwise match catId as plain string.
 */
const getSpentForBudget = async (userId, catId, period) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  let start, end;

  if (period === 'weekly') {
    start = new Date(now); start.setDate(now.getDate() - now.getDay()); start.setHours(0, 0, 0, 0);
    end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23, 59, 59, 999);
  } else if (period === 'yearly') {
    start = new Date(year, 0, 1); end = new Date(year, 11, 31, 23, 59, 59);
  } else {
    start = new Date(year, month, 1); end = new Date(year, month + 1, 0, 23, 59, 59);
  }

  // Handle BOTH ObjectId references AND plain string slugs (e.g. 'food', 'salary')
  const catMatch = isObjectId(catId)
    ? new mongoose.Types.ObjectId(String(catId))
    : catId;

  try {
    const agg = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(String(userId)),
          catId: catMatch,
          type: 'expense',
          date: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return agg[0]?.total || 0;
  } catch (_) {
    return 0;
  }
};

exports.getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id, isActive: true }).lean();
    if (!budgets.length) return res.json({ success: true, data: [] });

    // ── Single aggregation to compute spent for ALL budgets at once ────────────
    // Previously: N separate queries (one per budget) — O(N) DB round-trips.
    // Now: 1 aggregation that groups by catId and period bucket, then we join in JS.
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Compute per-period date ranges for each unique period type present
    const periodRanges = {};
    for (const b of budgets) {
      const p = b.period || 'monthly';
      if (periodRanges[p]) continue;
      if (p === 'weekly') {
        const start = new Date(now); start.setDate(now.getDate() - now.getDay()); start.setHours(0,0,0,0);
        const end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999);
        periodRanges[p] = { start, end };
      } else if (p === 'yearly') {
        periodRanges[p] = { start: new Date(year,0,1), end: new Date(year,11,31,23,59,59,999) };
      } else {
        periodRanges[p] = { start: new Date(year,month,1), end: new Date(year,month+1,0,23,59,59,999) };
      }
    }

    // Build a single match range covering all periods
    const allStarts = Object.values(periodRanges).map(r => r.start);
    const allEnds   = Object.values(periodRanges).map(r => r.end);
    const globalStart = new Date(Math.min(...allStarts));
    const globalEnd   = new Date(Math.max(...allEnds));

    const spentAgg = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type:   'expense',
          date:   { $gte: globalStart, $lte: globalEnd },
        },
      },
      {
        $group: {
          _id:   { catId: '$catId', month: { $month: '$date' }, year: { $year: '$date' } },
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Build lookup map: "catId|YYYY-M" → total
    const spentMap = {};
    spentAgg.forEach(row => {
      const key = `${row._id.catId}|${row._id.year}-${row._id.month}`;
      spentMap[key] = (spentMap[key] || 0) + row.total;
    });

    // Helper: given a catId and period, sum up the relevant month(s)
    const getSpent = (catId, period) => {
      const range = periodRanges[period] || periodRanges['monthly'];
      let total = 0;
      // Iterate every month in the range (weekly/monthly = 1 month, yearly = 12)
      const cur = new Date(range.start.getFullYear(), range.start.getMonth(), 1);
      while (cur <= range.end) {
        const key = `${catId}|${cur.getFullYear()}-${cur.getMonth() + 1}`;
        total += spentMap[key] || 0;
        cur.setMonth(cur.getMonth() + 1);
      }
      return total;
    };

    const withSpent = budgets.map(b => ({
      ...b,
      spent: getSpent(b.catId?._id || b.catId, b.period || 'monthly'),
    }));

    res.json({ success: true, data: withSpent });
  } catch (err) { next(err); }
};

exports.createBudget = async (req, res, next) => {
  try {
    const { catId, catName, catIcon, catColor, limit, period, alertThreshold } = req.body;
    if (!catId || !limit) return res.status(400).json({ success: false, message: 'catId and limit required.' });
    if (parseFloat(limit) <= 0) return res.status(400).json({ success: false, message: 'Budget limit must be positive.' });
    if (parseFloat(limit) > 100_000_000) return res.status(400).json({ success: false, message: 'Budget limit is too large.' });
    const budget = await Budget.create({
      userId: req.user._id,
      catId, catName: catName || '', catIcon: catIcon || '📦', catColor: catColor || '#a0aec0',
      limit: parseFloat(limit), period: period || 'monthly', alertThreshold: alertThreshold || 80,
    });
    res.status(201).json({ success: true, data: budget });
  } catch (err) { next(err); }
};

exports.updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true });
    if (!budget) return res.status(404).json({ success: false, message: 'Budget not found.' });
    res.json({ success: true, data: budget });
  } catch (err) { next(err); }
};

exports.deleteBudget = async (req, res, next) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Budget deleted.' });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════
// SAVINGS GOALS
// ═══════════════════════════════════════════════════════════════════
exports.getGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.user._id }).sort('-createdAt');
    res.json({ success: true, data: goals });
  } catch (err) { next(err); }
};

exports.createGoal = async (req, res, next) => {
  try {
    const { name, targetAmount, currentAmount, icon, color, targetDate, walletId } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ success: false, message: 'name is required.' });
    const parsedTarget = parseFloat(targetAmount);
    if (!targetAmount || isNaN(parsedTarget) || parsedTarget <= 0)
      return res.status(400).json({ success: false, message: 'targetAmount must be a positive number.' });
    const parsedCurrent = parseFloat(currentAmount) || 0;
    if (parsedCurrent < 0)
      return res.status(400).json({ success: false, message: 'currentAmount cannot be negative.' });
    if (parsedCurrent > parsedTarget)
      return res.status(400).json({ success: false, message: 'currentAmount cannot exceed targetAmount.' });
    const goal = await SavingsGoal.create({
      userId: req.user._id, name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      icon: icon || '🎯',
      color: color || '#63b3ed',
      targetDate: targetDate ? new Date(targetDate) : null,
      walletId: walletId || null,
    });
    res.status(201).json({ success: true, data: goal });
  } catch (err) { next(err); }
};

exports.updateGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });

    if (req.body.contribute && parseFloat(req.body.contribute) > 0) {
      const amount = parseFloat(req.body.contribute);
      if (goal.walletId) {
        const wallet = await Wallet.findOne({ _id: goal.walletId, userId: req.user._id });
        if (wallet) {
          if (wallet.balance < amount) return res.status(400).json({ success: false,
            message: `Insufficient balance in ${wallet.name}. Available: ${wallet.balance.toFixed(2)}` });
          wallet.balance -= amount;
          await wallet.save();
        }
      }
      goal.currentAmount = Math.min(goal.targetAmount, goal.currentAmount + amount);
      goal.contributions.push({ amount, note: req.body.note || '' });
    } else {
      const allowed = ['name', 'targetAmount', 'currentAmount', 'icon', 'color', 'targetDate', 'walletId'];
      allowed.forEach(k => { if (req.body[k] !== undefined) goal[k] = req.body[k]; });
    }
    await goal.save();
    res.json({ success: true, data: goal });
  } catch (err) { next(err); }
};

exports.deleteGoal = async (req, res, next) => {
  try {
    await SavingsGoal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Goal deleted.' });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════
// DEBTS
// ═══════════════════════════════════════════════════════════════════
exports.getDebts = async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = { userId: req.user._id };
    if (type) filter.type = type;
    const debts = await Debt.find(filter).sort('-createdAt');
    res.json({ success: true, data: debts });
  } catch (err) { next(err); }
};

exports.createDebt = async (req, res, next) => {
  try {
    const { type, person, amount, dueDate, note } = req.body;
    if (!type || !person || !amount) {
      return res.status(400).json({ success: false, message: 'type, person, and amount are required.' });
    }
    if (!['owe', 'lent'].includes(type)) {
      return res.status(400).json({ success: false, message: 'type must be "owe" or "lent".' });
    }
    const debt = await Debt.create({
      userId: req.user._id, type, person: person.trim(),
      amount: parseFloat(amount),
      dueDate: dueDate ? new Date(dueDate) : null,
      note: note || '',
    });
    res.status(201).json({ success: true, data: debt });
  } catch (err) { next(err); }
};

exports.updateDebt = async (req, res, next) => {
  try {
    const debt = await Debt.findOne({ _id: req.params.id, userId: req.user._id });
    if (!debt) return res.status(404).json({ success: false, message: 'Debt not found.' });

    if (req.body.payment && parseFloat(req.body.payment) > 0) {
      const p = parseFloat(req.body.payment);
      debt.paid = Math.min(debt.amount, debt.paid + p);
      debt.payments.push({ amount: p, note: req.body.note || '' });
    } else {
      const allowed = ['person', 'amount', 'dueDate', 'note', 'type'];
      allowed.forEach(k => { if (req.body[k] !== undefined) debt[k] = req.body[k]; });
    }
    await debt.save();
    res.json({ success: true, data: debt });
  } catch (err) { next(err); }
};

exports.deleteDebt = async (req, res, next) => {
  try {
    await Debt.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Debt deleted.' });
  } catch (err) { next(err); }
};

// ── Avatar Upload ─────────────────────────────────────────────────────────────
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    const { uploadToCloudinary } = require('../config/cloudinary');
    const result = await uploadToCloudinary(req.file.buffer);
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: result.secure_url }, { new: true });
    res.json({ success: true, data: { avatarUrl: user.avatar } });
  } catch (err) { next(err); }
};
// ═══════════════════════════════════════════════════════════════════
// RECURRING TRANSACTIONS
// ═══════════════════════════════════════════════════════════════════
const { Recurring } = require('../models/index');

exports.getRecurring = async (req, res, next) => {
  try {
    const rules = await Recurring.find({ userId: req.user._id }).sort('-createdAt').lean();
    res.json({ success: true, data: rules });
  } catch (err) { next(err); }
};

exports.createRecurring = async (req, res, next) => {
  try {
    const { name, frequency, nextDate, endDate, templateData } = req.body;
    if (!name || !frequency || !nextDate || !templateData)
      return res.status(400).json({ success: false, message: 'name, frequency, nextDate, templateData required.' });
    const rule = await Recurring.create({
      userId: req.user._id, name: name.trim(), frequency,
      nextDate: new Date(nextDate), endDate: endDate ? new Date(endDate) : null,
      isActive: true, templateData,
    });
    res.status(201).json({ success: true, data: rule });
  } catch (err) { next(err); }
};

exports.updateRecurring = async (req, res, next) => {
  try {
    const rule = await Recurring.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id }, req.body, { new: true }
    );
    if (!rule) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, data: rule });
  } catch (err) { next(err); }
};

exports.deleteRecurring = async (req, res, next) => {
  try {
    const rule = await Recurring.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!rule) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, message: 'Deleted.' });
  } catch (err) { next(err); }
};

exports.toggleRecurring = async (req, res, next) => {
  try {
    const rule = await Recurring.findOne({ _id: req.params.id, userId: req.user._id });
    if (!rule) return res.status(404).json({ success: false, message: 'Not found.' });
    rule.isActive = !rule.isActive;
    await rule.save();
    res.json({ success: true, data: rule, message: rule.isActive ? 'Resumed.' : 'Paused.' });
  } catch (err) { next(err); }
};
