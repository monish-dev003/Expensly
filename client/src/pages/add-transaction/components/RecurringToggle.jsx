import React, { useState } from 'react';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';

const RecurringToggle = ({ isRecurring, onRecurringChange, frequency, onFrequencyChange, className = '' }) => {
  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <Checkbox
        label="Make this a recurring transaction"
        description="Automatically create this transaction at regular intervals"
        checked={isRecurring}
        onChange={(e) => onRecurringChange(e?.target?.checked)}
      />
      {isRecurring && (
        <div className="ml-6 space-y-3">
          <Select
            label="Frequency"
            options={frequencyOptions}
            value={frequency}
            onChange={onFrequencyChange}
            placeholder="Select frequency"
          />
          
          <div className="text-xs text-muted-foreground">
            This transaction will be automatically created {frequency === 'daily' ? 'every day' : 
            frequency === 'weekly' ? 'every week' : 
            frequency === 'monthly' ? 'every month' : 
            frequency === 'yearly' ? 'every year' : 'at the selected interval'}.
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringToggle;