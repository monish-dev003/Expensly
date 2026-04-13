import React from 'react';
import BottomTabNavigation from './BottomTabNavigation';

/**
 * PageLayout — Shared layout wrapper for ALL protected pages.
 *
 * Usage:
 *   <PageLayout>
 *     <header>...</header>
 *     <main>...</main>
 *   </PageLayout>
 *
 * The BottomTabNavigation renders:
 *   1. A fixed sidebar (desktop) with an animated motion.aside
 *   2. An animated flex spacer that mirrors the sidebar width
 *   3. A fixed bottom nav bar (mobile)
 *
 * When sidebar collapses (256px → 64px), the spacer shrinks via framer-motion
 * and the flex-1 content area expands automatically. No JS variable hacks needed.
 */
export default function PageLayout({ children, className = '' }) {
  return (
    <div className={`min-h-screen bg-background flex ${className}`}>
      <BottomTabNavigation />
      <div className="flex-1 min-w-0 overflow-x-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}
