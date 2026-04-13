const { Transaction, Budget } = require('../models/index');
const mongoose = require('mongoose');

// Built-in category metadata — kept in sync with client utils/categories.js
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
  rental:  { name:'Rental Income',  icon:'🏘️', color:'#76e4f7' },
  gift:    { name:'Gift Received',  icon:'🎀', color:'#fc8181' },
  refund:  { name:'Refund',         icon:'↩️', color:'#f6c90e' },
  other2:  { name:'Other Income',   icon:'💰', color:'#a0aec0' },
};

const getPeriodRange = (period, user) => {
  const now      = new Date();
  const year     = now.getFullYear();
  const month    = now.getMonth();
  const startDay = user?.monthStart || 1;

  if (period === 'weekly') {
    const day   = now.getDay();
    const start = new Date(now); start.setDate(now.getDate() - day); start.setHours(0,0,0,0);
    const end   = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999);
    return { start, end };
  }
  if (period === 'yearly') {
    return { start: new Date(year, 0, 1), end: new Date(year, 11, 31, 23,59,59) };
  }
  // monthly
  let start = new Date(year, month, startDay);
  if (start > now) start = new Date(year, month - 1, startDay);
  const end = new Date(start); end.setMonth(end.getMonth() + 1); end.setDate(end.getDate() - 1); end.setHours(23,59,59,999);
  return { start, end };
};

