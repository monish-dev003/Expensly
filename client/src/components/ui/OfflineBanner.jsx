import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on  = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  if (!offline) return null;

  return (
    <div role="alert" aria-live="assertive" className="fixed top-0 left-0 right-0 z-[9998] bg-warning text-warning-foreground px-4 py-2 flex items-center justify-center space-x-2 text-sm font-medium">
      <Icon name="WifiOff" size={14} />
      <span>No internet connection. Some features may not work.</span>
    </div>
  );
}
