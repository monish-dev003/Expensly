import React, { useState, useMemo } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PageLayout from '../../components/ui/PageLayout';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import { useAuthStore, useAppStore } from '../../store/index.js';
import { BUILTIN_CATS } from '../../utils/categories.js';
import { Helmet } from 'react-helmet-async';
import { fmt, pct } from '../../utils/format.js';



const getCat = (b) => ({
  name: b.catName || BUILTIN_CATS[b.catId]?.name || String(b.catId || 'Budget'),
  icon: b.catIcon || BUILTIN_CATS[b.catId]?.icon || '📦',
  color: b.catColor || BUILTIN_CATS[b.catId]?.color || '#a0aec0',
});

export default function BudgetsPage() {
  const { user } = useAuthStore();
  const { budgets, addBudget, updateBudget, removeBudget, fetchBudgets } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [form, setForm] = useState({ catId: '', limit: '', period: 'monthly', alertThreshold: 80 });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const sym = user?.currencySymbol || '₹';

  // bootstrap() in App.jsx already loads budgets

  const { totalBudget, totalSpent, overBudget } = useMemo(() => ({
    totalBudget: budgets.reduce((s, b) => s + b.limit, 0),
    totalSpent:  budgets.reduce((s, b) => s + (b.spent || 0), 0),
    overBudget:  budgets.filter(b => (b.spent || 0) > b.limit),
  }), [budgets]);

  const openCreate = () => {
    setEditBudget(null);
    setForm({ catId: '', limit: '', period: 'monthly', alertThreshold: 80 });
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (b) => {
    setEditBudget(b);
    setForm({ catId: b.catId, limit: b.limit, period: b.period, alertThreshold: b.alertThreshold || 80 });
    setErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    const e = {};
    if (!form.catId) e.catId = 'Select a category';
    if (!form.limit || parseFloat(form.limit) <= 0) e.limit = 'Enter valid amount';
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    const cat = BUILTIN_CATS[form.catId] || { name: 'Budget', icon: '📦', color: '#a0aec0' };
    const data = {
      catId: form.catId, catName: cat.name, catIcon: cat.icon, catColor: cat.color,
      limit: parseFloat(form.limit), period: form.period, alertThreshold: Number(form.alertThreshold),
    };

    let result;
    if (editBudget) {
      result = await updateBudget(editBudget._id, data);
    } else {
      result = await addBudget(data);
    }
    setSaving(false);
    if (result?.success !== false) setShowModal(false);
  };

  return (
    <PageLayout>
      <Helmet>
        <title>Budgets — Expensly</title>
        <meta name="description" content="Set and track monthly spending limits by category." />
      </Helmet>
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Budgets</h1>
          <Button variant="default" size="sm" iconName="Plus" iconPosition="left" onClick={openCreate}>Add Budget</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Budget', val: fmt(totalBudget, sym), icon: 'PieChart', color: 'text-primary' },
            { label: 'Total Spent', val: fmt(totalSpent, sym), icon: 'TrendingUp', color: 'text-error' },
            { label: 'Remaining', val: fmt(totalBudget - totalSpent, sym), icon: 'Wallet', color: totalBudget - totalSpent >= 0 ? 'text-success' : 'text-error' },
          ].map(({ label, val, icon, color }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center shrink-0">
                <Icon name={icon} size={18} className={color} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-base font-bold ${color}`}>{val}</p>
              </div>
            </div>
          ))}
        </div>

        {overBudget.length > 0 && (
          <div className="bg-error/10 border border-error/20 rounded-xl p-4 mb-5 flex items-center gap-3">
            <Icon name="AlertTriangle" size={18} className="text-error shrink-0" />
            <p className="text-sm text-error font-medium">
              <strong>{overBudget.length}</strong> budget{overBudget.length > 1 ? 's' : ''} exceeded this period!
            </p>
          </div>
        )}

        {budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-3xl">🎯</div>
            <p className="font-semibold text-foreground">No budgets yet</p>
            <p className="text-sm text-center max-w-xs">Set spending limits for categories and track progress automatically.</p>
            <Button variant="default" size="sm" onClick={openCreate}>Create Budget</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map(b => {
              const cat = getCat(b);
              const pct = Math.min(100, Math.round(((b.spent || 0) / b.limit) * 100));
              const over = (b.spent || 0) > b.limit;
              const warn = !over && pct >= (b.alertThreshold || 80);
              const barColor = over ? '#EF4444' : warn ? '#F59E0B' : '#10B981';
              return (
                <div key={b._id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-financial-lg transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: cat.color + '22' }}>
                        {cat.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{cat.name}</p>
                        <span className="text-xs text-muted-foreground capitalize">{b.period}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                      <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Icon name="Edit" size={13} /></button>
                      <button onClick={() => removeBudget(b._id)} className="p-1.5 rounded-lg hover:bg-error/10 text-muted-foreground hover:text-error"><Icon name="Trash2" size={13} /></button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-muted-foreground">{fmt(b.spent || 0, sym)} spent</span>
                    <span className="font-medium text-foreground">{fmt(b.limit, sym)} limit</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${over ? 'text-error' : warn ? 'text-warning' : 'text-success'}`}>
                      {over ? '🔴 Over budget' : warn ? '⚠️ Near limit' : '✅ On track'}
                    </span>
                    <span className="text-xs text-muted-foreground">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div role="dialog" aria-modal="true" className="bg-card rounded-2xl p-6 w-full max-w-md shadow-financial-lg border border-border max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">{editBudget ? 'Edit Budget' : 'Add Budget'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-muted"><Icon name="X" size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {Object.entries(BUILTIN_CATS).map(([id, cat]) => (
                    <button key={id} type="button" onClick={() => setForm(p => ({ ...p, catId: id }))}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all text-xs ${form.catId === id ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted text-muted-foreground'
                        }`}>
                      <span className="text-xl">{cat.icon}</span>
                      <span className="font-medium text-center leading-tight">{cat.name.split('/')[0]}</span>
                    </button>
                  ))}
                </div>
                {errors.catId && <p className="text-xs text-error mt-1">{errors.catId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Limit Amount *</label>
                <input type="number" inputMode="decimal" value={form.limit} onChange={e => setForm(p => ({ ...p, limit: e.target.value }))} placeholder="e.g. 5000"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                {errors.limit && <p className="text-xs text-error mt-1">{errors.limit}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Period</label>
                <div className="flex gap-2">
                  {['weekly', 'monthly', 'yearly'].map(p => (
                    <button key={p} type="button" onClick={() => setForm(f => ({ ...f, period: p }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${form.period === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{p}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Alert at {form.alertThreshold}%</label>
                <input type="range" min="50" max="95" step="5" value={form.alertThreshold} onChange={e => setForm(p => ({ ...p, alertThreshold: Number(e.target.value) }))} className="w-full" />
              </div>
              <Button variant="default" fullWidth size="lg" loading={saving} onClick={handleSave}>
                {editBudget ? 'Save Changes' : 'Create Budget'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <FloatingActionButton />
    </PageLayout>
  );
}
