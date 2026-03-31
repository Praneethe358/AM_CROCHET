import axios from "axios";
import { getApiBaseCandidates } from "@/utils/apiBase";

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
    let response = null;
    let lastError = null;

    const baseUrlCandidates = getApiBaseCandidates();

    for (const baseUrl of baseUrlCandidates) {
      try {
        response = await axios.get(`${baseUrl}/home`, {
          timeout: HOME_REQUEST_TIMEOUT_MS,
        });
        break;
      } catch (requestError) {
        lastError = requestError;
      }
    }

    if (!response) {
      throw lastError || new Error("Failed to fetch home data");
    }

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
