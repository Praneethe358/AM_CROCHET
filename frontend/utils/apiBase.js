const DEFAULT_LOCAL_API_BASE_URL = "http://localhost:5000/api";

const ensureApiSuffix = (baseUrl) => {
  if (!baseUrl) return "";
  const trimmed = String(baseUrl).trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

export const getApiBaseUrl = () => {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_LOCAL_API_BASE_URL;
  return ensureApiSuffix(configuredBaseUrl || DEFAULT_LOCAL_API_BASE_URL);
};

export const getApiBaseCandidates = () => {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_LOCAL_API_BASE_URL;
  const isLocalHost =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname);

  const candidates = [ensureApiSuffix(configuredBaseUrl)];
  if (isLocalHost) {
    candidates.push(ensureApiSuffix(DEFAULT_LOCAL_API_BASE_URL));
  }

  return [...new Set(candidates.filter(Boolean))];
};
