import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  onFilterToggle, 
  hasActiveFilters,
  className = '' 
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearchChange(localQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [localQuery, onSearchChange]);

  const handleClearSearch = () => {
    setLocalQuery('');
    onSearchChange('');
  };

  return (
    <div className={`sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-30 ${className}`}>
      <div className="p-4 lg:p-6">
        <div className="flex items-center space-x-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Icon name="Search" size={16} className="text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e?.target?.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {localQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="X" size={16} />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            size="icon"
            onClick={onFilterToggle}
            className="relative"
          >
            <Icon name="Filter" size={18} />
            {hasActiveFilters && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
            )}
          </Button>
        </div>

        {/* Active Search Indicator */}
        {localQuery && (
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Searching for: <span className="font-medium text-foreground">"{localQuery}"</span>
            </span>
            <button
              onClick={handleClearSearch}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;