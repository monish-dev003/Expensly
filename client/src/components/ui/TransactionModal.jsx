import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const TransactionModal = ({ isOpen, onClose, children, title = "Add Transaction", className = '' }) => {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      modalRef?.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      previousFocusRef?.current?.focus();
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e?.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const handleBackdropClick = (e) => {
    if (e?.target === e?.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-1000 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-end justify-center p-0 lg:items-center lg:p-4">
        <div
          ref={modalRef}
          tabIndex={-1}
          className={`relative w-full bg-card shadow-financial-lg transform transition-all duration-300 lg:max-w-lg lg:rounded-lg ${className}`}
          style={{
            animation: 'slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">
              {title}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 rounded-full"
              aria-label="Close modal"
            >
              <Icon name="X" size={16} />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 lg:p-6 max-h-[calc(100vh-120px)] lg:max-h-[calc(100vh-200px)] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;