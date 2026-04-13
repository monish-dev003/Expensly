import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CategorySelector = ({ selectedCategory, onCategorySelect, type, className = '' }) => {
  const [showAll, setShowAll] = useState(false);

  const expenseCategories = [
    { id: 'food', name: 'Food & Dining', icon: 'UtensilsCrossed', color: 'bg-orange-100 text-orange-600' },
    { id: 'travel', name: 'Travel', icon: 'Car', color: 'bg-blue-100 text-blue-600' },
    { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: 'bg-purple-100 text-purple-600' },
    { id: 'bills', name: 'Bills & Utilities', icon: 'Receipt', color: 'bg-red-100 text-red-600' },
    { id: 'entertainment', name: 'Entertainment', icon: 'Film', color: 'bg-pink-100 text-pink-600' },
    { id: 'healthcare', name: 'Healthcare', icon: 'Heart', color: 'bg-green-100 text-green-600' },
    { id: 'education', name: 'Education', icon: 'GraduationCap', color: 'bg-indigo-100 text-indigo-600' },
    { id: 'other', name: 'Other', icon: 'MoreHorizontal', color: 'bg-gray-100 text-gray-600' }
  ];

  const incomeCategories = [
    { id: 'salary', name: 'Salary', icon: 'Briefcase', color: 'bg-green-100 text-green-600' },
    { id: 'freelance', name: 'Freelance', icon: 'Laptop', color: 'bg-blue-100 text-blue-600' },
    { id: 'investment', name: 'Investment', icon: 'TrendingUp', color: 'bg-purple-100 text-purple-600' },
    { id: 'business', name: 'Business', icon: 'Building', color: 'bg-orange-100 text-orange-600' },
    { id: 'gift', name: 'Gift', icon: 'Gift', color: 'bg-pink-100 text-pink-600' },
    { id: 'other', name: 'Other', icon: 'MoreHorizontal', color: 'bg-gray-100 text-gray-600' }
  ];

  const categories = type === 'income' ? incomeCategories : expenseCategories;
  const displayCategories = showAll ? categories : categories?.slice(0, 6);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-foreground mb-3">
        Category
      </label>
      <div className="grid grid-cols-3 gap-3">
        {displayCategories?.map((category) => (
          <button
            key={category?.id}
            onClick={() => onCategorySelect(category)}
            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 ${
              selectedCategory?.id === category?.id
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${category?.color}`}>
              <Icon name={category?.icon} size={20} />
            </div>
            <span className="text-xs font-medium text-center text-foreground leading-tight">
              {category?.name}
            </span>
          </button>
        ))}
      </div>
      {categories?.length > 6 && (
        <div className="mt-3 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            iconName={showAll ? 'ChevronUp' : 'ChevronDown'}
            iconPosition="right"
          >
            {showAll ? 'Show Less' : `Show ${categories?.length - 6} More`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;