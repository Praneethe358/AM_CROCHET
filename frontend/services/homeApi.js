import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
const HOME_REQUEST_TIMEOUT_MS = 7000;

const defaultHomeData = {
  hero: null,
  featured: { items: [], maxItems: 6 },
  categories: [],
  promotions: { thematicBanners: [], deals: [] },
};

export const getHomeData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/home`, {
      timeout: HOME_REQUEST_TIMEOUT_MS,
    });

    return response.data?.data || defaultHomeData;
  } catch (error) {
    console.error("Failed to fetch home data", error);
    return defaultHomeData;
  }
};
