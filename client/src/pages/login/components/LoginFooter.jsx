import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const LoginFooter = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="text-primary hover:text-primary/80 font-medium transition-financial"
          >
            Create Account
          </Link>
        </p>
      </div>

      <div className="text-center">
        <Button
          variant="outline"
          size="lg"
          fullWidth
          asChild
        >
          <Link to="/register">
            Sign Up for Free
          </Link>
        </Button>
      </div>

      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground">
          By signing in, you agree to our{' '}
          <button className="text-primary hover:text-primary/80 transition-financial">
            Terms of Service
          </button>
          {' '}and{' '}
          <button className="text-primary hover:text-primary/80 transition-financial">
            Privacy Policy
          </button>
        </p>
        
        <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
          <span>🔒 SSL Secured</span>
          <span>•</span>
          <span>🛡️ Bank-level Security</span>
        </div>
      </div>
    </div>
  );
};

export default LoginFooter;