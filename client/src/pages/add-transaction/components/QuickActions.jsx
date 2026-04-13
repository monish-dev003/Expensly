import React from 'react';
import Button from '../../../components/ui/Button';


const QuickActions = ({ onPhotoCapture, onTemplateSelect, className = '' }) => {
  const recentTemplates = [
    { id: 1, name: 'Coffee', amount: 4.50, category: 'Food & Dining', type: 'expense' },
    { id: 2, name: 'Uber Ride', amount: 12.30, category: 'Travel', type: 'expense' },
    { id: 3, name: 'Grocery', amount: 45.80, category: 'Shopping', type: 'expense' }
  ];

  return (
    <div className={className}>
      <div className="flex gap-3 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onPhotoCapture}
          iconName="Camera"
          iconPosition="left"
          className="flex-1"
        >
          Add Receipt
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="Clock"
          iconPosition="left"
          className="flex-1"
        >
          Templates
        </Button>
      </div>
      {/* Recent Templates */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Recent Transactions
        </p>
        {recentTemplates?.map((template) => (
          <button
            key={template?.id}
            onClick={() => onTemplateSelect(template)}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200 text-left"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{template?.name}</p>
              <p className="text-xs text-muted-foreground">{template?.category}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium ${
                template?.type === 'income' ? 'text-success' : 'text-destructive'
              }`}>
                {template?.type === 'income' ? '+' : '-'}${template?.amount?.toFixed(2)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;