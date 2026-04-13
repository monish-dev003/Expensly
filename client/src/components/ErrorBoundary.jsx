import React from "react";
import { useLocation } from "react-router-dom";
import Icon from "./AppIcon";

class ErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps) {
    // Auto-reset when user navigates to a new route
    if (this.state.hasError && prevProps.locationKey !== this.props.locationKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  componentDidCatch(error, info) {
    // Log to console in dev; swap for Sentry.captureException in production
    if (process.env.NODE_ENV !== "production") {
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center shadow-financial-lg">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <Icon name="AlertTriangle" size={28} className="text-error" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            An unexpected error occurred. Your data is safe — try refreshing the page or clicking below.
          </p>
          {process.env.NODE_ENV !== "production" && this.state.error && (
            <details className="text-left mb-5">
              <summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground mb-2">
                Error details (dev only)
              </summary>
              <pre className="text-xs bg-muted rounded-xl p-3 overflow-auto text-error max-h-32">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2"
            >
              <Icon name="RefreshCw" size={14} /> Try Again
            </button>
            <button
              onClick={() => window.location.href = "/dashboard"}
              className="px-5 py-2.5 bg-muted text-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-all flex items-center gap-2"
            >
              <Icon name="Home" size={14} /> Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default function ErrorBoundary({ children }) {
  const location = useLocation();
  return (
    <ErrorBoundaryInner locationKey={location.key}>
      {children}
    </ErrorBoundaryInner>
  );
}
