const cron = require('node-cron');
const { Recurring, Transaction, Wallet } = require('../models/index');

const addDays   = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n);       return r; };
const addWeeks  = (d, n) => addDays(d, n * 7);
const addMonths = (d, n) => { const r = new Date(d); r.setMonth(r.getMonth() + n);     return r; };
const addYears  = (d, n) => { const r = new Date(d); r.setFullYear(r.getFullYear() + n); return r; };

const getNext = (date, freq) => {
  switch (freq) {
    case 'daily':     return addDays(date, 1);
    case 'weekly':    return addWeeks(date, 1);
    case 'biweekly':  return addWeeks(date, 2);
    case 'monthly':   return addMonths(date, 1);
    case 'quarterly': return addMonths(date, 3);
    case 'yearly':    return addYears(date, 1);
    default:          return addMonths(date, 1);
  }
};

const processRecurring = async () => {
  const now = new Date();
  console.log(`⏰ [CRON] Processing recurring transactions at ${now.toISOString()}`);

  try {
    const dues = await Recurring.find({ isActive: true, nextDate: { $lte: now } });
    console.log(`   → Found ${dues.length} due recurring rule(s).`);

    for (const rule of dues) {
      try {
        const tmpl = rule.templateData;

        // Create the transaction
        const txn = await Transaction.create({
          userId:      rule.userId,
          type:        tmpl.type,
          amount:      tmpl.amount,
          catId:       tmpl.catId,
          walletId:    tmpl.walletId,
          toWalletId:  tmpl.toWalletId,
          note:        tmpl.note || '',
          date:        new Date(rule.nextDate),
          isRecurring: true,
          recurringId: rule._id,
        });

        // Update wallet balance
        const wallet = await Wallet.findById(tmpl.walletId);
        if (wallet) {
          if (tmpl.type === 'income')   wallet.balance += tmpl.amount;
          if (tmpl.type === 'expense')  wallet.balance -= tmpl.amount;
          await wallet.save();
        }
        if (tmpl.type === 'transfer' && tmpl.toWalletId) {
          const toW = await Wallet.findById(tmpl.toWalletId);
          if (toW) { toW.balance += tmpl.amount; await toW.save(); }
        }

        // Track and advance nextDate
        rule.createdTransactions.push(txn._id);
        const next = getNext(rule.nextDate, rule.frequency);
        if (rule.endDate && next > rule.endDate) {
          rule.isActive = false;
          console.log(`   ✅ Rule ${rule._id} completed (past end date).`);
        } else {
          rule.nextDate = next;
        }
        await rule.save();
        console.log(`   ✅ Created recurring txn ${txn._id} for user ${rule.userId}`);
      } catch (e) {
        console.error(`   ❌ Failed to process rule ${rule._id}:`, e.message);
      }
    }
  } catch (err) {
    console.error('❌ [CRON] Recurring job error:', err);
  }
};

// Run every day at midnight
const startRecurringJob = () => {
  cron.schedule('0 0 * * *', processRecurring, { timezone: 'Asia/Kolkata' });
  console.log('✅ Recurring transaction job scheduled (daily @ midnight IST)');
};

module.exports = { startRecurringJob, processRecurring };
