import React from 'react';
import Icon from '../../../components/AppIcon';

const TodaySpendingCard = ({ todaySpending, categories, className = '' }) => {
  const totalSpent = todaySpending?.reduce((sum, item) => sum + item?.amount, 0);
  
  return (
    <div className={`bg-card rounded-xl p-6 border border-border shadow-financial ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Today's Spending</h3>
        <Icon name="Calendar" size={20} className="text-muted-foreground" />
      </div>
      <div className="mb-4">
        <p className="text-2xl font-bold text-foreground">${totalSpent?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        <p className="text-sm text-muted-foreground">Total spent today</p>
      </div>
      {todaySpending?.length > 0 ? (
        <div className="space-y-3">
          {todaySpending?.slice(0, 3)?.map((item, index) => {
            const category = categories?.find(cat => cat?.id === item?.categoryId);
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${category?.color || 'bg-muted'}`}>
                    <Icon name={category?.icon || 'DollarSign'} size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{category?.name || 'Other'}</p>
                    <p className="text-xs text-muted-foreground">{item?.description}</p>
                  </div>
                </div>
                <p className="font-semibold text-foreground">-${item?.amount?.toFixed(2)}</p>
              </div>
            );
          })}
          
          {todaySpending?.length > 3 && (
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">+{todaySpending?.length - 3} more transactions</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <Icon name="Coffee" size={32} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No spending today yet</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(TodaySpendingCard);