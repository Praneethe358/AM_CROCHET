/**
 * Centralized fetch utility with retry logic for resilient API calls.
 * Handles Render cold-start timeouts, network failures, and non-200 responses.
 *
 * Works in both Server Components (native fetch) and Client Components (axios).
 */

const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 2000;
const DEFAULT_TIMEOUT_MS = 10000;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error) {
  if (!error) return false;

  const code = error?.code || "";
  const message = (error?.message || "").toLowerCase();
  const status = error?.response?.status || error?.status || 0;

  // Network-level failures (timeout, DNS, connection reset)
  if (
    code === "ECONNABORTED" ||
    code === "ERR_NETWORK" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "UND_ERR_CONNECT_TIMEOUT" ||
    message.includes("timeout") ||
    message.includes("network") ||
    message.includes("failed to fetch") ||
    message.includes("aborted")
  ) {
    return true;
  }

  // Server errors that indicate the backend is waking up or overloaded
  if (status >= 500 || status === 0) {
    return true;
  }

  // No response at all (server unreachable)
  if (!error?.response && !error?.status && code !== "") {
    return true;
  }

  return false;
}

function isRetryableStatus(status) {
  return status >= 500 || status === 408 || status === 429;
}

// ---------------------------------------------------------------------------
// Core: fetchWithRetry (native fetch – works in Server & Client Components)
// ---------------------------------------------------------------------------

/**
 * @param {string}  url
 * @param {object}  [options]             - Standard fetch options + extras below
 * @param {number}  [options.retries]     - Number of retry attempts (default 3)
 * @param {number}  [options.retryDelay]  - Delay in ms between retries (default 2 000)
 * @param {number}  [options.timeout]     - Request timeout in ms (default 10 000)
 * @param {function} [options.onRetry]    - Callback invoked before each retry (attempt, error) => void
 * @returns {Promise<any>}               - Parsed JSON body
 */
export async function fetchWithRetry(url, options = {}) {
  const {
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY_MS,
    timeout = DEFAULT_TIMEOUT_MS,
    onRetry,
    ...fetchOptions
  } = options;

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (isRetryableStatus(response.status) && attempt < retries) {
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          lastError.status = response.status;

          if (typeof onRetry === "function") {
            onRetry(attempt + 1, lastError);
          }

          await wait(retryDelay);
          continue;
        }

        // Non-retryable HTTP error – throw immediately
        const errorBody = await response.text().catch(() => "");
        const error = new Error(
          `HTTP ${response.status}: ${response.statusText}${errorBody ? ` – ${errorBody}` : ""}`
        );
        error.status = response.status;
        throw error;
      }

      // Success – parse JSON
      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      if (attempt < retries && isRetryableError(error)) {
        if (typeof onRetry === "function") {
          onRetry(attempt + 1, error);
        }

        await wait(retryDelay);
        continue;
      }

      throw error;
    }
  }

  // Should not reach here, but safety net
  throw lastError || new Error("fetchWithRetry failed after all retries");
}

// ---------------------------------------------------------------------------
// Axios variant – for client components that already use axios / authClient
// ---------------------------------------------------------------------------

/**
 * Wraps an axios request function with retry logic.
 *
 * @param {function} axiosRequestFn  - () => axiosInstance.get(...)
 * @param {object}   [options]
 * @param {number}   [options.retries]
 * @param {number}   [options.retryDelay]
 * @param {function} [options.onRetry]
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function axiosWithRetry(axiosRequestFn, options = {}) {
  const {
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY_MS,
    onRetry,
  } = options;

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axiosRequestFn();
      return response;
    } catch (error) {
      lastError = error;

      const status = error?.response?.status || 0;
      const retryable = isRetryableError(error) || isRetryableStatus(status);

      if (attempt < retries && retryable) {
        if (typeof onRetry === "function") {
          onRetry(attempt + 1, error);
        }

        await wait(retryDelay);
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error("axiosWithRetry failed after all retries");
}

// ---------------------------------------------------------------------------
// Server-side fetch helper (for Next.js Server Components / Route Handlers)
// Uses native fetch with Next.js cache options + retry
// ---------------------------------------------------------------------------

/**
 * @param {string}  url
 * @param {object}  [options]
 * @param {number}  [options.retries]
 * @param {number}  [options.retryDelay]
 * @param {number}  [options.timeout]
 * @param {number}  [options.revalidate]  - Next.js ISR revalidate seconds
 * @param {string[]} [options.tags]       - Next.js cache tags
 * @returns {Promise<any>}               - Parsed JSON body
 */
export async function serverFetchWithRetry(url, options = {}) {
  const {
    revalidate,
    tags,
    ...rest
  } = options;

  const nextOptions = {};
  if (revalidate !== undefined) nextOptions.revalidate = revalidate;
  if (tags) nextOptions.tags = tags;

  return fetchWithRetry(url, {
    ...rest,
    cache: rest.cache ?? (revalidate !== undefined ? "force-cache" : undefined),
    next: Object.keys(nextOptions).length > 0 ? nextOptions : undefined,
  });
}

// ---------------------------------------------------------------------------
// API warmup – silently pings backend to wake it from cold start
// ---------------------------------------------------------------------------

let warmupPromise = null;

/**
 * Fires a silent GET to /api/health to wake a sleeping Render backend.
 * Deduplicates: only one warmup runs at a time across the app.
 */
export function warmupBackend() {
  if (typeof window === "undefined") return Promise.resolve();
  if (warmupPromise) return warmupPromise;

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  warmupPromise = fetch(`${API_BASE_URL}/health`, {
    method: "GET",
    cache: "no-store",
    priority: "low",
  })
    .then(() => {
      /* backend is awake */
    })
    .catch(() => {
      /* ignore – best-effort */
    })
    .finally(() => {
      warmupPromise = null;
    });

  return warmupPromise;
}
