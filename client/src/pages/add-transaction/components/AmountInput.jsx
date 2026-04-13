import React from 'react';
import Input from '../../../components/ui/Input';

const AmountInput = ({ value, onChange, type, error, className = '' }) => {
  const handleAmountChange = (e) => {
    const inputValue = e?.target?.value;
    // Allow only numbers and decimal point
    if (/^\d*\.?\d*$/?.test(inputValue)) {
      onChange(inputValue);
    }
  };

  const formatAmount = (amount) => {
    if (!amount) return '';
    const num = parseFloat(amount);
    return isNaN(num) ? amount : num?.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-2xl font-semibold ${
          type === 'income' ? 'text-success' : 'text-destructive'
        }`}>
          ₹
        </span>
        <Input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={formatAmount(value)}
          onChange={handleAmountChange}
          error={error}
          className="pl-8 text-2xl font-semibold text-center h-16"
          style={{ fontSize: '2rem', lineHeight: '1.2' }}
        />
      </div>
      {value && (
        <div className="text-center mt-2">
          <span className={`text-sm font-medium ${
            type === 'income' ? 'text-success' : 'text-destructive'
          }`}>
            {type === 'income' ? '+' : '-'}${formatAmount(value)}
          </span>
        </div>
      )}
    </div>
  );
};

export default AmountInput;