import React from 'react';
import Icon from '../../../components/AppIcon';

const MonthlyGroupHeader = ({ month, year, totalIncome, totalExpense, transactionCount }) => {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    })?.format(amount);
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months?.[month - 1];
  };

  const netAmount = totalIncome - totalExpense;

  return (
    <div className="sticky top-16 lg:top-20 bg-background/95 backdrop-blur-sm border-b border-border z-20">
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {getMonthName(month)} {year}
            </h3>
            <p className="text-sm text-muted-foreground">
              {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-4">
              {/* Income */}
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <Icon name="TrendingUp" size={14} className="text-success" />
                  <span className="text-sm font-medium text-success">
                    {formatAmount(totalIncome)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Income</p>
              </div>

              {/* Expense */}
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <Icon name="TrendingDown" size={14} className="text-destructive" />
                  <span className="text-sm font-medium text-destructive">
                    {formatAmount(totalExpense)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Expense</p>
              </div>

              {/* Net Amount */}
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <Icon 
                    name={netAmount >= 0 ? "Plus" : "Minus"} 
                    size={14} 
                    className={netAmount >= 0 ? "text-success" : "text-destructive"} 
                  />
                  <span className={`text-sm font-semibold ${
                    netAmount >= 0 ? "text-success" : "text-destructive"
                  }`}>
                    {formatAmount(Math.abs(netAmount))}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Net</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyGroupHeader;