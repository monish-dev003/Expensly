import React from 'react';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const PreferencesStep = ({ formData, updateFormData }) => {
  const defaultCategories = [
    { id: 'food', name: 'Food & Dining', icon: 'UtensilsCrossed', color: 'text-red-600' },
    { id: 'travel', name: 'Travel & Transport', icon: 'Car', color: 'text-blue-600' },
    { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: 'text-purple-600' },
    { id: 'bills', name: 'Bills & Utilities', icon: 'Receipt', color: 'text-orange-600' },
    { id: 'entertainment', name: 'Entertainment', icon: 'Film', color: 'text-pink-600' },
    { id: 'health', name: 'Health & Fitness', icon: 'Heart', color: 'text-green-600' },
    { id: 'education', name: 'Education', icon: 'GraduationCap', color: 'text-indigo-600' },
    { id: 'investment', name: 'Investment', icon: 'TrendingUp', color: 'text-emerald-600' }
  ];

  const themeOptions = [
    { value: 'light', label: 'Light Mode' },
    { value: 'dark', label: 'Dark Mode' },
    { value: 'system', label: 'System Default' }
  ];

  const handleCategoryToggle = (categoryId) => {
    const updatedCategories = formData?.selectedCategories?.includes(categoryId)
      ? formData?.selectedCategories?.filter(id => id !== categoryId)
      : [...formData?.selectedCategories, categoryId];
    
    updateFormData({ selectedCategories: updatedCategories });
  };

  const handleNotificationChange = (type, value) => {
    updateFormData({
      notifications: {
        ...formData?.notifications,
        [type]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Preferences</h2>
        <p className="text-muted-foreground">Customize your experience</p>
      </div>
      <div className="space-y-6">
        {/* Default Categories */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Default Expense Categories
          </label>
          <p className="text-xs text-muted-foreground mb-4">
            Select categories you use frequently. You can add custom categories later.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {defaultCategories?.map((category) => (
              <div
                key={category?.id}
                className={`relative border rounded-lg p-3 cursor-pointer transition-financial hover:border-primary/50 ${
                  formData?.selectedCategories?.includes(category?.id)
                    ? 'border-primary bg-primary/5' :'border-border bg-card'
                }`}
                onClick={() => handleCategoryToggle(category?.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-muted ${category?.color}`}>
                    <Icon name={category?.icon} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground">{category?.name}</h3>
                  </div>
                  <Checkbox
                    checked={formData?.selectedCategories?.includes(category?.id)}
                    onChange={() => handleCategoryToggle(category?.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Theme Selection */}
        <div>
          <Select
            label="Theme Preference"
            description="Choose your preferred app appearance"
            options={themeOptions}
            value={formData?.theme}
            onChange={(value) => updateFormData({ theme: value })}
          />
        </div>

        {/* Notification Settings */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Notification Preferences
          </label>
          <p className="text-xs text-muted-foreground mb-4">
            Choose how you'd like to be notified about your finances
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={formData?.notifications?.budgetAlerts}
                onChange={(e) => handleNotificationChange('budgetAlerts', e?.target?.checked)}
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground">Budget Alerts</h4>
                <p className="text-xs text-muted-foreground">
                  Get notified when you're close to exceeding your budget limits
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                checked={formData?.notifications?.emailReports}
                onChange={(e) => handleNotificationChange('emailReports', e?.target?.checked)}
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground">Monthly Email Reports</h4>
                <p className="text-xs text-muted-foreground">
                  Receive monthly spending summaries and insights via email
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                checked={formData?.notifications?.recurringReminders}
                onChange={(e) => handleNotificationChange('recurringReminders', e?.target?.checked)}
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground">Recurring Transaction Reminders</h4>
                <p className="text-xs text-muted-foreground">
                  Get reminded about upcoming recurring payments and income
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                checked={formData?.notifications?.aiInsights}
                onChange={(e) => handleNotificationChange('aiInsights', e?.target?.checked)}
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground">Smart Spending Alerts</h4>
                <p className="text-xs text-muted-foreground">
                  Receive personalized spending recommendations and financial tips
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesStep;