import React from 'react';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const DateSelector = ({ selectedDate, onDateChange, className = '' }) => {
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday?.setDate(yesterday?.getDate() - 1);
    
    if (date?.toDateString() === today?.toDateString()) {
      return 'Today';
    } else if (date?.toDateString() === yesterday?.toDateString()) {
      return 'Yesterday';
    } else {
      return date?.toLocaleDateString('en-IN', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const quickDates = [
    { label: 'Today', value: new Date()?.toISOString()?.split('T')?.[0] },
    { 
      label: 'Yesterday', 
      value: new Date(Date.now() - 24 * 60 * 60 * 1000)?.toISOString()?.split('T')?.[0] 
    }
  ];

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-foreground mb-3">
        Date
      </label>
      {/* Quick Date Buttons */}
      <div className="flex gap-2 mb-3">
        {quickDates?.map((quickDate) => (
          <button
            key={quickDate?.label}
            onClick={() => onDateChange(quickDate?.value)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedDate === quickDate?.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {quickDate?.label}
          </button>
        ))}
      </div>
      {/* Date Input */}
      <div className="relative">
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e?.target?.value)}
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Icon name="Calendar" size={16} className="text-muted-foreground" />
        </div>
      </div>
      {/* Display Selected Date */}
      {selectedDate && (
        <div className="mt-2 text-center">
          <span className="text-sm text-muted-foreground">
            Selected: {formatDisplayDate(selectedDate)}
          </span>
        </div>
      )}
    </div>
  );
};

export default DateSelector;