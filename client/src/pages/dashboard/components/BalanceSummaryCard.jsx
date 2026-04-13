import React from 'react';
import Icon from '../../../components/AppIcon';

const BalanceSummaryCard = ({ totalBalance, wallets, className = '' }) => {
  return (
    <div className={`bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-primary-foreground shadow-financial-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Total Balance</h2>
        <Icon name="Wallet" size={24} className="text-primary-foreground/80" />
      </div>
      <div className="mb-6">
        <p className="text-3xl font-bold mb-1">${totalBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        <p className="text-primary-foreground/80 text-sm">Across all wallets</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {wallets?.map((wallet) => (
          <div key={wallet?.id} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name={wallet?.icon} size={16} className="text-primary-foreground/80" />
              <span className="text-sm font-medium">{wallet?.name}</span>
            </div>
            <p className="text-lg font-semibold">${wallet?.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(BalanceSummaryCard);