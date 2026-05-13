import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  boundaryName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ErrorBoundary caught an error in ${this.props.boundaryName || 'a component'}:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-[2rem] border-2 border-border/50 h-full min-h-[400px]">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Something went wrong</h2>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest max-w-md mb-8">
            The {this.props.boundaryName || 'module'} encountered an unexpected error.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={this.handleReset} className="rounded-xl h-12 px-6 shadow-glow font-black uppercase text-xs tracking-widest">
              <RefreshCw className="w-4 h-4 mr-2" /> Reload Application
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/app/dashboard'} className="rounded-xl h-12 px-6 font-black uppercase text-xs tracking-widest">
              <Home className="w-4 h-4 mr-2" /> Return Home
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-8 p-4 bg-secondary/30 rounded-xl max-w-2xl text-left overflow-auto w-full">
              <p className="text-xs font-mono text-destructive font-bold mb-2">{this.state.error.toString()}</p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
