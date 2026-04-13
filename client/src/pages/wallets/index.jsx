import React, { useState, useMemo } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PageLayout from '../../components/ui/PageLayout';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import { useAuthStore, useAppStore } from '../../store/index.js';
import { Helmet } from 'react-helmet-async';

const WALLET_TYPES = ['cash', 'bank', 'credit', 'savings', 'investment', 'other'];
const ICONS = ['💵', '💳', '🏦', '💰', '🏠', '📱', '💎', '🎯', '✈️', '🛒'];
const COLORS = ['#48bb78', '#63b3ed', '#b794f4', '#f6ad55', '#fc8181', '#76e4f7', '#f6c90e', '#a0aec0'];

const WalletsPage = () => {
  const { user } = useAuthStore();
  const { wallets, addWallet, updateWallet, removeWallet } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editWallet, setEditWallet] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'cash', balance: '', icon: '💵', color: '#48bb78', includeInTotal: true });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(null);
  const sym = user?.currencySymbol || '₹';

  const totalBalance = useMemo(
    () => wallets.reduce((s, w) => w.includeInTotal !== false ? s + (w.balance || 0) : s, 0),
    [wallets]
  );

  const openCreate = () => {
    setEditWallet(null);
    setForm({ name: '', type: 'cash', balance: '', icon: '💵', color: '#48bb78', includeInTotal: true });
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (w) => {
    setEditWallet(w);
    setForm({ name: w.name, type: w.type, balance: w.balance, icon: w.icon || '💵', color: w.color || '#48bb78', includeInTotal: w.includeInTotal !== false });
    setErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name required';
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    const data = { ...form, balance: parseFloat(form.balance) || 0 };
    let result;
    if (editWallet) {
      result = await updateWallet(editWallet._id, data);
    } else {
      result = await addWallet(data);
    }
    setSaving(false);
    if (result?.success !== false) setShowModal(false);
  };

  return (
    <PageLayout>
      <Helmet>
        <title>Wallets — Expensly</title>
        <meta name="description" content="Manage your bank accounts, cash, credit cards, and e-wallets." />
      </Helmet>
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Wallets</h1>
          <Button variant="default" size="sm" iconName="Plus" iconPosition="left" onClick={openCreate}>Add Wallet</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6">
        {/* Total Balance */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 mb-6 text-white">
          <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Total Net Worth</p>
          <p className="text-3xl font-bold">{sym}{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <p className="text-white/60 text-xs mt-1">{wallets.filter(w => w.includeInTotal !== false).length} wallets included</p>
        </div>

        {wallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Icon name="Wallet" size={40} className="mb-3 opacity-30" />
            <p className="font-medium">No wallets yet</p>
            <p className="text-sm mt-1">Add your first wallet to start tracking</p>
            <Button variant="default" size="sm" className="mt-4" onClick={openCreate}>Add Wallet</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map(w => (
              <div key={w._id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-financial-lg transition-all relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-20 h-20 rounded-full opacity-10 pointer-events-none" style={{ background: w.color || '#48bb78', transform: 'translate(30%, -30%)' }} />
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ background: (w.color || '#48bb78') + '22' }}>
                      {w.icon || '💵'}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{w.name}</p>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full capitalize">{w.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                    <button onClick={() => openEdit(w)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-all"><Icon name="Edit" size={14} /></button>
                    <button onClick={() => setShowDelete(w)} className="p-1.5 rounded-lg hover:bg-error/10 text-muted-foreground hover:text-error transition-all"><Icon name="Trash2" size={14} /></button>
                  </div>
                </div>
                <p className={`text-2xl font-bold ${w.balance < 0 ? 'text-error' : 'text-foreground'}`}>
                  {w.currencySymbol || sym}{Math.abs(w.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                {/* Credit utilization bar */}
                {w.type === 'credit' && w.creditLimit > 0 && (() => {
                  const used = Math.abs(Math.min(0, w.balance));
                  const utilPct = Math.min(100, Math.round((used / w.creditLimit) * 100));
                  const barColor = utilPct >= 90 ? 'bg-error' : utilPct >= 60 ? 'bg-warning' : 'bg-success';
                  return (
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Used: {w.currencySymbol || sym}{used.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        <span className={utilPct >= 90 ? 'text-error font-semibold' : ''}>{utilPct}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${utilPct}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">Credit limit: {w.currencySymbol || sym}{w.creditLimit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                    </div>
                  );
                })()}
                {!w.includeInTotal && <p className="text-xs text-muted-foreground mt-1">Excluded from total</p>}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div role="dialog" aria-modal="true" className="bg-card rounded-2xl p-6 w-full max-w-md shadow-financial-lg border border-border max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">{editWallet ? 'Edit Wallet' : 'Add Wallet'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-muted"><Icon name="X" size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Wallet Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. HDFC Savings"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {WALLET_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => setForm(p => ({ ...p, type: t }))}
                      className={`py-2 rounded-lg text-xs font-medium capitalize transition-all ${form.type === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Opening Balance</label>
                <input type="number" inputMode="decimal" value={form.balance} onChange={e => setForm(p => ({ ...p, balance: e.target.value }))} placeholder="0.00"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(ic => (
                    <button key={ic} type="button" onClick={() => setForm(p => ({ ...p, icon: ic }))}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${form.icon === ic ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-muted'}`}>{ic}</button>
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
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={form.includeInTotal} onChange={e => setForm(p => ({ ...p, includeInTotal: e.target.checked }))} className="rounded" />
                <span className="text-sm text-foreground">Include in total balance</span>
              </label>
              <Button variant="default" fullWidth size="lg" loading={saving} onClick={handleSave}>
                {editWallet ? 'Save Changes' : 'Create Wallet'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDelete(null)}>
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-financial-lg border border-border" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground text-center mb-2">Remove Wallet?</h3>
            <p className="text-sm text-muted-foreground text-center mb-5">The wallet will be deactivated. Transactions are preserved.</p>
            <div className="flex space-x-3">
              <Button variant="outline" fullWidth onClick={() => setShowDelete(null)}>Cancel</Button>
              <Button variant="danger" fullWidth onClick={async () => { await removeWallet(showDelete._id); setShowDelete(null); }}>Remove</Button>
            </div>
          </div>
        </div>
      )}

      <FloatingActionButton />
    </PageLayout>
  );
};
export default WalletsPage;