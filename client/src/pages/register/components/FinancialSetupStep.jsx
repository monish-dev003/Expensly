import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const FinancialSetupStep = ({ formData, updateFormData, errors }) => {
  const currencies = [
    { value: 'INR', label: 'IN Dollar (₹)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'INR', label: 'Indian Rupee (₹)' },
    { value: 'CAD', label: 'Canadian Dollar (C₹)' },
    { value: 'AUD', label: 'Australian Dollar (A₹)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' }
  ];

  const walletTypes = [
    {
      id: 'cash',
      name: 'Cash',
      icon: 'Banknote',
      description: 'Physical cash in hand',
      color: 'text-green-600'
    },
    {
      id: 'bank',
      name: 'Bank Account',
      icon: 'Building2',
      description: 'Savings or checking account',
      color: 'text-blue-600'
    },
    {
      id: 'upi',
      name: 'UPI/Digital Wallet',
      icon: 'Smartphone',
      description: 'PayPal, Venmo, GPay, etc.',
      color: 'text-purple-600'
    },
    {
      id: 'credit',
      name: 'Credit Card',
      icon: 'CreditCard',
      description: 'Credit card account',
      color: 'text-orange-600'
    }
  ];

  const handleWalletToggle = (walletId) => {
    const updatedWallets = formData?.selectedWallets?.includes(walletId)
      ? formData?.selectedWallets?.filter(id => id !== walletId)
      : [...formData?.selectedWallets, walletId];
    
    updateFormData({ selectedWallets: updatedWallets });
  };

  const handleBalanceChange = (walletId, balance) => {
    updateFormData({
      walletBalances: {
        ...formData?.walletBalances,
        [walletId]: balance
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Financial Setup</h2>
        <p className="text-muted-foreground">Configure your currency and wallets</p>
      </div>
      <div className="space-y-6">
        {/* Currency Selection */}
        <div>
          <Select
            label="Primary Currency"
            description="This will be your default currency for all transactions"
            options={currencies}
            value={formData?.currency}
            onChange={(value) => updateFormData({ currency: value })}
            error={errors?.currency}
            required
            searchable
          />
        </div>

        {/* Wallet Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Select Your Wallets
            <span className="text-error ml-1">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-4">
            Choose the payment methods you use regularly
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {walletTypes?.map((wallet) => (
              <div
                key={wallet?.id}
                className={`relative border rounded-lg p-4 cursor-pointer transition-financial hover:border-primary/50 ${
                  formData?.selectedWallets?.includes(wallet?.id)
                    ? 'border-primary bg-primary/5' :'border-border bg-card'
                }`}
                onClick={() => handleWalletToggle(wallet?.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg bg-muted ${wallet?.color}`}>
                    <Icon name={wallet?.icon} size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-foreground">{wallet?.name}</h3>
                      <Checkbox
                        checked={formData?.selectedWallets?.includes(wallet?.id)}
                        onChange={() => handleWalletToggle(wallet?.id)}
                        className="ml-auto"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {wallet?.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {errors?.selectedWallets && (
            <p className="text-sm text-error mt-2">{errors?.selectedWallets}</p>
          )}
        </div>

        {/* Opening Balances */}
        {formData?.selectedWallets?.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Opening Balances (Optional)
            </label>
            <p className="text-xs text-muted-foreground mb-4">
              Enter your current balance for each selected wallet
            </p>
            
            <div className="space-y-3">
              {formData?.selectedWallets?.map((walletId) => {
                const wallet = walletTypes?.find(w => w?.id === walletId);
                return (
                  <div key={walletId} className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-muted ${wallet?.color}`}>
                      <Icon name={wallet?.icon} size={16} />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number" inputMode="decimal"
                        placeholder={`Enter ${wallet?.name?.toLowerCase()} balance`}
                        value={formData?.walletBalances?.[walletId] || ''}
                        onChange={(e) => handleBalanceChange(walletId, e?.target?.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialSetupStep;