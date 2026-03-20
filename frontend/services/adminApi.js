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
  const response = await axios.put(`${API_BASE_URL}/admin/orders/${id}`, { orderStatus }, getAuthHeaders());
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
