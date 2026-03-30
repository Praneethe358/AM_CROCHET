"use client";

import React from "react";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App runtime error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-theme-bg">
          <div className="max-w-md w-full rounded-2xl border border-theme-border bg-theme-card p-6 text-center">
            <h2 className="text-xl font-semibold text-theme-text">Something went wrong</h2>
            <p className="text-sm text-theme-faint mt-2">
              Please refresh the page. If the issue continues, try again in a few minutes.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex rounded-lg bg-theme-text text-white px-4 py-2 text-sm"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
