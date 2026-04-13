import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TransactionBreakdown = ({ transactions, className = '' }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('amount');

  // Group transactions by category
  const groupedTransactions = transactions?.reduce((acc, transaction) => {
    const category = transaction?.category;
    if (!acc?.[category]) {
      acc[category] = {
        name: category,
        total: 0,
        count: 0,
        transactions: []
      };
    }
    acc[category].total += transaction?.amount;
    acc[category].count += 1;
    acc?.[category]?.transactions?.push(transaction);
    return acc;
  }, {});

  // Sort categories
  const sortedCategories = Object.values(groupedTransactions)?.sort((a, b) => {
    if (sortBy === 'amount') return b?.total - a?.total;
    if (sortBy === 'count') return b?.count - a?.count;
    return a?.name?.localeCompare(b?.name);
  });

  const categoryIcons = {
    'Food': 'UtensilsCrossed',
    'Travel': 'Car',
    'Shopping': 'ShoppingBag',
    'Bills': 'Receipt',
    'Entertainment': 'Film',
    'Healthcare': 'Heart',
    'Education': 'GraduationCap',
    'Others': 'MoreHorizontal'
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const sortOptions = [
    { value: 'amount', label: 'Amount', icon: 'DollarSign' },
    { value: 'count', label: 'Count', icon: 'Hash' },
    { value: 'name', label: 'Name', icon: 'AlphabeticalSort' }
  ];

  return (
    <div className={`bg-card border border-border rounded-lg p-4 lg:p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Transaction Breakdown</h3>
          <p className="text-sm text-muted-foreground">Detailed category analysis</p>
        </div>
        
        {/* Sort Options */}
        <div className="flex items-center space-x-2">
          {sortOptions?.map((option) => (
            <Button
              key={option?.value}
              variant={sortBy === option?.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy(option?.value)}
              iconName={option?.icon}
              iconSize={14}
              className="h-8 w-8 p-0"
            />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {sortedCategories?.map((category, index) => (
          <div key={category?.name} className="border border-border rounded-lg overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => setExpandedCategory(
                expandedCategory === category?.name ? null : category?.name
              )}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-financial"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon 
                    name={categoryIcons?.[category?.name] || 'Circle'} 
                    size={20} 
                    className="text-primary" 
                  />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-foreground">{category?.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {category?.count} transaction{category?.count !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    ${category?.total?.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Avg: ${(category?.total / category?.count)?.toFixed(0)}
                  </p>
                </div>
                <Icon 
                  name={expandedCategory === category?.name ? 'ChevronUp' : 'ChevronDown'} 
                  size={16} 
                  className="text-muted-foreground" 
                />
              </div>
            </button>

            {/* Expanded Transactions */}
            {expandedCategory === category?.name && (
              <div className="border-t border-border bg-muted/20">
                <div className="p-4 space-y-3">
                  {category?.transactions?.sort((a, b) => new Date(b.date) - new Date(a.date))?.slice(0, 5)?.map((transaction, txIndex) => (
                    <div 
                      key={txIndex}
                      className="flex items-center justify-between py-2 px-3 bg-card rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                          <Icon name="Receipt" size={14} className="text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {transaction?.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(transaction?.date)} • {transaction?.wallet}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          ${transaction?.amount?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {category?.transactions?.length > 5 && (
                    <div className="text-center pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary/80"
                      >
                        View {category?.transactions?.length - 5} more transactions
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xl font-semibold text-foreground">
              {sortedCategories?.length}
            </p>
            <p className="text-sm text-muted-foreground">Categories</p>
          </div>
          <div>
            <p className="text-xl font-semibold text-foreground">
              {transactions?.length}
            </p>
            <p className="text-sm text-muted-foreground">Transactions</p>
          </div>
          <div>
            <p className="text-xl font-semibold text-foreground">
              ${transactions?.reduce((sum, t) => sum + t?.amount, 0)?.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Total Amount</p>
          </div>
          <div>
            <p className="text-xl font-semibold text-foreground">
              ${(transactions?.reduce((sum, t) => sum + t?.amount, 0) / transactions?.length)?.toFixed(0)}
            </p>
            <p className="text-sm text-muted-foreground">Avg Transaction</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionBreakdown;