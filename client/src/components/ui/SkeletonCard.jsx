import React from 'react';

export const SkeletonBlock = ({ className = '' }) => (
  <div className={`bg-muted animate-pulse rounded-lg ${className}`} />
);

export const SkeletonCard = ({ lines = 3 }) => (
  <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
    <SkeletonBlock className="h-4 w-1/3" />
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonBlock key={i} className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
  </div>
);

export const SkeletonList = ({ count = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center space-x-3">
        <SkeletonBlock className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-3 w-1/2" />
          <SkeletonBlock className="h-3 w-1/3" />
        </div>
        <SkeletonBlock className="h-4 w-16" />
      </div>
    ))}
  </div>
);

export const SkeletonStat = ({ count = 3 }) => (
  <div className={`grid grid-cols-${count} gap-4`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-2">
        <SkeletonBlock className="h-3 w-2/3" />
        <SkeletonBlock className="h-6 w-1/2" />
      </div>
    ))}
  </div>
);

export default SkeletonCard;
