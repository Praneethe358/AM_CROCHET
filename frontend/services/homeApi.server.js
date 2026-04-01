const HOME_REVALIDATE_SECONDS = 300;
const HOME_REQUEST_TIMEOUT_MS = 6000;
let lastSuccessfulHomeData = null;

const defaultHomeData = {
  hero: null,
  featured: { items: [], maxItems: 6 },
  categories: [],
  promotions: { thematicBanners: [], deals: [] },
};

function normalizeHomeData(data = {}) {
  return {
    hero: Object.prototype.hasOwnProperty.call(data, 'hero') ? data.hero : defaultHomeData.hero,
    featured: {
      items: Array.isArray(data.featured?.items) ? data.featured.items : [],
      maxItems: data.featured?.maxItems || 6,
    },
    categories: Array.isArray(data.categories) ? data.categories : [],
    promotions: {
      thematicBanners: Array.isArray(data.promotions?.thematicBanners) ? data.promotions.thematicBanners : [],
      deals: Array.isArray(data.promotions?.deals) ? data.promotions.deals : [],
    },
  };
}

async function fetchWithTimeout(url, options = {}, timeoutMs = HOME_REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getHomeDataServer() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/home`, {
      cache: "force-cache",
      next: { revalidate: HOME_REVALIDATE_SECONDS, tags: ["home-data"] },
    });

    if (!response.ok) {
      return lastSuccessfulHomeData || defaultHomeData;
    }

    const payload = await response.json();
    const normalized = normalizeHomeData(payload?.data || {});
    lastSuccessfulHomeData = normalized;
    return normalized;
  } catch (_error) {
    return lastSuccessfulHomeData || defaultHomeData;
  }
}

export { HOME_REVALIDATE_SECONDS, defaultHomeData };