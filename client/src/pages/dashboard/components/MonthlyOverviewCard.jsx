import React from 'react';
import Icon from '../../../components/AppIcon';

const MonthlyOverviewCard = ({ monthlyData, className = '' }) => {
  const { income, expenses, netSavings } = monthlyData;
  const savingsRate = income > 0 ? ((netSavings / income) * 100) : 0;
  const expenseRate = income > 0 ? ((expenses / income) * 100) : 0;
  
  return (
    <div className={`bg-card rounded-xl p-6 border border-border shadow-financial ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">This Month</h3>
        <Icon name="TrendingUp" size={20} className="text-muted-foreground" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-success/10 rounded-lg mx-auto mb-2">
            <Icon name="ArrowUp" size={20} className="text-success" />
          </div>
          <p className="text-sm text-muted-foreground">Income</p>
          <p className="text-xl font-bold text-success">${income?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-error/10 rounded-lg mx-auto mb-2">
            <Icon name="ArrowDown" size={20} className="text-error" />
          </div>
          <p className="text-sm text-muted-foreground">Expenses</p>
          <p className="text-xl font-bold text-error">${expenses?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-2">
            <Icon name="PiggyBank" size={20} className="text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Net Savings</p>
          <p className={`text-xl font-bold ${netSavings >= 0 ? 'text-success' : 'text-error'}`}>
            ${Math.abs(netSavings)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Expense Rate</span>
            <span className="font-medium text-foreground">{expenseRate?.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-error h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(expenseRate, 100)}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Savings Rate</span>
            <span className="font-medium text-foreground">{Math.max(savingsRate, 0)?.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-success h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.max(Math.min(savingsRate, 100), 0)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MonthlyOverviewCard);