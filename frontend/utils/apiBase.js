const DEFAULT_LOCAL_API_BASE_URL = "http://localhost:5000/api";

const normalizeApiBaseUrl = (value) => {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    const pathname = url.pathname.replace(/\/+$/, "");

    url.pathname = pathname.endsWith("/api") ? pathname : `${pathname || ""}/api`;

    return url.toString().replace(/\/$/, "");
  } catch {
    const trimmedValue = String(value).trim().replace(/\/+$/, "");
    return trimmedValue.endsWith("/api") ? trimmedValue : `${trimmedValue}/api`;
  }
};

export const getNormalizedApiBaseUrl = (value) => normalizeApiBaseUrl(value);

export const getApiBaseCandidates = () => {
  const configuredBaseUrl = normalizeApiBaseUrl(
    process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_LOCAL_API_BASE_URL
  );
  const isLocalHost =
    typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);

  const candidates = [configuredBaseUrl];
  if (isLocalHost) {
    candidates.push(DEFAULT_LOCAL_API_BASE_URL);
  }

  return [...new Set(candidates.filter(Boolean))];
};
