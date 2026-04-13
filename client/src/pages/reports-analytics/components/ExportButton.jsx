import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ExportButton = ({ onExport, className = '' }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const exportOptions = [
    { type: 'pdf', label: 'Export PDF', icon: 'FileText' },
    { type: 'excel', label: 'Export Excel', icon: 'FileSpreadsheet' }
  ];

  const handleExport = async (type) => {
    setIsExporting(true);
    setShowOptions(false);
    
    try {
      await onExport(type);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowOptions(!showOptions)}
        disabled={isExporting}
        loading={isExporting}
        iconName="Download"
        iconPosition="left"
        iconSize={16}
        className="h-9"
      >
        Export
      </Button>
      {showOptions && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-financial-lg z-50">
          {exportOptions?.map((option) => (
            <button
              key={option?.type}
              onClick={() => handleExport(option?.type)}
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-financial first:rounded-t-lg last:rounded-b-lg"
            >
              <Icon name={option?.icon} size={16} className="text-muted-foreground" />
              <span>{option?.label}</span>
            </button>
          ))}
        </div>
      )}
      {showOptions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
};

export default ExportButton;