'use client';

import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
    this.maxRetries = 3;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleRetry = () => {
    const nextCount = this.state.retryCount + 1;
    if (nextCount > this.maxRetries) return;
    this.setState({ hasError: false, error: null, retryCount: nextCount });
  };

  render() {
    if (this.state.hasError) {
      const canRetry = this.state.retryCount < this.maxRetries;
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 text-red-500">
            <AlertTriangle size={40} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Something went wrong</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          {canRetry ? (
            <button
              onClick={this.handleRetry}
              className="mt-6 rounded-[3px] bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
            >
              Try again
            </button>
          ) : (
            <p className="mt-6 text-sm text-gray-400">Please refresh the page to try again.</p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
