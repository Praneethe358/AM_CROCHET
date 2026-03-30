"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-theme-bg">
      <section className="max-w-md w-full rounded-2xl border border-theme-border bg-theme-card p-6 text-center">
        <h1 className="text-xl font-semibold text-theme-text">We hit an unexpected issue</h1>
        <p className="text-sm text-theme-faint mt-2">
          Please try again. Your cart and account data are safe.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-4 inline-flex rounded-lg bg-theme-text text-white px-4 py-2 text-sm"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
