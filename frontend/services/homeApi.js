import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export const getHomeData = async () => {
  const response = await axios.get(`${API_BASE_URL}/home`);
  return (
    response.data?.data || {
      hero: null,
      featured: { items: [], maxItems: 6 },
      categories: [],
      promotions: { thematicBanners: [], deals: [] },
    }
  );
};
