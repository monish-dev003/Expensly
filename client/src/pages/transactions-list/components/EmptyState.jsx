import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmptyState = ({ hasFilters, onClearFilters }) => {
  const navigate = useNavigate();

  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Icon name="Search" size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No transactions found
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          No transactions match your current filters. Try adjusting your search criteria or clear all filters.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={onClearFilters}>
            <Icon name="X" size={16} className="mr-2" />
            Clear Filters
          </Button>
          <Button onClick={() => navigate('/add-transaction')}>
            <Icon name="Plus" size={16} className="mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Icon name="Receipt" size={32} className="text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        No transactions yet
      </h3>
      <p className="text-muted-foreground mb-8 max-w-md">
        Start tracking your finances by adding your first transaction. You can record income, expenses, and manage multiple wallets.
      </p>
      
      <div className="space-y-4 w-full max-w-sm">
        <Button 
          onClick={() => navigate('/add-transaction')} 
          className="w-full"
          size="lg"
        >
          <Icon name="Plus" size={20} className="mr-2" />
          Add Your First Transaction
        </Button>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Icon name="Smartphone" size={16} />
            <span>Swipe to edit</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Trash2" size={16} />
            <span>Swipe to delete</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;