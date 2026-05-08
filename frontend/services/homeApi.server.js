import { serverFetchWithRetry } from "@/lib/fetchWithRetry";

const HOME_REVALIDATE_SECONDS = 0;
let lastSuccessfulHomeData = null;

const defaultHomeData = {
  hero: null,
  featured: { items: [], maxItems: 6 },
  categories: [],
  promotions: { thematicBanners: [], deals: [] },
};

function normalizeHomeData(data = {}) {
  return {
    hero: Object.prototype.hasOwnProperty.call(data, "hero")
      ? data.hero
      : defaultHomeData.hero,
    featured: {
      items: Array.isArray(data.featured?.items) ? data.featured.items : [],
      maxItems: data.featured?.maxItems || 6,
    },
    categories: Array.isArray(data.categories) ? data.categories : [],
    promotions: {
      thematicBanners: Array.isArray(data.promotions?.thematicBanners)
        ? data.promotions.thematicBanners
        : [],
      deals: Array.isArray(data.promotions?.deals)
        ? data.promotions.deals
        : [],
    },
  };
}

export async function getHomeDataServer() {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  try {
    const payload = await serverFetchWithRetry(`${API_BASE_URL}/home`, {
      retries: 3,
      retryDelay: 2000,
      timeout: 8000,
      revalidate: HOME_REVALIDATE_SECONDS,
      cache: "no-store",
      tags: ["home-data"],
    });

    const normalized = normalizeHomeData(payload?.data || {});
    lastSuccessfulHomeData = normalized;
    return normalized;
  } catch (_error) {
    // Return last-known-good data or safe defaults — never crash SSR
    return lastSuccessfulHomeData || defaultHomeData;
  }
}

export { HOME_REVALIDATE_SECONDS, defaultHomeData };