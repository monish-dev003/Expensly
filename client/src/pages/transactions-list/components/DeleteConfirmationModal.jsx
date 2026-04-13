import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  transaction, 
  isMultiple = false, 
  count = 1 
}) => {
  if (!isOpen) return null;

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    })?.format(Math.abs(amount));
  };

  const handleBackdropClick = (e) => {
    if (e?.target === e?.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-1000"
      onClick={handleBackdropClick}
    >
      <div className="bg-card rounded-lg shadow-financial-lg max-w-md w-full mx-4 transform transition-all duration-200 scale-100">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <Icon name="Trash2" size={24} className="text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {isMultiple ? `Delete ${count} Transactions` : 'Delete Transaction'}
              </h3>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {isMultiple ? (
            <p className="text-muted-foreground">
              Are you sure you want to delete {count} selected transactions? This will permanently remove them from your records.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-muted-foreground">
                Are you sure you want to delete this transaction?
              </p>
              {transaction && (
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        {transaction?.description || transaction?.category}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction?.category} • {transaction?.wallet}
                      </p>
                    </div>
                    <span className={`font-semibold ${
                      transaction?.type === 'income' ? 'text-success' : 'text-destructive'
                    }`}>
                      {transaction?.type === 'income' ? '+' : '-'}{formatAmount(transaction?.amount)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3 p-6 pt-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="flex-1"
          >
            <Icon name="Trash2" size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;