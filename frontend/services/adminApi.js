import axios from "axios";
import { getStoredToken } from "./authApi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = getStoredToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getAdminProducts = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/products`, getAuthHeaders());
  return response.data?.data || [];
};

export const createAdminProduct = async (productData) => {
  const response = await axios.post(`${API_BASE_URL}/admin/products`, productData, getAuthHeaders());
  return response.data?.data || response.data;
};

export const updateAdminProduct = async (id, productData) => {
  const response = await axios.put(`${API_BASE_URL}/admin/products/${id}`, productData, getAuthHeaders());
  return response.data?.data || response.data;
};

export const deleteAdminProduct = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/admin/products/${id}`, getAuthHeaders());
  return response.data?.data || response.data;
};

export const getAdminOrders = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/orders`, getAuthHeaders());
  return response.data?.data || [];
};

export const updateOrderStatus = async (id, orderStatus) => {
  const response = await axios.put(
    `${API_BASE_URL}/admin/orders/${id}`,
    { status: orderStatus, orderStatus },
    getAuthHeaders()
  );
  return response.data?.data || response.data;
};

export const getAdminDashboardStats = async () => {
  try {
    const products = await getAdminProducts();
    const orders = await getAdminOrders();
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.finalAmount || order.totalAmount || 0),
      0
    );
    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue,
    };
  } catch (error) {
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
    };
  }
};

export const uploadAdminImage = async (file) => {
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

export const getAdminHero = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/hero`, getAuthHeaders());
  return response.data?.data || null;
};

export const updateAdminHero = async (heroData) => {
  const response = await axios.put(`${API_BASE_URL}/admin/hero`, heroData, getAuthHeaders());
  return response.data?.data || response.data;
};

export const getAdminCategories = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/categories`, getAuthHeaders());
  return response.data?.data || [];
};

export const createAdminCategory = async (categoryData) => {
  const response = await axios.post(`${API_BASE_URL}/admin/categories`, categoryData, getAuthHeaders());
  return response.data?.data || response.data;
};

export const updateAdminCategory = async (id, categoryData) => {
  const response = await axios.put(`${API_BASE_URL}/admin/categories/${id}`, categoryData, getAuthHeaders());
  return response.data?.data || response.data;
};

export const deleteAdminCategory = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/admin/categories/${id}`, getAuthHeaders());
  return response.data?.data || response.data;
};

export const getAdminFeatured = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/featured`, getAuthHeaders());
  return response.data?.data || { items: [], maxItems: 6, isActive: true };
};

export const updateAdminFeatured = async (featuredData) => {
  const response = await axios.put(`${API_BASE_URL}/admin/featured`, featuredData, getAuthHeaders());
  return response.data?.data || response.data;
};
