"use client";

/**
 * Thin, non-intrusive banner that shows retry / error states.
 * Designed to slot above any section without breaking layout.
 */
export default function ApiStatusBanner({ retrying, error, onRetry }) {
  if (retrying) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-theme-border bg-theme-card/90 px-5 py-2 text-sm text-theme-faint shadow-sm backdrop-blur">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-theme-border border-t-theme-accent" />
          Connecting to server… retrying
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-3 text-center">
        <div className="inline-flex flex-col items-center gap-2 rounded-2xl border border-red-200 bg-red-50/80 px-6 py-4 text-sm shadow-sm sm:flex-row">
          <span className="text-red-600">
            Unable to load data right now. Please try again.
          </span>
          {typeof onRetry === "function" && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg border border-red-300 bg-white px-4 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
