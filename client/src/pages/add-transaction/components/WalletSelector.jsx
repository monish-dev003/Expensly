import React from 'react';
import Icon from '../../../components/AppIcon';

const WalletSelector = ({ selectedWallet, onWalletSelect, className = '' }) => {
  const wallets = [
    { 
      id: 'cash', 
      name: 'Cash', 
      icon: 'Wallet', 
      balance: 1250.00,
      color: 'bg-green-100 text-green-600'
    },
    { 
      id: 'bank', 
      name: 'Bank Account', 
      icon: 'Building2', 
      balance: 5430.75,
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      id: 'upi', 
      name: 'UPI', 
      icon: 'Smartphone', 
      balance: 890.25,
      color: 'bg-purple-100 text-purple-600'
    },
    { 
      id: 'credit', 
      name: 'Credit Card', 
      icon: 'CreditCard', 
      balance: 2100.00,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-foreground mb-3">
        Wallet
      </label>
      <div className="grid grid-cols-2 gap-3">
        {wallets?.map((wallet) => (
          <button
            key={wallet?.id}
            onClick={() => onWalletSelect(wallet)}
            className={`flex items-center p-3 rounded-lg border-2 transition-all duration-200 ${
              selectedWallet?.id === wallet?.id
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${wallet?.color}`}>
              <Icon name={wallet?.icon} size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">{wallet?.name}</p>
              <p className="text-xs text-muted-foreground">
                ${wallet?.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WalletSelector;