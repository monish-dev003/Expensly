import React, { useState } from 'react';

import Button from '../../../components/ui/Button';


const NotesInput = ({ value, onChange, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && !value) {
      // Focus on input when expanding
      setTimeout(() => {
        const textarea = document.querySelector('textarea[placeholder="Add a note..."]');
        if (textarea) textarea?.focus();
      }, 100);
    }
  };

  return (
    <div className={className}>
      {!isExpanded ? (
        <Button
          variant="outline"
          onClick={handleToggle}
          iconName="FileText"
          iconPosition="left"
          className="w-full justify-start text-muted-foreground"
        >
          Add a note (optional)
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Notes
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              iconName="X"
              className="h-6 w-6 p-0"
            />
          </div>
          <textarea
            value={value}
            onChange={(e) => onChange(e?.target?.value)}
            placeholder="Add a note..."
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
          <div className="text-xs text-muted-foreground text-right">
            {value?.length || 0}/200 characters
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesInput;