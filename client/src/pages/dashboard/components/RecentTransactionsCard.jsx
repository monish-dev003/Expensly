import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentTransactionsCard = ({ transactions, categories, wallets, className = '' }) => {
  return (
    <div className={`bg-card rounded-xl p-6 border border-border shadow-financial ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
        <Link to="/transactions-list">
          <Button variant="ghost" size="sm" iconName="ArrowRight" iconPosition="right">
            View All
          </Button>
        </Link>
      </div>
      {transactions?.length > 0 ? (
        <div className="space-y-4">
          {transactions?.slice(0, 5)?.map((transaction) => {
            const category = categories?.find(cat => cat?.id === transaction?.categoryId);
            const wallet = wallets?.find(w => w?.id === transaction?.walletId);
            const isIncome = transaction?.type === 'income';
            
            return (
              <div key={transaction?.id} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isIncome ? 'bg-success/10' : category?.color || 'bg-muted'
                  }`}>
                    <Icon 
                      name={isIncome ? 'TrendingUp' : category?.icon || 'DollarSign'} 
                      size={18} 
                      className={isIncome ? 'text-success' : 'text-white'} 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{transaction?.description}</p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{category?.name || 'Income'}</span>
                      <span>•</span>
                      <span>{wallet?.name}</span>
                      <span>•</span>
                      <span>{new Date(transaction.date)?.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    isIncome ? 'text-success' : 'text-foreground'
                  }`}>
                    {isIncome ? '+' : '-'}${transaction?.amount?.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Icon name="Receipt" size={32} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-4">No transactions yet</p>
          <Link to="/add-transaction">
            <Button variant="outline" size="sm" iconName="Plus" iconPosition="left">
              Add First Transaction
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default React.memo(RecentTransactionsCard);