import React from 'react';
import Icon from '../../../components/AppIcon';

const SummaryCards = ({ summaryData, className = '' }) => {
  const cards = [
    {
      title: 'Average Daily Spending',
      value: `₹${summaryData?.avgDailySpending?.toLocaleString()}`,
      change: summaryData?.avgDailySpendingChange,
      icon: 'Calendar',
      color: 'primary'
    },
    {
      title: 'Highest Category',
      value: summaryData?.highestCategory?.name,
      subValue: `₹${summaryData?.highestCategory?.amount?.toLocaleString()}`,
      change: summaryData?.highestCategory?.change,
      icon: 'TrendingUp',
      color: 'warning'
    },
    {
      title: 'Monthly Comparison',
      value: `${summaryData?.monthlyComparison?.change > 0 ? '+' : ''}${summaryData?.monthlyComparison?.change}%`,
      subValue: summaryData?.monthlyComparison?.status,
      change: summaryData?.monthlyComparison?.change,
      icon: 'BarChart3',
      color: summaryData?.monthlyComparison?.change > 0 ? 'error' : 'accent'
    },
    {
      title: 'Savings Rate',
      value: `${summaryData?.savingsRate}%`,
      subValue: `₹${summaryData?.totalSavings?.toLocaleString()} saved`,
      change: summaryData?.savingsRateChange,
      icon: 'PiggyBank',
      color: 'accent'
    }
  ];

  const getIconColor = (color) => {
    switch (color) {
      case 'primary': return 'text-primary';
      case 'accent': return 'text-accent';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getBgColor = (color) => {
    switch (color) {
      case 'primary': return 'bg-primary/10';
      case 'accent': return 'bg-accent/10';
      case 'warning': return 'bg-warning/10';
      case 'error': return 'bg-error/10';
      default: return 'bg-muted/50';
    }
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-accent';
    if (change < 0) return 'text-error';
    return 'text-muted-foreground';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return 'TrendingUp';
    if (change < 0) return 'TrendingDown';
    return 'Minus';
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {cards?.map((card, index) => (
        <div 
          key={index}
          className="bg-card border border-border rounded-lg p-4 hover:shadow-financial transition-financial"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getBgColor(card?.color)}`}>
              <Icon name={card?.icon} size={20} className={getIconColor(card?.color)} />
            </div>
            {card?.change !== undefined && (
              <div className={`flex items-center space-x-1 ${getChangeColor(card?.change)}`}>
                <Icon name={getChangeIcon(card?.change)} size={14} />
                <span className="text-xs font-medium">
                  {Math.abs(card?.change)}%
                </span>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">{card?.title}</h3>
            <p className="text-xl font-semibold text-foreground mb-1">{card?.value}</p>
            {card?.subValue && (
              <p className="text-sm text-muted-foreground">{card?.subValue}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;