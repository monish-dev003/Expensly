import React, { useState, useMemo } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PageLayout from '../../components/ui/PageLayout';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import { useAuthStore, useAppStore } from '../../store/index.js';
import { Helmet } from 'react-helmet-async';
import { fmt, pct } from '../../utils/format.js';


export default function DebtsPage() {
  const { user } = useAuthStore();
  const { debts, addDebt, updateDebt, removeDebt, fetchDebts } = useAppStore();
  const [tab, setTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showPay, setShowPay] = useState(null);
  const [form, setForm] = useState({ type: 'owe', person: '', amount: '', dueDate: '', note: '' });
  const [payment, setPayment] = useState({ amount: '', note: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const sym = user?.currencySymbol || '₹';

  // bootstrap() already loads debts on app start

  const { filtered, totalOwe, totalLent, netBalance } = useMemo(() => {
    const f = tab === 'all' ? debts : debts.filter(d => d.type === tab);
    const owe  = debts.filter(d => d.type === 'owe' ).reduce((s,d) => s + Math.max(0, d.amount - (d.paid||0)), 0);
    const lent = debts.filter(d => d.type === 'lent').reduce((s,d) => s + Math.max(0, d.amount - (d.paid||0)), 0);
    return { filtered: f, totalOwe: owe, totalLent: lent, netBalance: lent - owe };
  }, [debts, tab]);

  const openCreate = () => {
    setForm({ type: 'owe', person: '', amount: '', dueDate: '', note: '' });
    setErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    const e = {};
    if (!form.person.trim()) e.person = 'Name required';
    if (!form.amount || parseFloat(form.amount) <= 0) e.amount = 'Enter valid amount';
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    const data = { ...form, amount: parseFloat(form.amount) };
    if (!data.dueDate) delete data.dueDate;
    const result = await addDebt(data);
    setSaving(false);
    if (result?.success !== false) setShowModal(false);
  };

  const handlePayment = async () => {
    if (!payment.amount || parseFloat(payment.amount) <= 0) return;
    setSaving(true);
    await updateDebt(showPay._id, { payment: parseFloat(payment.amount), note: payment.note });
    setSaving(false);
    setShowPay(null);
    setPayment({ amount: '', note: '' });
  };

  return (
    <PageLayout>
      <Helmet>
        <title>Debts & Loans — Expensly</title>
        <meta name="description" content="Track money you owe and amounts owed to you." />
      </Helmet>
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Debts & Loans</h1>
          <Button variant="default" size="sm" iconName="Plus" iconPosition="left" onClick={openCreate}>Add Entry</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-error/10 border border-error/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="TrendingDown" size={16} className="text-error" />
              <p className="text-xs font-medium text-error">I Owe</p>
            </div>
            <p className="text-2xl font-bold text-error">{fmt(totalOwe, sym)}</p>
          </div>
          <div className="bg-success/10 border border-success/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="TrendingUp" size={16} className="text-success" />
              <p className="text-xs font-medium text-success">Owed to Me</p>
            </div>
            <p className="text-2xl font-bold text-success">{fmt(totalLent, sym)}</p>
          </div>
          <div className={`border rounded-2xl p-5 ${netBalance >= 0 ? 'bg-primary/10 border-primary/20' : 'bg-warning/10 border-warning/20'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Scale" size={16} className={netBalance >= 0 ? 'text-primary' : 'text-warning'} />
              <p className={`text-xs font-medium ${netBalance >= 0 ? 'text-primary' : 'text-warning'}`}>Net Balance</p>
            </div>
            <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-primary' : 'text-warning'}`}>
              {netBalance >= 0 ? '+' : ''}{fmt(netBalance, sym)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[['all', 'All'], ['owe', 'I Owe'], ['lent', 'Owed to Me']].map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${tab === val ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
              {label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-3xl">🤝</div>
            <p className="font-semibold text-foreground">No entries yet</p>
            <p className="text-sm">Track money you owe or are owed.</p>
            <Button variant="default" size="sm" onClick={openCreate}>Add Entry</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(d => {
              const remaining = d.amount - (d.paid || 0);
              const pct = Math.min(100, Math.round(((d.paid || 0) / d.amount) * 100));
              const done = remaining <= 0;
              return (
                <div key={d._id} className={`bg-card border rounded-2xl p-5 transition-all ${d.type === 'owe' ? 'border-error/20' : 'border-success/20'} hover:shadow-financial-lg group`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${d.type === 'owe' ? 'bg-error' : 'bg-success'}`}>
                        {d.person?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{d.person}</p>
                        <p className={`text-xs font-medium ${d.type === 'owe' ? 'text-error' : 'text-success'}`}>
                          {d.type === 'owe' ? '📤 I owe them' : '📥 They owe me'}
                        </p>
                        {d.dueDate && <p className="text-xs text-muted-foreground">Due: {new Date(d.dueDate).toLocaleDateString('en-IN')}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className={`text-lg font-bold ${done ? 'text-success' : d.type === 'owe' ? 'text-error' : 'text-success'}`}>
                        {fmt(remaining, sym)}
                      </p>
                      <p className="text-xs text-muted-foreground">of {fmt(d.amount, sym)}</p>
                    </div>
                  </div>
                  {d.note && <p className="text-xs text-muted-foreground mt-2 italic">"{d.note}"</p>}
                  <div className="mt-3">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all bg-success" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{pct}% paid</span>
                      <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                        {!done && (
                          <button onClick={() => { setShowPay(d); setPayment({ amount: '', note: '' }); }}
                            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                            <Icon name="CheckCircle" size={12} /> Mark Payment
                          </button>
                        )}
                        <button onClick={() => removeDebt(d._id)} className="text-xs text-error hover:underline flex items-center gap-1">
                          <Icon name="Trash2" size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div role="dialog" aria-modal="true" className="bg-card rounded-2xl p-6 w-full max-w-md shadow-financial-lg border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">Add Debt Entry</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-muted"><Icon name="X" size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setForm(p => ({ ...p, type: 'owe' }))}
                    className={`py-3 rounded-xl text-sm font-medium transition-all border ${form.type === 'owe' ? 'bg-error/10 text-error border-error/30' : 'bg-muted text-muted-foreground border-transparent'}`}>
                    📤 I Owe
                  </button>
                  <button type="button" onClick={() => setForm(p => ({ ...p, type: 'lent' }))}
                    className={`py-3 rounded-xl text-sm font-medium transition-all border ${form.type === 'lent' ? 'bg-success/10 text-success border-success/30' : 'bg-muted text-muted-foreground border-transparent'}`}>
                    📥 Owed to Me
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Person's Name *</label>
                <input value={form.person} onChange={e => setForm(p => ({ ...p, person: e.target.value }))} placeholder="e.g. Rahul"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                {errors.person && <p className="text-xs text-error mt-1">{errors.person}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Amount *</label>
                <input type="number" inputMode="decimal" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                {errors.amount && <p className="text-xs text-error mt-1">{errors.amount}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Due Date (optional)</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Note (optional)</label>
                <input value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="What is this for?"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <Button variant="default" fullWidth size="lg" loading={saving} onClick={handleSave}>Add Entry</Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPay && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowPay(null)}>
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full border border-border shadow-financial-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Mark Payment — {showPay.person}</h3>
              <button onClick={() => setShowPay(null)} className="p-1.5 rounded-lg hover:bg-muted"><Icon name="X" size={16} /></button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Remaining: <strong>{fmt(showPay.amount - (showPay.paid || 0), sym)}</strong>
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Amount Paid *</label>
                <input type="number" inputMode="decimal" value={payment.amount} onChange={e => setPayment(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" autoFocus
                  className="w-full h-10 px-3 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Note (optional)</label>
                <input value={payment.note} onChange={e => setPayment(p => ({ ...p, note: e.target.value }))} placeholder="e.g. Paid via UPI"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" fullWidth onClick={() => setShowPay(null)}>Cancel</Button>
                <Button variant="default" fullWidth loading={saving} onClick={handlePayment}>Save Payment</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <FloatingActionButton />
    </PageLayout>
  );
}