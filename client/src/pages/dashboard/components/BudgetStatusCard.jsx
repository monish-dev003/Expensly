import React from 'react';

import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BudgetStatusCard = ({ budgets, categories, className = '' }) => {
  const activeBudgets = budgets?.filter(budget => budget?.isActive);
  
  return (
    <div className={`bg-card rounded-xl p-6 border border-border shadow-financial ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Budget Status</h3>
        <Icon name="Target" size={20} className="text-muted-foreground" />
      </div>
      {activeBudgets?.length > 0 ? (
        <div className="space-y-4">
          {activeBudgets?.slice(0, 3)?.map((budget) => {
            const category = categories?.find(cat => cat?.id === budget?.categoryId);
            const progressPercentage = (budget?.spent / budget?.limit) * 100;
            const isOverBudget = progressPercentage > 100;
            const isNearLimit = progressPercentage > 80 && !isOverBudget;
            
            return (
              <div key={budget?.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${category?.color || 'bg-muted'}`}>
                      <Icon name={category?.icon || 'DollarSign'} size={12} className="text-white" />
                    </div>
                    <span className="font-medium text-foreground">{category?.name || 'Other'}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      ${budget?.spent?.toFixed(2)} / ${budget?.limit?.toFixed(2)}
                    </p>
                    <p className={`text-xs ${
                      isOverBudget ? 'text-error' : isNearLimit ?'text-warning': 'text-muted-foreground'
                    }`}>
                      {progressPercentage?.toFixed(0)}% used
                    </p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isOverBudget ? 'bg-error' : isNearLimit ?'bg-warning': 'bg-success'
                    }`}
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
                {isOverBudget && (
                  <div className="flex items-center space-x-1 text-xs text-error">
                    <Icon name="AlertCircle" size={12} />
                    <span>Over budget by ${(budget?.spent - budget?.limit)?.toFixed(2)}</span>
                  </div>
                )}
                {isNearLimit && !isOverBudget && (
                  <div className="flex items-center space-x-1 text-xs text-warning">
                    <Icon name="AlertTriangle" size={12} />
                    <span>Approaching limit</span>
                  </div>
                )}
              </div>
            );
          })}
          
          {activeBudgets?.length > 3 && (
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">+{activeBudgets?.length - 3} more budgets</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <Icon name="Target" size={32} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-4">No budgets set yet</p>
          <Button variant="outline" size="sm" iconName="Plus" iconPosition="left">
            Create Budget
          </Button>
        </div>
      )}
    </div>
  );
};

export default React.memo(BudgetStatusCard);