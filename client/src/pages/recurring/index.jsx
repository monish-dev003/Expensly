import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Icon from '../../components/AppIcon';
import PageLayout from '../../components/ui/PageLayout';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import { useAuthStore, useAppStore } from '../../store/index';
import { recurringAPI } from '../../api/index';
import { BUILTIN_CATS, EXPENSE_CAT_IDS, INCOME_CAT_IDS } from '../../utils/categories';
import { fmt } from '../../utils/format';
import toast from 'react-hot-toast';

const FREQ_LABELS = {
  daily:     { label: 'Daily',     icon: '📅' },
  weekly:    { label: 'Weekly',    icon: '📆' },
  biweekly:  { label: 'Bi-weekly', icon: '🗓️' },
  monthly:   { label: 'Monthly',   icon: '🗃️' },
  quarterly: { label: 'Quarterly', icon: '📊' },
  yearly:    { label: 'Yearly',    icon: '🎯' },
};

const TYPE_COLOR = {
  income:   { text: 'text-success', bg: 'bg-success/10', border: 'border-success/20', sign: '+' },
  expense:  { text: 'text-error',   bg: 'bg-error/10',   border: 'border-error/20',   sign: '−' },
  transfer: { text: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', sign: '↔️' },
};

const EMPTY_FORM = {
  name: '', frequency: 'monthly', nextDate: '',
  endDate: '', type: 'expense', amount: '', catId: '', walletId: '', note: '',
};

export default function RecurringPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { wallets } = useAppStore();
  const sym = user?.currencySymbol || '₹';
  const modalRef = useRef(null);

  const [rules,     setRules]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRule,  setEditRule]  = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [errors,    setErrors]    = useState({});
  const [saving,    setSaving]    = useState(false);
  const [delId,     setDelId]     = useState(null);
  const [tab,       setTab]       = useState('all');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    recurringAPI.getAll()
      .then(r => { if (!cancelled) setRules(r.data.data || []); })
      .catch(() => { if (!cancelled) setRules([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const displayed = useMemo(() => {
    if (tab === 'active') return rules.filter(r => r.isActive);
    if (tab === 'paused') return rules.filter(r => !r.isActive);
    return rules;
  }, [rules, tab]);

  const totals = useMemo(() => {
    const active = rules.filter(r => r.isActive);
    return {
      income:  active.filter(r => r.templateData?.type === 'income').reduce((s,r) => s + (r.templateData?.amount || 0), 0),
      expense: active.filter(r => r.templateData?.type === 'expense').reduce((s,r) => s + (r.templateData?.amount || 0), 0),
    };
  }, [rules]);

  const openCreate = () => {
    setEditRule(null);
    setForm({ ...EMPTY_FORM, nextDate: new Date().toISOString().slice(0, 10), walletId: wallets[0]?._id || '' });
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (rule) => {
    setEditRule(rule);
    setForm({
      name:      rule.name,
      frequency: rule.frequency,
      nextDate:  rule.nextDate  ? new Date(rule.nextDate).toISOString().slice(0,10) : '',
      endDate:   rule.endDate   ? new Date(rule.endDate).toISOString().slice(0,10)  : '',
      type:      rule.templateData?.type     || 'expense',
      amount:    String(rule.templateData?.amount || ''),
      catId:     rule.templateData?.catId    || '',
      walletId:  rule.templateData?.walletId || wallets[0]?._id || '',
      note:      rule.templateData?.note     || '',
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                            e.name     = 'Name required';
    if (!form.amount || parseFloat(form.amount) <= 0) e.amount   = 'Enter a valid amount';
    if (!form.walletId)                               e.walletId = 'Select a wallet';
    if (!form.nextDate)                               e.nextDate = 'Select a next date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name:      form.name.trim(),
      frequency: form.frequency,
      nextDate:  form.nextDate,
      endDate:   form.endDate || null,
      templateData: {
        type:     form.type,
        amount:   parseFloat(form.amount),
        catId:    form.catId || 'other',
        walletId: form.walletId,
        note:     form.note,
      },
    };
    try {
      if (editRule) {
        const r = await recurringAPI.update(editRule._id, payload);
        setRules(rs => rs.map(x => x._id === editRule._id ? r.data.data : x));
        toast.success('Recurring rule updated ✓');
      } else {
        const r = await recurringAPI.create(payload);
        setRules(rs => [r.data.data, ...rs]);
        toast.success('Recurring rule created ✓');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save.');
    }
    setSaving(false);
  };

  const handleToggle = async (rule) => {
    try {
      const r = await recurringAPI.toggle(rule._id);
      setRules(rs => rs.map(x => x._id === rule._id ? r.data.data : x));
      toast.success(r.data.message);
    } catch { toast.error('Failed to toggle.'); }
  };

  const handleDelete = async (id) => {
    try {
      await recurringAPI.remove(id);
      setRules(rs => rs.filter(x => x._id !== id));
      toast.success('Deleted.');
      setDelId(null);
    } catch { toast.error('Failed to delete.'); }
  };

  const cats = form.type === 'income' ? INCOME_CAT_IDS : EXPENSE_CAT_IDS;

  return (
    <PageLayout>
      <Helmet>
        <title>Recurring Transactions — Expensly</title>
        <meta name="description" content="Manage your recurring income, expense, and transfer rules." />
      </Helmet>

      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Recurring</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Auto-transactions on a schedule</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-sm">
            <Icon name="Plus" size={15} /> New Rule
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8 space-y-5">

        {rules.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-2xl p-4 text-center">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Active Rules</p>
              <p className="text-2xl font-extrabold text-foreground">{rules.filter(r => r.isActive).length}</p>
            </div>
            <div className="bg-success/10 border border-success/20 rounded-2xl p-4 text-center">
              <p className="text-[10px] font-semibold text-success uppercase tracking-wide mb-1">Monthly Income</p>
              <p className="text-xl font-extrabold text-success">{fmt(totals.income, sym)}</p>
            </div>
            <div className="bg-error/10 border border-error/20 rounded-2xl p-4 text-center">
              <p className="text-[10px] font-semibold text-error uppercase tracking-wide mb-1">Monthly Expense</p>
              <p className="text-xl font-extrabold text-error">{fmt(totals.expense, sym)}</p>
            </div>
          </div>
        )}

        {rules.length > 0 && (
          <div className="flex gap-2">
            {[['all','All'], ['active','Active'], ['paused','Paused']].map(([v, l]) => (
              <button key={v} onClick={() => setTab(v)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all
                  ${tab === v ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                {l}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/10 to-emerald-500/10 border-2 border-dashed border-primary/20 flex items-center justify-center text-4xl">
              🔄
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground text-lg mb-1">No recurring rules yet</p>
              <p className="text-sm max-w-xs leading-relaxed">
                Set up rules for salary, rent, subscriptions — they'll create transactions automatically.
              </p>
            </div>
            <button onClick={openCreate}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all">
              + Create First Rule
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {displayed.map((rule, i) => {
                const td     = rule.templateData || {};
                const tc     = TYPE_COLOR[td.type] || TYPE_COLOR.expense;
                const freq   = FREQ_LABELS[rule.frequency] || { label: rule.frequency, icon: '🔄' };
                const cat    = BUILTIN_CATS[td.catId];
                const wallet = wallets.find(w => w._id === (td.walletId?._id || td.walletId));
                const nextDate = rule.nextDate
                  ? new Date(rule.nextDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—';

                return (
                  <motion.div key={rule._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: i * 0.04 }}
                    className={`bg-card border rounded-2xl p-5 transition-all hover:shadow-md
                      ${rule.isActive ? 'border-border' : 'border-dashed border-muted-foreground/30 opacity-60'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${tc.bg} border ${tc.border}`}>
                        {cat?.icon || (td.type === 'income' ? '💰' : td.type === 'transfer' ? '🔄' : '💸')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground">{rule.name}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tc.bg} ${tc.text}`}>
                            {td.type}
                          </span>
                          {!rule.isActive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              PAUSED
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1.5">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <span>{freq.icon}</span> {freq.label}
                          </span>
                          {wallet && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Icon name="Wallet" size={11} /> {wallet.name}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Icon name="Calendar" size={11} /> Next: {nextDate}
                          </span>
                        </div>
                        {td.note && <p className="text-xs text-muted-foreground mt-1 italic">"{td.note}"</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <p className={`text-xl font-extrabold tabular-nums ${tc.text}`}>
                          {tc.sign}{fmt(td.amount || 0, sym)}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handleToggle(rule)}
                            className={`p-1.5 rounded-lg transition-all text-xs font-medium flex items-center gap-1
                              ${rule.isActive
                                ? 'bg-warning/10 text-warning hover:bg-warning/20'
                                : 'bg-success/10 text-success hover:bg-success/20'}`}>
                            <Icon name={rule.isActive ? 'Pause' : 'Play'} size={13} />
                            {rule.isActive ? 'Pause' : 'Resume'}
                          </button>
                          <button onClick={() => openEdit(rule)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-all">
                            <Icon name="Edit2" size={14} />
                          </button>
                          <button onClick={() => setDelId(rule._id)}
                            className="p-1.5 rounded-lg hover:bg-error/10 text-muted-foreground hover:text-error transition-all">
                            <Icon name="Trash2" size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 p-4"
            onClick={() => setShowModal(false)}>
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              ref={modalRef}
              role="dialog" aria-modal="true" aria-labelledby="rec-modal-title"
              className="bg-card rounded-2xl w-full max-w-lg border border-border shadow-lg max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>

              <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
                <h2 id="rec-modal-title" className="font-bold text-foreground text-lg">
                  {editRule ? 'Edit Recurring Rule' : 'New Recurring Rule'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-muted transition-all">
                  <Icon name="X" size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Rule Name *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Monthly Rent, Netflix Subscription"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Transaction Type *</label>
                  <div className="flex rounded-xl bg-muted p-1 gap-1">
                    {['expense', 'income', 'transfer'].map(t => (
                      <button key={t} type="button" onClick={() => setForm(p => ({ ...p, type: t, catId: '' }))}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-all
                          ${form.type === t
                            ? `bg-card shadow-sm ${TYPE_COLOR[t].text}`
                            : 'text-muted-foreground hover:text-foreground'}`}>
                        {t === 'expense' ? '💸' : t === 'income' ? '💰' : '🔄'} {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Amount *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">{sym}</span>
                    <input type="number" min="0.01" step="0.01" inputMode="decimal"
                      value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                      placeholder="0.00"
                      className="w-full h-10 pl-8 pr-3 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  {errors.amount && <p className="text-xs text-error mt-1">{errors.amount}</p>}
                </div>

                {form.type !== 'transfer' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
                    <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                      {cats.map(id => {
                        const cat = BUILTIN_CATS[id];
                        return (
                          <button key={id} type="button" onClick={() => setForm(p => ({ ...p, catId: id }))}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs transition-all
                              ${form.catId === id
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border hover:bg-muted text-muted-foreground'}`}>
                            <span className="text-xl">{cat.icon}</span>
                            <span className="font-medium text-center leading-tight text-[9px]">{cat.name.split('/')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Wallet *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {wallets.map(w => (
                      <button key={w._id} type="button" onClick={() => setForm(p => ({ ...p, walletId: w._id }))}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all
                          ${form.walletId === w._id
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted border-transparent hover:border-border'}`}>
                        <span className="text-lg">{w.icon}</span>
                        <span className="text-xs font-semibold truncate">{w.name}</span>
                      </button>
                    ))}
                  </div>
                  {errors.walletId && <p className="text-xs text-error mt-1">{errors.walletId}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Frequency *</label>
                    <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                      {Object.entries(FREQ_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v.icon} {v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Next Date *</label>
                    <input type="date" value={form.nextDate} onChange={e => setForm(p => ({ ...p, nextDate: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    {errors.nextDate && <p className="text-xs text-error mt-1">{errors.nextDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">End Date <span className="text-muted-foreground font-normal">(opt)</span></label>
                    <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Note <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <input value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                    placeholder="What's this for?"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>

                <button onClick={handleSave} disabled={saving}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-emerald-500 hover:opacity-90 disabled:opacity-60 transition-all shadow-sm flex items-center justify-center gap-2">
                  {saving
                    ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
                    : editRule ? '💾 Save Changes' : '✅ Create Rule'
                  }
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      {delId && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDelId(null)}>
          <div role="dialog" aria-modal="true"
            className="bg-card rounded-2xl p-6 w-full max-w-sm border border-border text-center shadow-lg"
            onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Trash2" size={24} className="text-error" />
            </div>
            <h3 className="font-bold text-foreground mb-1">Delete this rule?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Existing transactions won't be affected, but no new ones will be created.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDelId(null)}
                className="flex-1 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-all">
                Cancel
              </button>
              <button onClick={() => handleDelete(delId)}
                className="flex-1 py-2.5 rounded-xl bg-error text-white text-sm font-semibold hover:opacity-90 transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <FloatingActionButton />
    </PageLayout>
  );
}