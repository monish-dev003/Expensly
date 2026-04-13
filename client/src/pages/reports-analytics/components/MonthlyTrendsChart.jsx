import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const MonthlyTrendsChart = ({ data, className = '' }) => {
  const [chartType, setChartType] = useState('bar');

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-financial">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry?.color }}
                />
                <span className="text-sm text-muted-foreground capitalize">{entry?.dataKey}</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                ${entry?.value?.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartOptions = [
    { type: 'bar', label: 'Bar Chart', icon: 'BarChart3' },
    { type: 'line', label: 'Line Chart', icon: 'TrendingUp' }
  ];

  return (
    <div className={`bg-card border border-border rounded-lg p-4 lg:p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Monthly Trends</h3>
          <p className="text-sm text-muted-foreground">Income vs Expenses over time</p>
        </div>
        <div className="flex items-center space-x-2">
          {chartOptions?.map((option) => (
            <Button
              key={option?.type}
              variant={chartType === option?.type ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartType(option?.type)}
              iconName={option?.icon}
              iconSize={16}
              className="h-8 w-8 p-0"
            />
          ))}
        </div>
      </div>
      <div className="h-80 lg:h-96">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="month" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => `₹${value?.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="income" 
                fill="var(--color-accent)" 
                radius={[2, 2, 0, 0]}
                name="Income"
              />
              <Bar 
                dataKey="expenses" 
                fill="var(--color-error)" 
                radius={[2, 2, 0, 0]}
                name="Expenses"
              />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="month" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => `₹${value?.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="var(--color-accent)" 
                strokeWidth={3}
                dot={{ fill: 'var(--color-accent)', strokeWidth: 2, r: 4 }}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="var(--color-error)" 
                strokeWidth={3}
                dot={{ fill: 'var(--color-error)', strokeWidth: 2, r: 4 }}
                name="Expenses"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      {/* Trend Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Icon name="TrendingUp" size={16} className="text-accent" />
            <span className="text-sm font-medium text-foreground">Avg Income</span>
          </div>
          <p className="text-xl font-semibold text-foreground">
            ${(data?.reduce((sum, item) => sum + item?.income, 0) / data?.length)?.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Icon name="TrendingDown" size={16} className="text-error" />
            <span className="text-sm font-medium text-foreground">Avg Expenses</span>
          </div>
          <p className="text-xl font-semibold text-foreground">
            ${(data?.reduce((sum, item) => sum + item?.expenses, 0) / data?.length)?.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Icon name="Wallet" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">Avg Savings</span>
          </div>
          <p className="text-xl font-semibold text-foreground">
            ${(data?.reduce((sum, item) => sum + (item?.income - item?.expenses), 0) / data?.length)?.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyTrendsChart;