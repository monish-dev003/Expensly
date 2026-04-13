const User                       = require('../models/User');
const { Account, Wallet }        = require('../models/index');
const jwt                        = require('jsonwebtoken');
const bcrypt                     = require('bcryptjs');
const crypto                     = require('crypto');
const { sendPasswordResetEmail } = require('../services/emailService');
const { getAdmin }               = require('../config/firebase-admin');

// ── Simple validators ─────────────────────────────────────────────────────────
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isStrongPass = (p) => p && p.length >= 8;

const signAccess  = id => jwt.sign({ id }, process.env.JWT_ACCESS_SECRET,  { expiresIn: process.env.JWT_ACCESS_EXPIRES  || '15m' });
const signRefresh = id => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d'  });

const sanitizeUser = u => {
  const obj = u.toObject ? u.toObject() : { ...u };
  delete obj.password; delete obj.refreshToken; delete obj.pin;
  delete obj.resetToken; delete obj.resetExpiry;
  return obj;
};

const issueTokens = async user => {
  const accessToken  = signAccess(user._id);
  const refreshToken = signRefresh(user._id);
  await User.findByIdAndUpdate(user._id, { refreshToken });
  return { accessToken, refreshToken };
};

// ── POST /api/auth/register ───────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, currency, currencySymbol, wallets: walletList, notifications, theme } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    if (!isValidEmail(email))
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    if (!isStrongPass(password))
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    if (name.trim().length < 2)
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
    if (await User.findOne({ email: email.toLowerCase().trim() }))
      return res.status(409).json({ success: false, message: 'Email already registered.' });

    const user = await User.create({
      name: name.trim(), email: email.toLowerCase().trim(), password,
      currency: currency || 'INR', currencySymbol: currencySymbol || '₹',
      theme: theme || 'system',
      notifications: notifications || { budgetAlerts: true, pushEnabled: false },
    });
    const account = await Account.create({ userId: user._id, name: 'Personal', icon: '👤', color: '#63b3ed', isDefault: true });
    const walletsToCreate = (Array.isArray(walletList) && walletList.length)
      ? walletList : [{ name: 'Cash', type: 'cash', balance: 0, icon: '💵', color: '#48bb78' }];
    for (const w of walletsToCreate) {
      await Wallet.create({ userId: user._id, accountId: account._id, name: w.name, type: w.type || 'cash', balance: parseFloat(w.balance) || 0, icon: w.icon || '💵', color: w.color || '#48bb78' });
    }
    const tokens = await issueTokens(user);
    res.status(201).json({ success: true, message: 'Registration successful.', data: { user: sanitizeUser(user), ...tokens } });
  } catch (err) { next(err); }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    if (!isValidEmail(email))
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    const tokens = await issueTokens(user);
    res.json({ success: true, message: 'Login successful.', data: { user: sanitizeUser(user), ...tokens } });
  } catch (err) { next(err); }
};

// ── POST /api/auth/firebase ───────────────────────────────────────────────────
exports.firebaseAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ success: false, message: 'idToken required.' });
    const admin = getAdmin();
    if (!admin) return res.status(503).json({ success: false, message: 'Firebase not configured on server.' });

    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decoded;

    let user = email ? await User.findOne({ email: email.toLowerCase() }) : await User.findOne({ firebaseUid: uid });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({
        name: name || (email ? email.split('@')[0] : 'User'),
        email: email ? email.toLowerCase() : `firebase_${uid.slice(0,8)}@noemail.local`,
        password: await bcrypt.hash(uid + process.env.JWT_ACCESS_SECRET, 10),
        firebaseUid: uid, avatar: picture || '', currency: 'INR', currencySymbol: '₹',
      });
      const account = await Account.create({ userId: user._id, name: 'Personal', icon: '👤', color: '#63b3ed', isDefault: true });
      await Wallet.create({ userId: user._id, accountId: account._id, name: 'Cash', type: 'cash', balance: 0, icon: '💵', color: '#48bb78' });
    } else if (!user.firebaseUid) {
      await User.findByIdAndUpdate(user._id, { firebaseUid: uid });
    }

    const tokens = await issueTokens(user);
    res.json({ success: true, data: { user: sanitizeUser(user), ...tokens, isNewUser } });
  } catch (err) {
    if (err.code?.startsWith('auth/')) return res.status(401).json({ success: false, message: 'Invalid or expired Firebase token.' });
    next(err);
  }
};

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'Refresh token required.' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken)
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    const newAccess  = signAccess(user._id);
    const newRefresh = signRefresh(user._id);
    await User.findByIdAndUpdate(user._id, { refreshToken: newRefresh });
    res.json({ success: true, data: { accessToken: newAccess, refreshToken: newRefresh } });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError')
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    next(err);
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.json({ success: true, message: 'Logged out.' });
  } catch (err) { next(err); }
};

