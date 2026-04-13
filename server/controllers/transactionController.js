const { Transaction, Wallet, Category } = require('../models/index');
const mongoose = require('mongoose');
const ExcelJS  = require('exceljs');

// ── Built-in category map (slug → metadata) ─────────────────────────────────
const BUILTIN_CATS = {
  food:    { name:'Food & Drink',   icon:'🍜', color:'#f6ad55' },
  trans:   { name:'Transport',      icon:'🚗', color:'#63b3ed' },
  shop:    { name:'Shopping',       icon:'🛍️', color:'#b794f4' },
  health:  { name:'Health',         icon:'💊', color:'#fc8181' },
  ent:     { name:'Entertainment',  icon:'🎬', color:'#76e4f7' },
  util:    { name:'Utilities',      icon:'💡', color:'#f6c90e' },
  grocery: { name:'Groceries',      icon:'🛒', color:'#48bb78' },
  rent:    { name:'Rent/Housing',   icon:'🏠', color:'#fc8181' },
  edu:     { name:'Education',      icon:'📚', color:'#63b3ed' },
  care:    { name:'Personal Care',  icon:'💇', color:'#b794f4' },
  travel:  { name:'Travel',         icon:'✈️', color:'#f6ad55' },
  sub:     { name:'Subscriptions',  icon:'📱', color:'#76e4f7' },
  other:   { name:'Other',          icon:'📦', color:'#a0aec0' },
  salary:  { name:'Salary',         icon:'💼', color:'#48bb78' },
  free:    { name:'Freelance',      icon:'💻', color:'#63b3ed' },
  invest:  { name:'Investment',     icon:'📈', color:'#b794f4' },
  biz:     { name:'Business',       icon:'🏢', color:'#f6ad55' },
  rental:  { name:'Rental',         icon:'🏘️', color:'#76e4f7' },
  gift:    { name:'Gift Received',  icon:'🎀', color:'#fc8181' },
  refund:  { name:'Refund',         icon:'↩️', color:'#f6c90e' },
  other2:  { name:'Other Income',   icon:'💰', color:'#a0aec0' },
};

const resolveCategory = (catId) => {
  if (!catId) return { name:'', icon:'📦', color:'#a0aec0', slug:'' };
  if (typeof catId === 'string' && BUILTIN_CATS[catId]) {
    return { ...BUILTIN_CATS[catId], slug: catId };
  }
  if (typeof catId === 'string') return { name: catId, icon:'📦', color:'#a0aec0', slug: catId };
  return { name:'', icon:'📦', color:'#a0aec0', slug:'' };
};

const isObjectId = (v) => {
  try { return mongoose.Types.ObjectId.isValid(v) && String(new mongoose.Types.ObjectId(v)) === String(v); }
  catch { return false; }
};

// ── @GET /api/transactions ──────────────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { type, walletId, startDate, endDate, search, page = 1, limit = 100, sort = '-date' } = req.query;
    const filter = { userId: req.user._id };
    if (type)     filter.type = type;
    if (walletId) filter.$or  = [{ walletId }, { toWalletId: walletId }];
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(new Date(endDate).setHours(23,59,59));
    }
    if (search) filter.note = { $regex: search, $options: 'i' };

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Transaction.countDocuments(filter);
    const txns  = await Transaction.find(filter)
      .populate('walletId',   'name icon color currency currencySymbol')
      .populate('toWalletId', 'name icon color')
      .sort(sort).skip(skip).limit(parseInt(limit)).lean();

    const enriched = txns.map(t => ({
      ...t,
      catId:    t.category?.slug || t.catId || null,
      category: t.category?.name ? t.category : resolveCategory(t.catId),
    }));

    res.json({
      success: true, data: enriched,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) { next(err); }
};

// ── @GET /api/transactions/:id ──────────────────────────────────────────────
exports.getOne = async (req, res, next) => {
  try {
    const txn = await Transaction.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('walletId toWalletId').lean();
    if (!txn) return res.status(404).json({ success: false, message: 'Transaction not found.' });
    res.json({ success: true, data: { ...txn, category: txn.category || resolveCategory(txn.catId) } });
  } catch (err) { next(err); }
};

