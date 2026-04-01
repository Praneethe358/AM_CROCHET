import axios from "axios";
import { axiosWithRetry } from "@/lib/fetchWithRetry";
import { getApiBaseCandidates } from "@/utils/apiBase";

const HOME_REQUEST_TIMEOUT_MS = 8000;

const defaultHomeData = {
  hero: null,
  featured: { items: [], maxItems: 6 },
  categories: [],
  promotions: { thematicBanners: [], deals: [] },
};

export const getHomeData = async ({ onRetry } = {}) => {
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
        thematicBanners: Array.isArray(data.promotions?.thematicBanners)
          ? data.promotions.thematicBanners
          : [],
        deals: Array.isArray(data.promotions?.deals)
          ? data.promotions.deals
          : [],
      },
    };
  };

  try {
    const result = await axiosWithRetry(fetchOnce, {
      retries: 3,
      retryDelay: 2000,
      onRetry,
    });

    // axiosWithRetry returns the axios response for raw axios calls,
    // but fetchOnce already extracts the data, so result IS the data.
    return result;
  } catch (_error) {
    return defaultHomeData;
  }
};
