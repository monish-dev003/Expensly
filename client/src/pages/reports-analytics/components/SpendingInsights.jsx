import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SpendingInsights = ({ insights, className = '' }) => {
  const getInsightIcon = (type) => {
    switch (type) {
      case 'warning': return 'AlertTriangle';
      case 'success': return 'CheckCircle';
      case 'info': return 'Info';
      case 'tip': return 'Lightbulb';
      default: return 'MessageCircle';
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'warning': return 'text-warning';
      case 'success': return 'text-accent';
      case 'info': return 'text-primary';
      case 'tip': return 'text-secondary';
      default: return 'text-muted-foreground';
    }
  };

  const getInsightBg = (type) => {
    switch (type) {
      case 'warning': return 'bg-warning/10 border-warning/20';
      case 'success': return 'bg-accent/10 border-accent/20';
      case 'info': return 'bg-primary/10 border-primary/20';
      case 'tip': return 'bg-secondary/10 border-secondary/20';
      default: return 'bg-muted/50 border-border';
    }
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-4 lg:p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Spending Insights</h3>
          <p className="text-sm text-muted-foreground">Personalized spending recommendations</p>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="Sparkles" size={16} className="text-primary" />
          <span className="text-xs font-medium text-primary">Smart Analysis</span>
        </div>
      </div>
      <div className="space-y-4">
        {insights?.map((insight, index) => (
          <div 
            key={index}
            className={`border rounded-lg p-4 transition-financial hover:shadow-sm ${getInsightBg(insight?.type)}`}
          >
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 ${getInsightColor(insight?.type)}`}>
                <Icon name={getInsightIcon(insight?.type)} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground mb-1">{insight?.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{insight?.description}</p>
                
                {insight?.action && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={insight?.action?.onClick}
                    iconName={insight?.action?.icon}
                    iconPosition="left"
                    iconSize={14}
                    className="h-8"
                  >
                    {insight?.action?.label}
                  </Button>
                )}
              </div>
              
              {insight?.impact && (
                <div className="flex-shrink-0 text-right">
                  <div className={`text-sm font-medium ${
                    insight?.impact?.type === 'positive' ? 'text-accent' : 
                    insight?.impact?.type === 'negative' ? 'text-error' : 'text-foreground'
                  }`}>
                    {insight?.impact?.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{insight?.impact?.label}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="font-medium text-foreground mb-3">Quick Actions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            iconName="Target"
            iconPosition="left"
            iconSize={16}
            className="justify-start"
          >
            Set Budget Goals
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="Bell"
            iconPosition="left"
            iconSize={16}
            className="justify-start"
          >
            Setup Alerts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SpendingInsights;