// ── @POST /api/transactions ─────────────────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const { type, amount, catId, walletId, toWalletId, date, note, isRecurring, recurringId, tags } = req.body;

    if (!type || !amount || !walletId) {
      return res.status(400).json({ success: false, message: 'type, amount, walletId are required.' });
    }
    if (!['income','expense','transfer'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid transaction type.' });
    }
    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be positive.' });
    }

    const wallet = await Wallet.findOne({ _id: walletId, userId: req.user._id });
    if (!wallet) return res.status(404).json({ success: false, message: 'Wallet not found.' });

    let resolvedCat = { name:'', icon:'📦', color:'#a0aec0', slug:'' };
    let storedCatId = null;
    if (catId) {
      if (isObjectId(catId)) {
        const dbCat = await Category.findById(catId).lean();
        if (dbCat) resolvedCat = { name: dbCat.name, icon: dbCat.icon, color: dbCat.color, slug: String(catId) };
        storedCatId = catId;
      } else {
        resolvedCat = resolveCategory(catId);
        storedCatId = catId;
      }
    }

    if (type === 'transfer') {
      if (!toWalletId) return res.status(400).json({ success: false, message: 'toWalletId required for transfer.' });
      const toWallet = await Wallet.findOne({ _id: toWalletId, userId: req.user._id });
      if (!toWallet) return res.status(404).json({ success: false, message: 'Destination wallet not found.' });
      wallet.balance   -= parseFloat(amount);
      toWallet.balance += parseFloat(amount);
      await wallet.save(); await toWallet.save();
    } else if (type === 'income') {
      wallet.balance += parseFloat(amount); await wallet.save();
    } else {
      wallet.balance -= parseFloat(amount); await wallet.save();
    }

    const txn = await Transaction.create({
      userId: req.user._id, type, amount: parseFloat(amount),
      catId: storedCatId, category: resolvedCat, walletId,
      toWalletId: toWalletId || null,
      date: date ? new Date(date) : new Date(),
      note: note || '', isRecurring: isRecurring || false,
      recurringId: recurringId || null, tags: tags || [],
    });

    const populated = await Transaction.findById(txn._id)
      .populate('walletId',   'name icon color currency currencySymbol')
      .populate('toWalletId', 'name icon color').lean();
    res.status(201).json({ success: true, data: { ...populated, category: resolvedCat } });
  } catch (err) { next(err); }
};

// ── @PUT /api/transactions/:id ──────────────────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const txn = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!txn) return res.status(404).json({ success: false, message: 'Transaction not found.' });

    const oldWallet = await Wallet.findById(txn.walletId);
    if (oldWallet) {
      if (txn.type === 'income')  oldWallet.balance -= txn.amount;
      if (txn.type === 'expense') oldWallet.balance += txn.amount;
      await oldWallet.save();
    }
    if (txn.toWalletId) {
      const oldTo = await Wallet.findById(txn.toWalletId);
      if (oldTo) { oldTo.balance -= txn.amount; await oldTo.save(); }
    }

    const allowed = ['type','amount','catId','category','walletId','toWalletId','date','note','tags'];
    allowed.forEach(k => { if (req.body[k] !== undefined) txn[k] = req.body[k]; });
    await txn.save();

    const newWallet = await Wallet.findById(txn.walletId);
    if (newWallet) {
      if (txn.type === 'income')  newWallet.balance += txn.amount;
      if (txn.type === 'expense') newWallet.balance -= txn.amount;
      await newWallet.save();
    }
    if (txn.type === 'transfer' && txn.toWalletId) {
      const newTo = await Wallet.findById(txn.toWalletId);
      if (newTo) { newTo.balance += txn.amount; await newTo.save(); }
    }

    const populated = await Transaction.findById(txn._id).populate('walletId toWalletId').lean();
    res.json({ success: true, data: populated });
  } catch (err) { next(err); }
};

// ── @DELETE /api/transactions/:id ───────────────────────────────────────────
exports.remove = async (req, res, next) => {
  try {
    const txn = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!txn) return res.status(404).json({ success: false, message: 'Transaction not found.' });

    const wallet = await Wallet.findById(txn.walletId);
    if (wallet) {
      if (txn.type === 'income')   wallet.balance -= txn.amount;
      if (txn.type === 'expense')  wallet.balance += txn.amount;
      if (txn.type === 'transfer') wallet.balance += txn.amount;
      await wallet.save();
    }
    if (txn.toWalletId && txn.type === 'transfer') {
      const toWallet = await Wallet.findById(txn.toWalletId);
      if (toWallet) { toWallet.balance -= txn.amount; await toWallet.save(); }
    }
    await txn.deleteOne();
    res.json({ success: true, message: 'Transaction deleted.' });
  } catch (err) { next(err); }
};

