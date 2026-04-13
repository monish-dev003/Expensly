import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const dateLabel = (d) => {
  const date = new Date(d), now = new Date();
  const yday = new Date(now); yday.setDate(now.getDate() - 1);
  if (date.toDateString() === now.toDateString())  return 'Today';
  if (date.toDateString() === yday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
};

export default function RecentTxns({ transactions, sym }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const visible = transactions
    .filter(t => filter === 'all' || t.type === filter)
    .filter(t => !search || (t.note || '').toLowerCase().includes(search.toLowerCase()))
    .slice(0, 40);

  const grouped = {};
  visible.forEach(t => {
    const key = dateLabel(t.date);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  });

  const FILTERS = [
    { v: 'all',      l: 'All'      },
    { v: 'expense',  l: 'Expenses' },
    { v: 'income',   l: 'Income'   },
    { v: 'transfer', l: 'Transfer' },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">Recent Transactions</p>
          <button onClick={() => navigate('/transactions-list')}
            className="text-xs text-primary hover:underline font-medium">
            See all →
          </button>
        </div>
        <div className="relative mb-3">
          <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
            className="w-full h-8 pl-8 pr-3 text-xs bg-muted rounded-xl border border-border
              focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground" />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <Icon name="X" size={11} />
            </button>
          )}
        </div>
        <div className="flex gap-1.5" role="group" aria-label="Filter transactions">
          {FILTERS.map(f => (
            <button key={f.v} onClick={() => setFilter(f.v)} aria-pressed={filter === f.v}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all
                ${filter === f.v
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
              {f.l}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto divide-y divide-border">
        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-2 text-muted-foreground">
            <Icon name="Receipt" size={28} className="opacity-20" />
            <p className="text-sm">No transactions found</p>
            <button onClick={() => navigate('/add-transaction')}
              className="text-xs text-primary hover:underline">Add your first →</button>
          </div>
        ) : (
          Object.entries(grouped).map(([date, txns]) => (
            <div key={date}>
              <div className="px-5 py-1.5 bg-muted/30 sticky top-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{date}</p>
              </div>
              {txns.map(t => (
                <button key={t._id} onClick={() => navigate(`/add-transaction?edit=${t._id}`)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-all text-left"
                  aria-label={`${t.note || t.category?.name || 'Transaction'} — ${sym}${t.amount.toLocaleString('en-IN')}`}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: `${t.category?.color || '#a0aec0'}20` }}>
                    {t.category?.icon || '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {t.note || t.category?.name || 'Transaction'}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {t.category?.name || 'Other'}{t.walletId?.name ? ` · ${t.walletId.name}` : ''}
                    </p>
                  </div>
                  <span className={`text-sm font-bold tabular-nums flex-shrink-0
                    ${t.type === 'income' ? 'text-success' : t.type === 'transfer' ? 'text-primary' : 'text-error'}`}>
                    {t.type === 'income' ? '+' : t.type === 'transfer' ? '↔' : '−'}{sym}{t.amount.toLocaleString('en-IN')}
                  </span>
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
