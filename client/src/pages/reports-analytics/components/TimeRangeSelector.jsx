import React from 'react';
import Button from '../../../components/ui/Button';

const TimeRangeSelector = ({ selectedRange, onRangeChange, className = '' }) => {
  const timeRanges = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  return (
    <div className={`flex bg-muted rounded-lg p-1 ${className}`}>
      {timeRanges?.map((range) => (
        <Button
          key={range?.value}
          variant={selectedRange === range?.value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onRangeChange(range?.value)}
          className="flex-1 h-8 text-xs font-medium"
        >
          {range?.label}
        </Button>
      ))}
    </div>
  );
};

export default TimeRangeSelector;