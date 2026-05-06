const DEFAULT_LOCAL_API_BASE_URL = "http://localhost:5000/api";

export const getApiBaseCandidates = () => {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_LOCAL_API_BASE_URL;
  const isLocalHost = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);

  const candidates = [configuredBaseUrl];
  if (isLocalHost) {
    candidates.push(DEFAULT_LOCAL_API_BASE_URL);
  }

  return [...new Set(candidates.filter(Boolean))];
};
