import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PageLayout from '../../components/ui/PageLayout';
import { useAuthStore, useAppStore } from '../../store/index.js';
import toast from 'react-hot-toast';
import { BUILTIN_CATS, EXPENSE_CAT_IDS, INCOME_CAT_IDS } from '../../utils/categories.js';
import { Helmet } from 'react-helmet-async';



const TYPE_CONFIG = {
  expense: { label: 'Expense', color: '#EF4444', bg: 'bg-red-500/10', text: 'text-red-500', sign: '-' },
  income: { label: 'Income', color: '#10B981', bg: 'bg-emerald-500/10', text: 'text-emerald-500', sign: '+' },
  transfer: { label: 'Transfer', color: '#6366F1', bg: 'bg-indigo-500/10', text: 'text-indigo-500', sign: '↔' },
};

export default function AddTransaction() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuthStore();
  const { wallets, transactions, addTransaction, editTransaction, loading } = useAppStore();
  const sym = user?.currencySymbol || '₹';

  // Edit mode: URL has ?edit=<transactionId>
  const editId = params.get('edit');
  const isEdit = Boolean(editId);

  const [type, setType] = useState('expense');
  const [form, setForm] = useState({
    amount: '', catId: '', walletId: '', toWalletId: '',
    date: new Date().toISOString().split('T')[0],
    note: '', tags: '', isRecurring: false,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // ── Load wallets default ───────────────────────────────────────────────────
  useEffect(() => {
    if (wallets.length && !form.walletId && !isEdit) {
      setForm(p => ({ ...p, walletId: wallets[0]._id }));
    }
  }, [wallets]);

  // ── Load existing transaction for edit mode ────────────────────────────────
  useEffect(() => {
    if (!isEdit || loaded) return;

    // Try from store first
    const existing = transactions.find(t => t._id === editId);
    if (existing) {
      populateForm(existing);
      setLoaded(true);
      return;
    }

    // Fetch from API if not in store
    import('../../api/index.js').then(({ transactionAPI }) => {
      transactionAPI.getOne(editId)
        .then(r => {
          populateForm(r.data.data);
          setLoaded(true);
        })
        .catch(() => {
          toast.error('Transaction not found');
          navigate(-1);
        });
    });
  }, [editId, transactions, isEdit]);

  const populateForm = (t) => {
    setType(t.type);
    setForm({
      amount: String(t.amount),
      catId: t.category?.slug || t.catId || '',
      walletId: t.walletId?._id || t.walletId || '',
      toWalletId: t.toWalletId?._id || t.toWalletId || '',
      date: t.date ? new Date(t.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      note: t.note || '',
      tags: Array.isArray(t.tags) ? t.tags.join(', ') : '',
      isRecurring: t.isRecurring || false,
    });
  };

  const cats = type === 'income' ? INCOME_CAT_IDS : EXPENSE_CAT_IDS;
  const tc = TYPE_CONFIG[type];

  const validate = () => {
    const e = {};
    if (!form.amount || parseFloat(form.amount) <= 0) e.amount = 'Enter a valid amount';
    if (!form.walletId) e.walletId = 'Select a wallet';
    if (type === 'transfer' && !form.toWalletId) e.toWalletId = 'Select destination wallet';
    if (type === 'transfer' && form.walletId === form.toWalletId) e.toWalletId = 'Source and destination must be different';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    const payload = {
      type,
      amount: parseFloat(form.amount),
      catId: form.catId || 'other',
      walletId: form.walletId,
      toWalletId: type === 'transfer' ? form.toWalletId : undefined,
      date: form.date,
      note: form.note,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };

    let result;
    if (isEdit) {
      result = await editTransaction(editId, payload);
    } else {
      result = await addTransaction(payload);
    }

    setSaving(false);
    if (result?.success) navigate(-1);
  };

  const selectedWallet = wallets.find(w => w._id === form.walletId);
  const selectedCat = BUILTIN_CATS[form.catId];
  const amount = parseFloat(form.amount) || 0;

  return (
    <PageLayout>
      <Helmet>
        <title>Add Transaction — Expensly</title>
        <meta name="description" content="Record a new income, expense, or wallet transfer." />
      </Helmet>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-muted transition-all">
            <Icon name="ArrowLeft" size={20} className="text-foreground" />
          </button>
          <h1 className="font-semibold text-foreground">
            {isEdit ? 'Edit Transaction' : 'Add Transaction'}
          </h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 pb-28 ">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Type Toggle */}
          <div className="flex rounded-2xl bg-muted p-1 gap-1">
            {['expense', 'income', 'transfer'].map(t => {
              const cfg = TYPE_CONFIG[t];
              return (
                <button key={t} type="button"
                  onClick={() => { setType(t); setForm(p => ({ ...p, catId: '' })); }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-xl capitalize transition-all flex items-center justify-center gap-1.5 ${type === t ? `bg-card shadow-sm ${cfg.text}` : 'text-muted-foreground hover:text-foreground'
                    }`}>
                  <span className="text-base">
                    {t === 'expense' ? '💸' : t === 'income' ? '💰' : '🔄'}
                  </span>
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Amount input */}
          <div className={`rounded-2xl border-2 p-5 text-center transition-all ${tc.bg} ${type === 'expense' ? 'border-red-500/30' : type === 'income' ? 'border-emerald-500/30' : 'border-indigo-500/30'
            }`}>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">{tc.label} Amount</p>
            <div className="flex items-center justify-center gap-2">
              <span className={`text-2xl font-bold ${tc.text}`}>{tc.sign}</span>
              <span className="text-3xl font-bold text-muted-foreground/50">{sym}</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                placeholder="0.00"
                autoFocus={!isEdit}
                style={{ MozAppearance: 'textfield' }}
                className={`text-4xl font-bold bg-transparent border-none outline-none text-center w-40 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${tc.text}`}
              />
            </div>
            {amount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {sym}{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            )}
            {errors.amount && <p className="text-xs text-error mt-2">{errors.amount}</p>}
            {/* Quick amount presets */}
            {!isEdit && (
              <div className="flex gap-1.5 justify-center flex-wrap mt-3">
                {[100, 500, 1000, 2000, 5000].map(amt => (
                  <button key={amt} type="button"
                    onClick={() => setForm(p => ({ ...p, amount: String((parseFloat(p.amount) || 0) + amt) }))}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all border border-border hover:border-primary/30">
                    +{sym}{amt.toLocaleString('en-IN')}
                  </button>
                ))}
                {form.amount && (
                  <button type="button"
                    onClick={() => setForm(p => ({ ...p, amount: '' }))}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-error/10 text-error hover:bg-error/20 transition-all border border-error/20">
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Category grid */}
          {type !== 'transfer' && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Category</p>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {cats.map(id => {
                  const cat = BUILTIN_CATS[id];
                  return (
                    <button key={id} type="button"
                      onClick={() => setForm(p => ({ ...p, catId: id }))}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all border ${form.catId === id
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-transparent hover:border-border hover:bg-muted/50'
                        }`}>
                      <span className="text-2xl">{cat.icon}</span>
                      <span className={`text-[9px] font-medium text-center leading-tight ${form.catId === id ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                        {cat.name.split('/')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
              {selectedCat && (
                <p className="text-xs text-center mt-2 text-muted-foreground">
                  Selected: {selectedCat.icon} <span className="text-foreground font-medium">{selectedCat.name}</span>
                </p>
              )}
            </div>
          )}

          {/* Wallet selector */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {type === 'transfer' ? 'From Wallet' : 'Wallet'}
            </p>
            {wallets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                No wallets. <button type="button" onClick={() => navigate('/wallets')} className="text-primary hover:underline">Add one →</button>
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {wallets.map(w => (
                  <button key={w._id} type="button" onClick={() => setForm(p => ({ ...p, walletId: w._id }))}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${form.walletId === w._id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted border-transparent hover:border-border'
                      }`}>
                    <span className="text-lg">{w.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{w.name}</p>
                      <p className={`text-[10px] ${form.walletId === w._id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {sym}{(w.balance || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {errors.walletId && <p className="text-xs text-error mt-2">{errors.walletId}</p>}
          </div>

          {/* To Wallet (transfer only) */}
          {type === 'transfer' && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">To Wallet</p>
              <div className="grid grid-cols-2 gap-2">
                {wallets.filter(w => w._id !== form.walletId).map(w => (
                  <button key={w._id} type="button" onClick={() => setForm(p => ({ ...p, toWalletId: w._id }))}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${form.toWalletId === w._id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted border-transparent hover:border-border'
                      }`}>
                    <span className="text-lg">{w.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{w.name}</p>
                    </div>
                  </button>
                ))}
              </div>
              {errors.toWalletId && <p className="text-xs text-error mt-2">{errors.toWalletId}</p>}
            </div>
          )}

          {/* Date + Note */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Note <span className="text-muted-foreground/50 font-normal normal-case">(optional)</span>
              </label>
              <input
                value={form.note}
                onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                placeholder="What was this for?"
                maxLength={200}
                className="w-full h-10 px-3 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Tags <span className="text-muted-foreground/50 font-normal normal-case">(optional, comma-separated)</span>
              </label>
              <input
                value={form.tags}
                onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                placeholder="e.g. work, personal, urgent"
                className="w-full h-10 px-3 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={saving || loading.addTransaction}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${saving
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:opacity-90 shadow-lg active:scale-[0.98]'
              }`}>
            {saving
              ? <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {isEdit ? 'Saving Changes…' : 'Adding Transaction…'}
              </span>
              : isEdit ? '💾 Save Changes' : `${tc.sign} Add ${tc.label}`
            }
          </button>

        </form>
      </main>
    </PageLayout>
  );
}