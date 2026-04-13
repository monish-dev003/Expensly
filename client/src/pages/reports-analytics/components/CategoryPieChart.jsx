import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Icon from '../../../components/AppIcon';

const CategoryPieChart = ({ data, className = '' }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const COLORS = [
    'var(--color-primary)',
    'var(--color-accent)',
    'var(--color-warning)',
    'var(--color-error)',
    'var(--color-secondary)',
    '#8B5CF6',
    '#F59E0B',
    '#EF4444'
  ];

  const categoryIcons = {
    'Food': 'UtensilsCrossed',
    'Travel': 'Car',
    'Shopping': 'ShoppingBag',
    'Bills': 'Receipt',
    'Entertainment': 'Film',
    'Healthcare': 'Heart',
    'Education': 'GraduationCap',
    'Others': 'MoreHorizontal'
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0];
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-financial">
          <div className="flex items-center space-x-2 mb-1">
            <Icon 
              name={categoryIcons?.[data?.payload?.name] || 'Circle'} 
              size={16} 
              className="text-muted-foreground" 
            />
            <span className="font-medium text-foreground">{data?.payload?.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Amount: <span className="font-medium text-foreground">${data?.value?.toLocaleString()}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Percentage: <span className="font-medium text-foreground">{data?.payload?.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {payload?.map((entry, index) => (
          <div 
            key={index}
            className="flex items-center space-x-2 px-3 py-1 bg-muted rounded-full cursor-pointer hover:bg-muted/80 transition-financial"
            onClick={() => setActiveIndex(activeIndex === index ? null : index)}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry?.color }}
            />
            <span className="text-xs font-medium text-foreground">{entry?.value}</span>
            <span className="text-xs text-muted-foreground">
              ${data?.[index]?.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-4 lg:p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Category Distribution</h3>
          <p className="text-sm text-muted-foreground">Expense breakdown by category</p>
        </div>
        <Icon name="PieChart" size={20} className="text-muted-foreground" />
      </div>
      <div className="h-80 lg:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
            >
              {data?.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS?.[index % COLORS?.length]}
                  stroke={activeIndex === index ? '#fff' : 'none'}
                  strokeWidth={activeIndex === index ? 2 : 0}
                  style={{
                    filter: activeIndex !== null && activeIndex !== index ? 'opacity(0.6)' : 'none',
                    transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: 'center',
                    transition: 'all 0.2s ease-in-out'
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-semibold text-foreground">
            ${data?.reduce((sum, item) => sum + item?.value, 0)?.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Total Expenses</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-foreground">{data?.length}</p>
          <p className="text-sm text-muted-foreground">Categories</p>
        </div>
      </div>
    </div>
  );
};

export default CategoryPieChart;