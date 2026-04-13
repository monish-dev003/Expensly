import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PageLayout from '../../components/ui/PageLayout';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import { useAuthStore, useAppStore } from '../../store/index.js';
import { Helmet } from 'react-helmet-async';
import { fmt } from '../../utils/format.js';

const TYPE_BADGE = {
  income: 'bg-success/10 text-success',
  expense: 'bg-error/10 text-error',
  transfer: 'bg-primary/10 text-primary',
};
const TYPE_SIGN = { income: '+', expense: '−', transfer: '↔️' };

export default function TransactionsList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { transactions, wallets, removeTransaction, fetchTransactions, transactionPagination } = useAppStore();
  const sym = user?.currencySymbol || '₹';

  const [search, setSearch] = useState('');
  const [filterType, setType] = useState('all');
  const [filterMonth, setMonth] = useState('');
  const [sortBy, setSort] = useState('date-desc');
  const [page, setPage] = useState(1);
  const [delId, setDelId] = useState(null);
  const PER_PAGE = 25;

  const filtered = useMemo(() => transactions
    .filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterMonth) {
        const d = new Date(t.date);
        if (`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` !== filterMonth) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (t.note || '').toLowerCase().includes(q)
          || (t.category?.name || '').toLowerCase().includes(q)
          || String(t.amount).includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc')  return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc')  return a.amount - b.amount;
      return 0;
    })
  , [transactions, filterType, filterMonth, search, sortBy]);

  const pages   = Math.ceil(filtered.length / PER_PAGE);
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const { totalIn, totalOut } = useMemo(() => ({
    totalIn:  filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    totalOut: filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
  }), [filtered]);

  React.useEffect(() => {
    if (!delId) return;
    const onKey = (e) => { if (e.key === 'Escape') setDelId(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [delId]);

  const handleDelete = async (id) => {
    await removeTransaction(id);
    setDelId(null);
  };

  const grouped = useMemo(() => {
    const g = {};
    for (const t of visible) {
      const key = new Date(t.date).toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      });
      if (!g[key]) g[key] = [];
      g[key].push(t);
    }
    return g;
  }, [visible]);

  return (
    <PageLayout>
      <Helmet>
        <title>Transactions — Expensly</title>
        <meta name="description" content="View, search, and manage all your income and expense transactions." />
      </Helmet>

      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Transactions</h1>
          <Button variant="default" size="sm" iconName="Plus" iconPosition="left"
            onClick={() => navigate('/add-transaction')}>Add</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-8 space-y-4">

        {/* Search + Filters */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search transactions…"
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <Icon name="X" size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {[['all','All'],['expense','Expense'],['income','Income'],['transfer','Transfer']].map(([v, l]) => (
              <button key={v} onClick={() => { setType(v); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterType === v ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                {l}
              </button>
            ))}
            <div className="flex-1 min-w-[120px]">
              <input type="month" value={filterMonth}
                onChange={e => { setMonth(e.target.value); setPage(1); }}
                className="w-full h-8 px-3 rounded-xl border border-border bg-input text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <select value={sortBy} onChange={e => setSort(e.target.value)}
              className="h-8 px-2 rounded-xl border border-border bg-input text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">High Amount</option>
              <option value="amount-asc">Low Amount</option>
            </select>
          </div>
        </div>

        {/* Summary Strip */}
        {filtered.length > 0 && (
          <div className="flex items-center gap-3 px-1">
            <span className="text-xs text-muted-foreground">
              {filtered.length} transactions
              {transactionPagination && transactionPagination.total > transactions.length && (
                <span className="ml-1 text-warning font-semibold">
                  (showing {transactions.length} of {transactionPagination.total} — use filters to find older entries)
                </span>
              )}
            </span>
            <span className="text-xs text-success font-medium">+{fmt(totalIn, sym)}</span>
            <span className="text-xs text-error font-medium">−{fmt(totalOut, sym)}</span>
            <span className={`text-xs font-semibold ml-auto ${totalIn - totalOut >= 0 ? 'text-success' : 'text-error'}`}>
              Net: {totalIn - totalOut >= 0 ? '+' : ''}{fmt(totalIn - totalOut, sym)}
            </span>
          </div>
        )}

        {/* Transactions List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-3xl">🔍</div>
            <p className="font-semibold text-foreground">No transactions found</p>
            <p className="text-sm">Try changing your filters</p>
            <Button variant="default" size="sm" onClick={() => navigate('/add-transaction')}>Add Transaction</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([date, txs]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-2 px-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{date}</p>
                  <div className="flex-1 h-px bg-border" />
                  <span className={`text-[10px] font-semibold ${
                    txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) -
                    txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) >= 0
                      ? 'text-success' : 'text-error'
                  }`}>
                    {sym}{Math.abs(
                      txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) -
                      txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
                    ).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  {txs.map((t, i) => (
                    <div key={t._id}
                      className={`flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-all group ${i > 0 ? 'border-t border-border' : ''}`}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
                        style={{ background: (t.category?.color || '#a0aec0') + '22' }}>
                        {t.category?.icon || (t.type === 'income' ? '💰' : t.type === 'transfer' ? '🔄' : '💸')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                            {t.note || t.category?.name || 'Transaction'}
                          </p>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${TYPE_BADGE[t.type]}`}>
                            {t.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {t.walletId?.name && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Icon name="Wallet" size={9} /> {t.walletId.name}
                            </span>
                          )}
                          {t.tags?.length > 0 && t.tags.map(tag => (
                            <span key={tag} className="text-[9px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold tabular-nums ${t.type === 'income' ? 'text-success' : t.type === 'transfer' ? 'text-primary' : 'text-error'}`}>
                          {TYPE_SIGN[t.type]}{sym}{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all shrink-0">
                        <button onClick={() => navigate(`/add-transaction?edit=${t._id}`)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-all">
                          <Icon name="Edit2" size={13} />
                        </button>
                        <button onClick={() => setDelId(t._id)}
                          className="p-1.5 rounded-lg hover:bg-error/10 text-muted-foreground hover:text-error transition-all">
                          <Icon name="Trash2" size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded-xl bg-muted text-muted-foreground text-xs disabled:opacity-40 hover:bg-muted/80 transition-all">
                  ← Prev
                </button>
                <span className="text-xs text-muted-foreground">{page} / {pages}</span>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                  className="px-3 py-1.5 rounded-xl bg-muted text-muted-foreground text-xs disabled:opacity-40 hover:bg-muted/80 transition-all">
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirm Modal */}
      {delId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDelId(null)}>
          <div role="dialog" aria-modal="true"
            className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-financial-lg border border-border text-center"
            onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Trash2" size={24} className="text-error" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Delete Transaction?</h3>
            <p className="text-sm text-muted-foreground mb-5">This will reverse the wallet balance. Cannot be undone.</p>
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