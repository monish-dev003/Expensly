import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkActionBar = ({ 
  selectedCount, 
  onSelectAll, 
  onDeselectAll, 
  onBulkDelete, 
  onBulkCategoryChange, 
  onExitSelection,
  totalCount 
}) => {
  const allSelected = selectedCount === totalCount;

  return (
    <div className="sticky top-0 bg-primary text-primary-foreground border-b border-primary/20 z-40">
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onExitSelection}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Icon name="X" size={20} />
            </Button>
            
            <div>
              <h3 className="font-semibold">
                {selectedCount} selected
              </h3>
              <p className="text-xs opacity-80">
                {selectedCount} of {totalCount} transactions
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Select All/Deselect All */}
            <Button
              variant="ghost"
              size="sm"
              onClick={allSelected ? onDeselectAll : onSelectAll}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Icon name={allSelected ? "Square" : "CheckSquare"} size={16} className="mr-2" />
              {allSelected ? 'Deselect All' : 'Select All'}
            </Button>

            {/* Bulk Actions */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBulkCategoryChange}
                className="text-primary-foreground hover:bg-primary-foreground/10"
                title="Change Category"
              >
                <Icon name="Tag" size={18} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onBulkDelete}
                className="text-primary-foreground hover:bg-destructive hover:text-destructive-foreground"
                title="Delete Selected"
              >
                <Icon name="Trash2" size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionBar;