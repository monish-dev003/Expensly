import React from 'react';

const Sk = ({ className = '' }) => (
  <div className={`animate-pulse bg-muted/70 rounded-xl ${className}`} />
);

export function HeroSkeleton() {
  return (
    <div className="relative rounded-2xl overflow-hidden p-5 sm:p-6 bg-card border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-3 flex-1">
          <Sk className="h-3 w-32 rounded-full" />
          <Sk className="h-10 w-48 rounded-lg" />
          <Sk className="h-5 w-24 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <Sk className="w-14 h-14 rounded-full" />
          <div className="space-y-2"><Sk className="h-3 w-16" /><Sk className="h-6 w-24" /></div>
        </div>
      </div>
    </div>
  );
}

export function KPISkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[0,1,2,3].map(i => (
        <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Sk className="w-8 h-8 rounded-xl" /><Sk className="h-4 w-10 rounded-full" />
          </div>
          <Sk className="h-3 w-16 rounded-full" />
          <Sk className="h-7 w-24 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function ChartRowSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex justify-between"><Sk className="h-4 w-36"/><Sk className="h-8 w-24 rounded-xl"/></div>
        <Sk className="h-48 w-full rounded-xl" />
      </div>
      <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 space-y-4">
        <Sk className="h-4 w-28"/>
        <div className="flex items-center gap-4">
          <Sk className="w-28 h-28 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2.5">
            {[0,1,2,3].map(i => <div key={i} className="flex justify-between"><Sk className="h-2.5 w-20"/><Sk className="h-2.5 w-12"/></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function WidgetRowSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {[0,1,2].map(i => (
        <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex justify-between"><Sk className="h-4 w-28"/><Sk className="h-4 w-10"/></div>
          {[0,1,2].map(j => (
            <div key={j} className="space-y-1.5">
              <div className="flex justify-between"><Sk className="h-3 w-24"/><Sk className="h-3 w-16"/></div>
              <Sk className="h-1.5 w-full rounded-full"/>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
