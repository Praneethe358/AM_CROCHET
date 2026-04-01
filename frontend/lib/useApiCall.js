"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * React hook that wraps an async API function with:
 *  - loading / error / data state
 *  - "Retrying…" status during retry attempts
 *  - safe unmount handling
 *
 * @param {function} apiFn         - Async function that returns data
 * @param {object}   [options]
 * @param {boolean}  [options.immediate]  - Call immediately on mount (default true)
 * @param {any}      [options.fallback]   - Fallback value if all attempts fail
 * @param {any[]}    [options.deps]       - Extra deps to re-trigger the call
 * @returns {{ data, loading, error, retrying, retry }}
 */
export function useApiCall(apiFn, options = {}) {
  const {
    immediate = true,
    fallback = null,
    deps = [],
  } = options;

  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const mountedRef = useRef(true);

  const execute = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);
    setRetrying(false);

    try {
      const result = await apiFn({
        onRetry: (attempt) => {
          if (mountedRef.current) {
            setRetrying(true);
          }
        },
      });

      if (mountedRef.current) {
        setData(result);
        setRetrying(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        setRetrying(false);
        setData(fallback);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiFn, ...deps]);

  useEffect(() => {
    mountedRef.current = true;
    if (immediate) {
      execute();
    }
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, immediate]);

  return { data, loading, error, retrying, retry: execute };
}
