import React from 'react';
import Button from '../../../components/ui/Button';

const TransactionTypeToggle = ({ type, onChange, className = '' }) => {
  return (
    <div className={`flex bg-muted rounded-lg p-1 ${className}`}>
      <Button
        variant={type === 'expense' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('expense')}
        className={`flex-1 ${type === 'expense' ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'hover:bg-background'}`}
      >
        Expense
      </Button>
      <Button
        variant={type === 'income' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('income')}
        className={`flex-1 ${type === 'income' ? 'bg-success hover:bg-success/90 text-success-foreground' : 'hover:bg-background'}`}
      >
        Income
      </Button>
    </div>
  );
};

export default TransactionTypeToggle;