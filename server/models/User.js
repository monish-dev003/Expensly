const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  pin: { type: String, select: false },
  pinEnabled: { type: Boolean, default: false },
  refreshToken: { type: String, select: false },
  currency: { type: String, default: 'INR' },
  currencySymbol: { type: String, default: '₹' },
  language: { type: String, default: 'en' },
  monthStart: { type: Number, default: 1 },
  theme: { type: String, default: 'dark' },
  notifications: { budgetAlerts: { type: Boolean, default: true }, pushEnabled: { type: Boolean, default: false } },
  avatar: { type: String, default: '' },
  firebaseUid: { type: String, default: null },
  resetToken: { type: String, default: null, select: false },
  resetExpiry: { type: Date, default: null, select: false },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
  if (this.isModified('pin') && this.pin) this.pin = await bcrypt.hash(this.pin, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) { return bcrypt.compare(plain, this.password); };
userSchema.methods.comparePin = function (plain) { return bcrypt.compare(plain, this.pin); };

module.exports = mongoose.model('User', userSchema);