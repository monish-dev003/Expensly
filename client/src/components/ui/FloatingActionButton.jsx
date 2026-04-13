import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const HIDDEN_PATHS = ['/login', '/register', '/add-transaction', '/onboarding', '/forgot-password', '/reset-password', '/', '/landing-page'];

const FloatingActionButton = ({ className = '' }) => {
  const navigate  = useNavigate();
  const location  = useLocation();

  if (HIDDEN_PATHS.includes(location.pathname)) return null;

  return (
    <button
      onClick={() => navigate('/add-transaction')}
      className={`
        fixed bottom-20 right-4
        lg:bottom-6 lg:right-6
        w-14 h-14
        bg-gradient-to-br from-blue-600 to-emerald-500
        text-white
        rounded-full
        shadow-lg hover:shadow-xl
        transition-all duration-200
        hover:scale-105 active:scale-95
        z-40
        flex items-center justify-center
        group
        ${className}
      `}
      aria-label="Add Transaction"
      title="Add Transaction"
    >
      <Icon
        name="Plus"
        size={24}
        className="transition-transform duration-200 group-hover:rotate-90"
      />
    </button>
  );
};

export default FloatingActionButton;
