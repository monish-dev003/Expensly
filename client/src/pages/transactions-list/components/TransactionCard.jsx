import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TransactionCard = ({ 
  transaction, 
  onEdit, 
  onDelete, 
  isSelected, 
  onSelect, 
  selectionMode 
}) => {
  const navigate = useNavigate();
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleTouchStart = (e) => {
    if (selectionMode) return;
    setStartX(e?.touches?.[0]?.clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || selectionMode) return;
    const currentX = e?.touches?.[0]?.clientX;
    const diff = currentX - startX;
    setSwipeOffset(Math.max(-120, Math.min(120, diff)));
  };

  const handleTouchEnd = () => {
    if (!isDragging || selectionMode) return;
    setIsDragging(false);
    
    if (swipeOffset > 60) {
      // Swipe right - Edit
      onEdit(transaction);
    } else if (swipeOffset < -60) {
      // Swipe left - Delete
      onDelete(transaction);
    }
    
    setSwipeOffset(0);
  };

  const handleLongPress = () => {
    if (!selectionMode) {
      onSelect(transaction?.id);
    }
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Food': 'UtensilsCrossed',
      'Travel': 'Car',
      'Shopping': 'ShoppingBag',
      'Bills': 'Receipt',
      'Entertainment': 'Film',
      'Health': 'Heart',
      'Education': 'GraduationCap',
      'Salary': 'Banknote',
      'Freelance': 'Laptop',
      'Investment': 'TrendingUp',
      'Gift': 'Gift',
      'Other': 'MoreHorizontal'
    };
    return iconMap?.[category] || 'MoreHorizontal';
  };

  const getWalletIcon = (wallet) => {
    const iconMap = {
      'Cash': 'Wallet',
      'Bank': 'Building2',
      'UPI': 'Smartphone',
      'Credit Card': 'CreditCard'
    };
    return iconMap?.[wallet] || 'Wallet';
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    })?.format(Math.abs(amount));
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="relative overflow-hidden">
      {/* Swipe Actions Background */}
      <div className="absolute inset-0 flex">
        {/* Edit Action (Right Swipe) */}
        <div className="flex-1 bg-accent flex items-center justify-start pl-4">
          <Icon name="Edit" size={20} className="text-accent-foreground" />
        </div>
        {/* Delete Action (Left Swipe) */}
        <div className="flex-1 bg-destructive flex items-center justify-end pr-4">
          <Icon name="Trash2" size={20} className="text-destructive-foreground" />
        </div>
      </div>
      {/* Transaction Card */}
      <div
        className={`relative bg-card border border-border rounded-lg p-4 transition-transform duration-200 ${
          isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
        }`}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={(e) => {
          e?.preventDefault();
          handleLongPress();
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* Selection Checkbox */}
            {selectionMode && (
              <div 
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  isSelected 
                    ? 'bg-primary border-primary' :'border-border hover:border-primary'
                }`}
                onClick={() => onSelect(transaction?.id)}
              >
                {isSelected && (
                  <Icon name="Check" size={12} className="text-primary-foreground" />
                )}
              </div>
            )}

            {/* Category Icon */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              transaction?.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'
            }`}>
              <Icon 
                name={getCategoryIcon(transaction?.category)} 
                size={18} 
                className={transaction?.type === 'income' ? 'text-success' : 'text-destructive'} 
              />
            </div>

            {/* Transaction Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground truncate">
                  {transaction?.description || transaction?.category}
                </h3>
                <span className={`font-semibold ${
                  transaction?.type === 'income' ? 'text-success' : 'text-destructive'
                }`}>
                  {transaction?.type === 'income' ? '+' : '-'}{formatAmount(transaction?.amount)}
                </span>
              </div>
              
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-1">
                  <Icon name={getWalletIcon(transaction?.wallet)} size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{transaction?.wallet}</span>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(transaction?.date)}</span>
              </div>

              {transaction?.notes && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {transaction?.notes}
                </p>
              )}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(transaction)}
              className="h-8 w-8"
            >
              <Icon name="Edit" size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(transaction)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Icon name="Trash2" size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;