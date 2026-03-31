import axios from "axios";
import authClient, { getStoredToken } from "./authApi";
import { getApiBaseCandidates } from "@/utils/apiBase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const getWithFallback = async (path, config = {}) => {
  const baseUrlCandidates = getApiBaseCandidates();
  let lastError = null;

  for (const baseUrl of baseUrlCandidates) {
    try {
      return await axios.get(`${baseUrl}${path}`, config);
    } catch (requestError) {
      lastError = requestError;
    }
  }

  throw lastError || new Error("Promotion request failed");
};

const getAuthHeaders = () => {
  const token = getStoredToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getActivePromotions = async (filters = {}) => {
  try {
    const response = await getWithFallback("/promotions", {
      params: filters,
      timeout: 8000,
    });
    return response.data?.data || [];
  } catch {
    return [];
  }
};

export const getPromotionById = async (id) => {
  const response = await getWithFallback(`/promotions/${id}`);
  return response.data?.data || null;
};

export const trackPromotionClick = async (id) => {
  try {
    await axios.post(`${API_BASE_URL}/promotions/${id}/click`);
  } catch {
    // No-op: click tracking should not block UX
  }
};

export const getAdminPromotions = async () => {
  const response = await authClient.get("/admin/promotions");
  return response.data?.data || [];
};

export const createAdminPromotion = async (promotionData) => {
  const response = await authClient.post("/admin/promotions", promotionData);
  return response.data?.data || response.data;
};

export const updateAdminPromotion = async (id, promotionData) => {
  const response = await authClient.put(`/admin/promotions/${id}`, promotionData);
  return response.data?.data || response.data;
};

export const deleteAdminPromotion = async (id) => {
  const response = await authClient.delete(`/admin/promotions/${id}`);
  return response.data?.data || response.data;
};

export const uploadPromotionBanner = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
    ...getAuthHeaders(),
    headers: {
      ...getAuthHeaders().headers,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data?.data?.imageUrl || response.data?.imageUrl || "";
};