// ── @POST /api/transactions/:id/receipt ────────────────────────────────────
exports.uploadReceipt = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    const txn = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!txn) return res.status(404).json({ success: false, message: 'Transaction not found.' });
    const { uploadToCloudinary } = require('../config/cloudinary');
    const result = await uploadToCloudinary(req.file.buffer);
    txn.receiptUrl      = result.secure_url;
    txn.receiptPublicId = result.public_id;
    await txn.save();
    res.json({ success: true, data: { receiptUrl: txn.receiptUrl } });
  } catch (err) { next(err); }
};

// ── @GET /api/transactions/export ──────────────────────────────────────────
// NOTE: Duplicate exportData removed. This is the single, clean implementation.
exports.exportData = async (req, res, next) => {
  try {
    const { format = 'csv', startDate, endDate } = req.query;
    const filter = { userId: req.user._id };
    if (startDate) filter.date = { $gte: new Date(startDate) };
    if (endDate)   filter.date = { ...(filter.date || {}), $lte: new Date(endDate) };

    const txns = await Transaction.find(filter)
      .populate('walletId', 'name currencySymbol')
      .sort('-date').lean();

    const getcat  = t => t.category?.name  || (BUILTIN_CATS[t.catId]?.name) || String(t.catId || '') || 'Other';
    const geticon = t => t.category?.icon  || (BUILTIN_CATS[t.catId]?.icon) || '📦';

    if (format === 'xlsx') {
      const wb = new ExcelJS.Workbook();
      wb.creator = 'Expensly'; wb.created = new Date();
      const ws = wb.addWorksheet('Transactions', { views:[{ state:'frozen', ySplit:1 }] });
      ws.columns = [
        { header:'Date',     key:'date',   width:14 },
        { header:'Type',     key:'type',   width:12 },
        { header:'Amount',   key:'amount', width:14 },
        { header:'Category', key:'cat',    width:22 },
        { header:'Wallet',   key:'wallet', width:20 },
        { header:'Note',     key:'note',   width:34 },
      ];
      ws.getRow(1).eachCell(cell => {
        cell.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF1E2130' } };
        cell.font = { bold:true, color:{ argb:'FFE2E8F0' }, size:11 };
        cell.alignment = { vertical:'middle', horizontal:'center' };
        cell.border = { bottom:{ style:'medium', color:{ argb:'FF63B3ED' } } };
      });
      ws.getRow(1).height = 28;

      txns.forEach((t, idx) => {
        const row = ws.addRow({
          date:   new Date(t.date).toLocaleDateString('en-IN'),
          type:   t.type.charAt(0).toUpperCase() + t.type.slice(1),
          amount: t.amount,
          cat:    `${geticon(t)} ${getcat(t)}`.trim(),
          wallet: t.walletId?.name || '',
          note:   t.note || '',
        });
        row.height = 22;
        const amtCell = row.getCell('amount');
        amtCell.font = { bold:true, color:{ argb: t.type==='income'?'FF48BB78':t.type==='expense'?'FFFC8181':'FF63B3ED' } };
        amtCell.numFmt = '#,##0.00';
        if (idx % 2 === 1) {
          row.eachCell(cell => {
            if (cell.col !== amtCell.col) {
              cell.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF16181F' } };
            }
          });
        }
      });

      const ws2 = wb.addWorksheet('Summary');
      const totalInc = txns.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
      const totalExp = txns.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
      ws2.addRow(['Expensly Export']).getCell(1).font = { bold:true, size:14 };
      ws2.addRow(['Generated', new Date().toLocaleString()]);
      ws2.addRow(['Records', txns.length]);
      ws2.addRow([]);
      ws2.addRow(['Total Income',  totalInc]).getCell(2).font  = { bold:true, color:{ argb:'FF48BB78' } };
      ws2.addRow(['Total Expense', totalExp]).getCell(2).font  = { bold:true, color:{ argb:'FFFC8181' } };
      ws2.addRow(['Net Savings', totalInc - totalExp]).getCell(2).font = { bold:true, color:{ argb: totalInc >= totalExp ? 'FF48BB78' : 'FFFC8181' } };
      ws2.getColumn(1).width = 20; ws2.getColumn(2).width = 16;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=expensly_export.xlsx');
      await wb.xlsx.write(res);
      return res.end();
    }

    // CSV
    const hdr  = 'Date,Type,Amount,Category,Wallet,Note\n';
    const rows = txns.map(t =>
      `${new Date(t.date).toLocaleDateString('en-IN')},${t.type},${t.amount},"${getcat(t)}","${t.walletId?.name||''}","${(t.note||'').replace(/"/g,'""')}"`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=expensly_export.csv');
    res.send('\xEF\xBB\xBF' + hdr + rows); // UTF-8 BOM for Excel compatibility
  } catch (err) { next(err); }
};
