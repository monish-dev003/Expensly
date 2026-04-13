import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import PageLayout from '../../components/ui/PageLayout';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import { useAuthStore, useAppStore } from '../../store/index.js';
import { statsAPI } from '../../api/index.js';
import { Helmet } from 'react-helmet-async';

const CalendarPage = () => {
  const { user } = useAuthStore();
  const { transactions } = useAppStore();
  const sym = user?.currencySymbol || '₹';
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [calData, setCalData] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setCalData({}); // clear previous month while loading
    statsAPI.getCalendar({ year, month })
      .then(r => {
        if (cancelled) return;
        const map = {};
        (r.data.data || []).forEach(d => {
          // Server returns { _id: dayNumber, income, expense, count }
          map[d._id] = { income: d.income || 0, expense: d.expense || 0, count: d.count || 0 };
        });
        setCalData(map);
      })
      .catch(() => { if (!cancelled) setCalData({}); });
    return () => { cancelled = true; };
  }, [year, month]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const monthName = new Date(year, month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  const prevMonth = () => { if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1); setSelectedDay(null); };
  const nextMonth = () => { if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1); setSelectedDay(null); };

  const dayTxns = selectedDay ? transactions.filter(t => {
    const d = new Date(t.date);
    return d.getDate() === selectedDay && d.getMonth() === month - 1 && d.getFullYear() === year;
  }) : [];

  const monthIncome = Object.values(calData).reduce((s, d) => s + d.income, 0);
  const monthExpense = Object.values(calData).reduce((s, d) => s + d.expense, 0);

  return (
    <PageLayout>
      <Helmet>
        <title>Calendar — Expensly</title>
        <meta name="description" content="Browse your transactions day by day on a monthly calendar." />
      </Helmet>
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Calendar</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6">
        {/* Month Summary */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-success/10 border border-success/20 rounded-xl p-4">
            <p className="text-xs font-medium text-success mb-0.5">Month Income</p>
            <p className="text-xl font-bold text-success">{sym}{monthIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-error/10 border border-error/20 rounded-xl p-4">
            <p className="text-xs font-medium text-error mb-0.5">Month Expenses</p>
            <p className="text-xl font-bold text-error">{sym}{monthExpense.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-5">
          {/* Nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-muted transition-all">
              <Icon name="ChevronLeft" size={18} className="text-foreground" />
            </button>
            <h2 className="font-semibold text-foreground">{monthName}</h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-muted transition-all">
              <Icon name="ChevronRight" size={18} className="text-foreground" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7">
            {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} className="h-14 sm:h-16 border-b border-r border-border" />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day = i + 1;
              const data = calData[day];
              const isToday = day === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear();
              const isSelected = day === selectedDay;
              return (
                <div key={day} onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`h-14 sm:h-16 border-b border-r border-border p-1 sm:p-1.5 cursor-pointer transition-all hover:bg-muted/50 ${isSelected ? 'bg-primary/10' : ''}`}>
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-1 ${isToday ? 'bg-primary text-primary-foreground' : isSelected ? 'bg-primary/20 text-primary' : 'text-foreground'}`}>
                    {day}
                  </div>
                  {data && (
                    <div className="space-y-0.5">
                      {data.income > 0 && <div className="text-[9px] text-success font-medium leading-none truncate">+{(data.income / 1000).toFixed(1)}k</div>}
                      {data.expense > 0 && <div className="text-[9px] text-error font-medium leading-none truncate">-{(data.expense / 1000).toFixed(1)}k</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Transactions */}
        {selectedDay && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-semibold text-foreground">
                {new Date(year, month - 1, selectedDay).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
            </div>
            {dayTxns.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">No transactions this day</div>
            ) : dayTxns.map((tx, i) => (
              <div key={tx._id} className={`flex items-center space-x-3 px-5 py-3 ${i < dayTxns.length - 1 ? 'border-b border-border' : ''}`}>
                <span className="text-xl">{tx.category?.icon || '📦'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tx.note || tx.category?.name}</p>
                  <p className="text-xs text-muted-foreground">{tx.walletId?.name}</p>
                </div>
                <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-success' : tx.type === 'transfer' ? 'text-primary' : 'text-error'}`}>
                  {tx.type === 'income' ? '+' : tx.type === 'transfer' ? '↔' : '-'}{sym}{tx.amount.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>

      <FloatingActionButton />
    </PageLayout>
  );
};
export default CalendarPage;