// ── PUT /api/auth/pin ─────────────────────────────────────────────────────────
exports.setPin = async (req, res, next) => {
  try {
    const { pin } = req.body;
    if (!pin || !/^\d{4}$/.test(pin)) return res.status(400).json({ success: false, message: 'PIN must be 4 digits.' });
    const user = await User.findById(req.user._id);
    user.pin = pin; user.pinEnabled = true;
    await user.save();
    res.json({ success: true, message: 'PIN set.' });
  } catch (err) { next(err); }
};

// ── DELETE /api/auth/pin ──────────────────────────────────────────────────────
exports.disablePin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.pin = undefined; user.pinEnabled = false;
    await user.save();
    res.json({ success: true, message: 'PIN disabled.' });
  } catch (err) { next(err); }
};

// ── POST /api/auth/verify-pin ─────────────────────────────────────────────────
exports.verifyPin = async (req, res, next) => {
  try {
    const { pin } = req.body;
    const user = await User.findById(req.user._id).select('+pin');
    if (!user?.pin) return res.status(400).json({ success: false, message: 'No PIN set.' });
    if (!(await user.comparePin(pin))) return res.status(401).json({ success: false, message: 'Incorrect PIN.' });
    res.json({ success: true, message: 'PIN verified.' });
  } catch (err) { next(err); }
};

// ── POST /api/auth/change-password ───────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Both passwords required.' });
    if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'Min 8 characters.' });
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) return res.status(401).json({ success: false, message: 'Current password incorrect.' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed.' });
  } catch (err) { next(err); }
};

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });

    const token  = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    await User.findByIdAndUpdate(user._id, { resetToken: token, resetExpiry: expiry });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${clientUrl}/reset-password?token=${token}`;

    const emailResult = await sendPasswordResetEmail({ toEmail: user.email, toName: user.name, resetLink });

    if (emailResult.sent) {
      return res.json({ success: true, emailSent: true, message: 'Password reset link sent to your email.' });
    } else {
      // Dev mode — email not configured, return token for direct redirect
      return res.json({ success: true, emailSent: false, token, resetLink, message: 'Dev mode: no email configured.' });
    }
  } catch (err) { next(err); }
};

// ── POST /api/auth/reset-password ────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ success: false, message: 'Token and password required.' });
    if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'Min 8 characters.' });
    const user = await User.findOne({ resetToken: token, resetExpiry: { $gt: new Date() } }).select('+resetToken +resetExpiry');
    if (!user) return res.status(400).json({ success: false, message: 'Reset link is invalid or expired.' });
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword, resetToken: null, resetExpiry: null });
    res.json({ success: true, message: 'Password reset successfully. Please log in.' });
  } catch (err) { next(err); }
};

// ── POST /api/auth/reset-pin ──────────────────────────────────────────────────
exports.resetPin = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ success: false, message: 'Account password required.' });
    const user = await User.findById(req.user._id).select('+password');
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ success: false, message: 'Incorrect password.' });
    await User.findByIdAndUpdate(user._id, { pin: null, pinEnabled: false });
    res.json({ success: true, message: 'PIN reset successfully.' });
  } catch (err) { next(err); }
};
