import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/index.js';

const NotFound = () => {
  const navigate = useNavigate();
  const user     = useAuthStore(s => s.user);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center max-w-sm"
      >
        {/* Icon */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/10 to-emerald-500/10 border-2 border-dashed border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto mb-6 text-5xl">
          🗺️
        </div>

        {/* Text */}
        <h1 className="text-3xl font-extrabold text-foreground mb-2">
          Page not found
        </h1>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl border-2 border-border text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-all"
          >
            ← Go Back
          </button>
          <Link
            to={user ? '/dashboard' : '/'}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
          >
            {user ? 'Go to Dashboard' : 'Go Home'}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
