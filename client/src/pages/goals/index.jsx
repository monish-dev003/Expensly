import React, { useState, useMemo } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PageLayout from '../../components/ui/PageLayout';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import { useAuthStore, useAppStore } from '../../store/index.js';
import { Helmet } from 'react-helmet-async';
import { fmt, pct } from '../../utils/format.js';

const ICONS = ['🎯', '🏠', '🚗', '✈️', '💍', '📱', '💻', '🎓', '🏖️', '💰', '🏋️', '🎸', '📷', '🎮', '👗'];
const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function GoalsPage() {
  const { user } = useAuthStore();
  const { goals, addGoal, updateGoal, removeGoal, fetchGoals } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [showContrib, setShowContrib] = useState(null);
  const [editGoal, setEditGoal] = useState(null);
  const [form, setForm] = useState({ name: '', targetAmount: '', currentAmount: '', icon: '🎯', color: '#2563EB', targetDate: '' });
  const [contrib, setContrib] = useState({ amount: '', note: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const sym = user?.currencySymbol || '₹';

  // bootstrap() already loads goals on app start

  const { totalSaved, totalTarget, completed } = useMemo(() => ({
    totalSaved:  goals.reduce((s, g) => s + (g.currentAmount || 0), 0),
    totalTarget: goals.reduce((s, g) => s + (g.targetAmount || 0), 0),
    completed:   goals.filter(g => (g.currentAmount || 0) >= (g.targetAmount || 1)).length,
  }), [goals]);

  const openCreate = () => {
    setEditGoal(null);
    setForm({ name: '', targetAmount: '', currentAmount: '', icon: '🎯', color: '#2563EB', targetDate: '' });
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (g) => {
    setEditGoal(g);
    setForm({ name: g.name, targetAmount: g.targetAmount, currentAmount: g.currentAmount, icon: g.icon || '🎯', color: g.color || '#2563EB', targetDate: g.targetDate ? new Date(g.targetDate).toISOString().split('T')[0] : '' });
    setErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.targetAmount || parseFloat(form.targetAmount) <= 0) e.targetAmount = 'Enter target amount';
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    const data = { ...form, targetAmount: parseFloat(form.targetAmount), currentAmount: parseFloat(form.currentAmount) || 0 };
    // Remove targetDate if empty
    if (!data.targetDate) delete data.targetDate;
    let result;
    if (editGoal) result = await updateGoal(editGoal._id, data);
    else result = await addGoal(data);
    setSaving(false);
    if (result?.success !== false) setShowModal(false);
  };

  const handleContrib = async () => {
    if (!contrib.amount || parseFloat(contrib.amount) <= 0) return;
    setSaving(true);
    await updateGoal(showContrib._id, { contribute: parseFloat(contrib.amount), note: contrib.note });
    setSaving(false);
    setShowContrib(null);
    setContrib({ amount: '', note: '' });
  };

  return (
    <PageLayout>
      <Helmet>
        <title>Savings Goals — Expensly</title>
        <meta name="description" content="Create and track progress toward your financial goals." />
      </Helmet>
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Savings Goals</h1>
          <Button variant="default" size="sm" iconName="Plus" iconPosition="left" onClick={openCreate}>Add Goal</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Saved', val: fmt(totalSaved, sym), color: 'text-success' },
            { label: 'Total Target', val: fmt(totalTarget, sym), color: 'text-primary' },
            { label: 'Completed', val: `${completed}/${goals.length}`, color: 'text-warning' },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-4 text-center">
              <p className={`text-lg font-bold ${color}`}>{val}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-3xl">🎯</div>
            <p className="font-semibold text-foreground">No goals yet</p>
            <p className="text-sm text-center max-w-xs">Set a savings goal and track your progress step by step.</p>
            <Button variant="default" size="sm" onClick={openCreate}>Create Goal</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map(g => {
              const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
              const done = g.currentAmount >= g.targetAmount;
              return (
                <div key={g._id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-financial-lg transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ background: (g.color || '#2563EB') + '22' }}>
                        {g.icon || '🎯'}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{g.name}</p>
                        {done && <span className="text-xs bg-success/15 text-success px-2 py-0.5 rounded-full font-medium">✅ Completed!</span>}
                        {g.targetDate && !done && (
                          <p className="text-xs text-muted-foreground">by {new Date(g.targetDate).toLocaleDateString('en-IN')}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                      <button onClick={() => openEdit(g)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Icon name="Edit" size={13} /></button>
                      <button onClick={() => removeGoal(g._id)} className="p-1.5 rounded-lg hover:bg-error/10 text-muted-foreground hover:text-error"><Icon name="Trash2" size={13} /></button>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-foreground">{fmt(g.currentAmount, sym)}</span>
                    <span className="text-muted-foreground">of {fmt(g.targetAmount, sym)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: done ? '#10B981' : (g.color || '#2563EB') }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{pct}% saved</span>
                    {!done && (
                      <button onClick={() => { setShowContrib(g); setContrib({ amount: '', note: '' }); }}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                        <Icon name="PlusCircle" size={12} /> Add Funds
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div role="dialog" aria-modal="true" className="bg-card rounded-2xl p-6 w-full max-w-md shadow-financial-lg border border-border max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">{editGoal ? 'Edit Goal' : 'Add Goal'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-muted"><Icon name="X" size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Goal Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. New iPhone"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Target Amount *</label>
                  <input type="number" inputMode="decimal" value={form.targetAmount} onChange={e => setForm(p => ({ ...p, targetAmount: e.target.value }))} placeholder="e.g. 100000"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  {errors.targetAmount && <p className="text-xs text-error mt-1">{errors.targetAmount}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Already Saved</label>
                  <input type="number" inputMode="decimal" value={form.currentAmount} onChange={e => setForm(p => ({ ...p, currentAmount: e.target.value }))} placeholder="0"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Target Date (optional)</label>
                <input type="date" value={form.targetDate} onChange={e => setForm(p => ({ ...p, targetDate: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(ic => (
                    <button key={ic} type="button" onClick={() => setForm(p => ({ ...p, icon: ic }))}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${form.icon === ic ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-muted'}`}>{ic}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))}
                      className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''}`} style={{ background: c }} />
                  ))}
                </div>
              </div>
              <Button variant="default" fullWidth size="lg" loading={saving} onClick={handleSave}>
                {editGoal ? 'Save Changes' : 'Create Goal'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {showContrib && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowContrib(null)}>
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full border border-border shadow-financial-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Add Funds — {showContrib.icon} {showContrib.name}</h3>
              <button onClick={() => setShowContrib(null)} className="p-1.5 rounded-lg hover:bg-muted"><Icon name="X" size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Amount *</label>
                <input type="number" inputMode="decimal" value={contrib.amount} onChange={e => setContrib(p => ({ ...p, amount: e.target.value }))} placeholder="Enter amount" autoFocus
                  className="w-full h-10 px-3 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Note (optional)</label>
                <input value={contrib.note} onChange={e => setContrib(p => ({ ...p, note: e.target.value }))} placeholder="e.g. Monthly saving"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" fullWidth onClick={() => setShowContrib(null)}>Cancel</Button>
                <Button variant="default" fullWidth loading={saving} onClick={handleContrib}>Add Funds</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <FloatingActionButton />
    </PageLayout>
  );
}