import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';


const QuickActionsCard = ({ className = '' }) => {
  const quickActions = [
    {
      id: 1,
      title: "Add Expense",
      description: "Record a new expense",
      icon: "Minus",
      color: "bg-error/10 text-error",
      route: "/add-transaction?type=expense"
    },
    {
      id: 2,
      title: "Add Income",
      description: "Record new income",
      icon: "Plus",
      color: "bg-success/10 text-success",
      route: "/add-transaction?type=income"
    },
    {
      id: 3,
      title: "View Reports",
      description: "Analyze spending patterns",
      icon: "BarChart3",
      color: "bg-primary/10 text-primary",
      route: "/reports-analytics"
    },
    {
      id: 4,
      title: "All Transactions",
      description: "Browse transaction history",
      icon: "Receipt",
      color: "bg-accent/10 text-accent",
      route: "/transactions-list"
    }
  ];

  return (
    <div className={`bg-card rounded-xl p-6 border border-border shadow-financial ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <Icon name="Zap" size={20} className="text-muted-foreground" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {quickActions?.map((action) => (
          <Link key={action?.id} to={action?.route}>
            <div className="group p-4 rounded-lg border border-border hover:border-primary/20 transition-all duration-150 hover:shadow-md cursor-pointer">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${action?.color} group-hover:scale-105 transition-transform duration-150`}>
                <Icon name={action?.icon} size={20} />
              </div>
              <h4 className="font-medium text-foreground mb-1 group-hover:text-primary transition-colors duration-150">
                {action?.title}
              </h4>
              <p className="text-xs text-muted-foreground">
                {action?.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default React.memo(QuickActionsCard);