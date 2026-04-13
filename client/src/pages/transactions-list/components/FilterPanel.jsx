import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FilterPanel = ({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange, 
  onClearAll, 
  onApply 
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [expandedSections, setExpandedSections] = useState({
    dateRange: true,
    categories: false,
    wallets: false,
    amount: false
  });

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Food', label: 'Food' },
    { value: 'Travel', label: 'Travel' },
    { value: 'Shopping', label: 'Shopping' },
    { value: 'Bills', label: 'Bills' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Health', label: 'Health' },
    { value: 'Education', label: 'Education' },
    { value: 'Salary', label: 'Salary' },
    { value: 'Freelance', label: 'Freelance' },
    { value: 'Investment', label: 'Investment' },
    { value: 'Gift', label: 'Gift' },
    { value: 'Other', label: 'Other' }
  ];

  const walletOptions = [
    { value: '', label: 'All Wallets' },
    { value: 'Cash', label: 'Cash' },
    { value: 'Bank', label: 'Bank Account' },
    { value: 'UPI', label: 'UPI' },
    { value: 'Credit Card', label: 'Credit Card' }
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' }
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApply();
    onClose();
  };

  const handleClearAll = () => {
    const clearedFilters = {
      dateFrom: '',
      dateTo: '',
      category: '',
      wallet: '',
      type: '',
      minAmount: '',
      maxAmount: ''
    };
    setLocalFilters(clearedFilters);
    onClearAll();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      {/* Filter Panel */}
      <div className={`
        fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 max-h-[80vh] overflow-y-auto
        lg:static lg:w-80 lg:border-r lg:border-t-0 lg:max-h-none lg:overflow-visible
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
      `}>
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Filters</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
            >
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Filter Content */}
        <div className="p-4 lg:p-6 space-y-6">
          {/* Date Range Section */}
          <div>
            <button
              onClick={() => toggleSection('dateRange')}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="font-medium text-foreground">Date Range</h4>
              <Icon 
                name={expandedSections?.dateRange ? 'ChevronUp' : 'ChevronDown'} 
                size={16} 
                className="text-muted-foreground" 
              />
            </button>
            
            {expandedSections?.dateRange && (
              <div className="mt-3 space-y-3">
                <Input
                  type="date"
                  label="From Date"
                  value={localFilters?.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e?.target?.value)}
                />
                <Input
                  type="date"
                  label="To Date"
                  value={localFilters?.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e?.target?.value)}
                />
              </div>
            )}
          </div>

          {/* Categories Section */}
          <div>
            <button
              onClick={() => toggleSection('categories')}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="font-medium text-foreground">Categories</h4>
              <Icon 
                name={expandedSections?.categories ? 'ChevronUp' : 'ChevronDown'} 
                size={16} 
                className="text-muted-foreground" 
              />
            </button>
            
            {expandedSections?.categories && (
              <div className="mt-3">
                <Select
                  options={categoryOptions}
                  value={localFilters?.category}
                  onChange={(value) => handleFilterChange('category', value)}
                  placeholder="Select category"
                />
              </div>
            )}
          </div>

          {/* Wallets Section */}
          <div>
            <button
              onClick={() => toggleSection('wallets')}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="font-medium text-foreground">Wallets</h4>
              <Icon 
                name={expandedSections?.wallets ? 'ChevronUp' : 'ChevronDown'} 
                size={16} 
                className="text-muted-foreground" 
              />
            </button>
            
            {expandedSections?.wallets && (
              <div className="mt-3">
                <Select
                  options={walletOptions}
                  value={localFilters?.wallet}
                  onChange={(value) => handleFilterChange('wallet', value)}
                  placeholder="Select wallet"
                />
              </div>
            )}
          </div>

          {/* Transaction Type */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Transaction Type</h4>
            <Select
              options={typeOptions}
              value={localFilters?.type}
              onChange={(value) => handleFilterChange('type', value)}
              placeholder="Select type"
            />
          </div>

          {/* Amount Range Section */}
          <div>
            <button
              onClick={() => toggleSection('amount')}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="font-medium text-foreground">Amount Range</h4>
              <Icon 
                name={expandedSections?.amount ? 'ChevronUp' : 'ChevronDown'} 
                size={16} 
                className="text-muted-foreground" 
              />
            </button>
            
            {expandedSections?.amount && (
              <div className="mt-3 space-y-3">
                <Input
                  type="number"
                  label="Minimum Amount"
                  placeholder="0.00"
                  value={localFilters?.minAmount}
                  onChange={(e) => handleFilterChange('minAmount', e?.target?.value)}
                />
                <Input
                  type="number"
                  label="Maximum Amount"
                  placeholder="1000.00"
                  value={localFilters?.maxAmount}
                  onChange={(e) => handleFilterChange('maxAmount', e?.target?.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4 lg:p-6">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="flex-1"
            >
              Clear All
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;