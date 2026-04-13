const mongoose = require('mongoose');

// ── Account ───────────────────────────────────────────────────────────────────
const accountSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:      { type: String, required: true, trim: true },
  icon:      { type: String, default: '💼' },
  color:     { type: String, default: '#63b3ed' },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });
exports.Account = mongoose.model('Account', accountSchema);

// ── Wallet ────────────────────────────────────────────────────────────────────
const walletSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Account', default: null },
  name:           { type: String, required: true, trim: true },
  type:           { type: String, enum: ['cash','bank','credit','savings','investment','other'], default: 'cash' },
  balance:        { type: Number, default: 0 },
  currency:       { type: String, default: 'INR' },
  currencySymbol: { type: String, default: '₹' },
  icon:           { type: String, default: '💵' },
  color:          { type: String, default: '#48bb78' },
  creditLimit:    { type: Number, default: null },
  paymentDate:    { type: Number, default: null },
  includeInTotal: { type: Boolean, default: true },
  isActive:       { type: Boolean, default: true },
}, { timestamps: true });
exports.Wallet = mongoose.model('Wallet', walletSchema);

// ── Category ──────────────────────────────────────────────────────────────────
const categorySchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name:     { type: String, required: true, trim: true },
  icon:     { type: String, default: '📦' },
  color:    { type: String, default: '#a0aec0' },
  type:     { type: String, enum: ['income','expense','both'], required: true },
  isSystem: { type: Boolean, default: false },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  order:    { type: Number, default: 0 },
}, { timestamps: true });
exports.Category = mongoose.model('Category', categorySchema);

// ── Transaction ───────────────────────────────────────────────────────────────
const transactionSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:        { type: String, enum: ['income','expense','transfer'], required: true },
  amount:      { type: Number, required: true, min: 0.01 },
  catId:       { type: mongoose.Schema.Types.Mixed, default: null },
  category:    { name: String, icon: String, color: String, slug: String },
  walletId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
  toWalletId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', default: null },
  date:        { type: Date, default: Date.now },
  note:        { type: String, default: '', maxlength: 500 },
  tags:        [{ type: String, trim: true }],
  receiptUrl:      { type: String, default: null },
  receiptPublicId: { type: String, default: null },
  isRecurring: { type: Boolean, default: false },
  recurringId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recurring', default: null },
  // Bank import fields
  source:      { type: String, default: null },
  importRef:   { type: String, default: null },
}, { timestamps: true });
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });        // stats aggregations
transactionSchema.index({ userId: 1, catId: 1, date: -1 });       // budget spent queries
transactionSchema.index({ userId: 1, walletId: 1, date: -1 });
transactionSchema.index({ userId: 1, isRecurring: 1 });            // recurring queries
exports.Transaction = mongoose.model('Transaction', transactionSchema);

// ── Budget ────────────────────────────────────────────────────────────────────
const budgetSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  catId:          { type: mongoose.Schema.Types.Mixed, required: true },
  catName:        { type: String, default: '' },
  catIcon:        { type: String, default: '📦' },
  catColor:       { type: String, default: '#a0aec0' },
  limit:          { type: Number, required: true, min: 1 },
  period:         { type: String, enum: ['weekly','monthly','yearly'], default: 'monthly' },
  alertThreshold: { type: Number, default: 80 },
  isActive:       { type: Boolean, default: true },
}, { timestamps: true });
budgetSchema.index({ userId: 1, isActive: 1 });
exports.Budget = mongoose.model('Budget', budgetSchema);

// ── SavingsGoal ───────────────────────────────────────────────────────────────
const savingsGoalSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:          { type: String, required: true, trim: true },
  targetAmount:  { type: Number, required: true, min: 1 },
  currentAmount: { type: Number, default: 0 },
  icon:          { type: String, default: '🎯' },
  color:         { type: String, default: '#63b3ed' },
  targetDate:    { type: Date, default: null },
  walletId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', default: null },
  contributions: [{ amount: Number, note: String, date: { type: Date, default: Date.now } }],
}, { timestamps: true });
savingsGoalSchema.index({ userId: 1, createdAt: -1 });
exports.SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema);

// ── Debt ──────────────────────────────────────────────────────────────────────
const debtSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:     { type: String, enum: ['owe','lent'], required: true },
  person:   { type: String, required: true, trim: true },
  amount:   { type: Number, required: true, min: 0.01 },
  paid:     { type: Number, default: 0 },
  dueDate:  { type: Date, default: null },
  note:     { type: String, default: '' },
  payments: [{ amount: Number, note: String, date: { type: Date, default: Date.now } }],
}, { timestamps: true });
debtSchema.index({ userId: 1, createdAt: -1 });
debtSchema.index({ userId: 1, type: 1 });
exports.Debt = mongoose.model('Debt', debtSchema);

// ── Recurring ─────────────────────────────────────────────────────────────────
const recurringSchema = new mongoose.Schema({
  userId:              { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:                { type: String, required: true, trim: true },
  frequency:           { type: String, enum: ['daily','weekly','biweekly','monthly','quarterly','yearly'], default: 'monthly' },
  nextDate:            { type: Date, required: true },
  endDate:             { type: Date, default: null },
  isActive:            { type: Boolean, default: true },
  templateData:        { type: mongoose.Schema.Types.Mixed, required: true },
  createdTransactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
}, { timestamps: true });
recurringSchema.index({ isActive: 1, nextDate: 1 });   // cron job query
exports.Recurring = mongoose.model('Recurring', recurringSchema);

// ── User (separate file) ─────────────────────────────────────────────────────
exports.User = require('./User');

// ── ImportSession ─────────────────────────────────────────────────────────────
const importSessionSchema = new mongoose.Schema({
  userId:                 { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  walletId:               { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', default: null },
  sourceBank:             { type: String, default: 'Unknown' },
  sourceBankId:           { type: String, default: 'unknown' },
  parserUsed:             { type: String, default: 'generic' },
  totalRowsFound:         { type: Number, default: 0 },
  totalRowsImported:      { type: Number, default: 0 },
  totalRowsSkipped:       { type: Number, default: 0 },
  totalIncome:            { type: Number, default: 0 },
  totalExpense:           { type: Number, default: 0 },
  importedTransactionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
  duplicateCount:         { type: Number, default: 0 },
}, { timestamps: true });
importSessionSchema.index({ userId: 1, createdAt: -1 });
exports.ImportSession = mongoose.model('ImportSession', importSessionSchema);
