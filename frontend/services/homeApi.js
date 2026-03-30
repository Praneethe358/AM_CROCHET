import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
const HOME_REQUEST_TIMEOUT_MS = 6000;
const HOME_REQUEST_RETRY_COUNT = 0;

const defaultHomeData = {
  hero: null,
  featured: { items: [], maxItems: 6 },
  categories: [],
  promotions: { thematicBanners: [], deals: [] },
};

export const getHomeData = async () => {
  const fetchOnce = async () => {
    const response = await axios.get(`${API_BASE_URL}/home`, {
      timeout: HOME_REQUEST_TIMEOUT_MS,
    });

    const data = response.data?.data || {};
    return {
      hero: data.hero || null,
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
  };

  try {
    return await fetchOnce();
  } catch (error) {
    const isRetryable =
      error?.code === "ECONNABORTED"
      || error?.message?.toLowerCase?.().includes("timeout")
      || !error?.response;

    if (isRetryable && HOME_REQUEST_RETRY_COUNT > 0) {
      try {
        return await fetchOnce();
      } catch (_retryError) {
        return defaultHomeData;
      }
    }

    return defaultHomeData;
  }
};