exports.getSummary = async (req, res, next) => {
  try {
    const { period = 'monthly' } = req.query;
    const { start, end } = getPeriodRange(period, req.user);
    const uid = req.user._id;

    const agg = await Transaction.aggregate([
      { $match: { userId: uid, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const income   = agg.find(a => a._id === 'income')?.total   || 0;
    const expense  = agg.find(a => a._id === 'expense')?.total  || 0;
    const transfer = agg.find(a => a._id === 'transfer')?.count || 0;

    res.json({ success: true, data: { income, expense, transfer, net: income - expense, period, start, end } });
  } catch (err) { next(err); }
};

exports.getByCategory = async (req, res, next) => {
  try {
    const { period = 'monthly', type = 'expense' } = req.query;
    const { start, end } = getPeriodRange(period, req.user);

    // Step 1: aggregate raw spend per catId
    const raw = await Transaction.aggregate([
      { $match: { userId: req.user._id, type, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$catId', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    // Step 2: resolve category metadata for each result
    // The $lookup approach only works for ObjectId refs; it silently returns nothing
    // for string slugs like 'food', 'salary'. We handle both cases in JS instead.
    const data = raw.map(item => {
      const id = item._id;
      let name = String(id || 'Other');
      let icon = '📦';
      let color = '#a0aec0';

      if (id && BUILTIN_CATS[id]) {
        // Built-in slug (e.g. 'food', 'salary')
        name  = BUILTIN_CATS[id].name;
        icon  = BUILTIN_CATS[id].icon;
        color = BUILTIN_CATS[id].color;
      } else if (item.catName) {
        // Stored inline in transaction.category subdoc
        name  = item.catName;
        icon  = item.catIcon  || '📦';
        color = item.catColor || '#a0aec0';
      }

      return { _id: id, total: item.total, count: item.count, name, icon, color };
    });

    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/stats/trend?period=weekly|monthly|yearly&months=3|6|12
exports.getTrend = async (req, res, next) => {
  try {
    const { period = 'monthly', months = 6 } = req.query;
    const uid = req.user._id;

    // ── Weekly: show daily bars for current week ──────────────────────────
    if (period === 'weekly') {
      const now   = new Date();
      const day   = now.getDay();
      const start = new Date(now); start.setDate(now.getDate() - day); start.setHours(0,0,0,0);
      const end   = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999);

      const data = await Transaction.aggregate([
        { $match: { userId: uid, date: { $gte: start, $lte: end }, type: { $in: ['income','expense'] } } },
        { $group: {
          _id:   { day: { $dayOfMonth:'$date' }, month: { $month:'$date' }, year: { $year:'$date' }, type:'$type' },
          total: { $sum: '$amount' },
        }},
        { $sort: { '_id.year':1, '_id.month':1, '_id.day':1 } },
      ]);

      const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const result = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start); d.setDate(start.getDate() + i);
        return { month: days[i], income: 0, expense: 0, date: d };
      });
      data.forEach(d => {
        const idx = new Date(d._id.year, d._id.month - 1, d._id.day).getDay();
        if (result[idx]) result[idx][d._id.type] = d.total;
      });
      return res.json({ success: true, data: result });
    }

    // ── Yearly: show monthly bars for current year ────────────────────────
    if (period === 'yearly') {
      const year  = new Date().getFullYear();
      const start = new Date(year, 0, 1, 0, 0, 0);
      const end   = new Date(year, 11, 31, 23, 59, 59);

      const data = await Transaction.aggregate([
        { $match: { userId: uid, date: { $gte: start, $lte: end }, type: { $in: ['income','expense'] } } },
        { $group: {
          _id:   { year: { $year:'$date' }, month: { $month:'$date' }, type:'$type' },
          total: { $sum: '$amount' },
        }},
        { $sort: { '_id.month':1 } },
      ]);

      const mNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const result = mNames.map(m => ({ month: m, income: 0, expense: 0 }));
      data.forEach(d => {
        const idx = d._id.month - 1;
        if (result[idx]) result[idx][d._id.type] = d.total;
      });
      return res.json({ success: true, data: result });
    }

    // ── Monthly (default): last N months ─────────────────────────────────
    // BUG FIX: Old code sorted by month abbreviation alphabetically which is wrong.
    // Fixed: store numeric year+month key for proper chronological sorting.
    const n   = parseInt(months) || 6;
    const end = new Date(); end.setHours(23,59,59,999);
    const start = new Date(); start.setMonth(start.getMonth() - n + 1); start.setDate(1); start.setHours(0,0,0,0);

    const data = await Transaction.aggregate([
      { $match: { userId: uid, date: { $gte: start, $lte: end }, type: { $in: ['income','expense'] } } },
      { $group: {
        _id:   { year: { $year:'$date' }, month: { $month:'$date' }, type:'$type' },
        total: { $sum: '$amount' },
      }},
      { $sort: { '_id.year':1, '_id.month':1 } },
    ]);

    // Build map keyed by "YYYY-MM" for correct chronological order
    const mmap = {};
    data.forEach(d => {
      const k = `${d._id.year}-${String(d._id.month).padStart(2,'0')}`;
      if (!mmap[k]) {
        mmap[k] = {
          month:    new Date(d._id.year, d._id.month - 1).toLocaleString('en', { month: 'short' }),
          year:     d._id.year,
          monthNum: d._id.month,
          income:   0,
          expense:  0,
        };
      }
      mmap[k][d._id.type] = d.total;
    });

    // Sort chronologically (year ASC, then month ASC)
    const sorted = Object.entries(mmap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({ month: v.month, income: v.income, expense: v.expense }));

    res.json({ success: true, data: sorted });
  } catch (err) { next(err); }
};

exports.getCalendar = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const y = parseInt(year)  || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;
    const start = new Date(y, m - 1, 1);
    const end   = new Date(y, m, 0, 23, 59, 59);

    const data = await Transaction.aggregate([
      { $match: { userId: req.user._id, date: { $gte: start, $lte: end } } },
      { $group: {
        _id:     { $dayOfMonth: '$date' },
        income:  { $sum: { $cond: [{ $eq: ['$type','income']  }, '$amount', 0] } },
        expense: { $sum: { $cond: [{ $eq: ['$type','expense'] }, '$amount', 0] } },
        count:   { $sum: 1 },
      }},
      { $sort: { '_id': 1 } },
    ]);

    res.json({ success: true, data });
  } catch (err) { next(err); }
};
