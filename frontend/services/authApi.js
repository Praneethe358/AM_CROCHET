import axios from "axios";
import { axiosWithRetry } from "@/lib/fetchWithRetry";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
const TOKEN_KEY = "auth_token";
let unauthorizedHandler = null;
let isHandlingUnauthorized = false;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

export const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearStoredToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
};

const authClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

authClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";
    const isAuthEndpoint = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/signup") || requestUrl.includes("/auth/register");

    if (status === 401 && !isAuthEndpoint && !isHandlingUnauthorized) {
      isHandlingUnauthorized = true;
      clearStoredToken();

      if (typeof unauthorizedHandler === "function") {
        unauthorizedHandler({ reason: "expired" });
      }

      setTimeout(() => {
        isHandlingUnauthorized = false;
      }, 0);
    }

    return Promise.reject(error);
  }
);

const extractMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0]?.msg ||
    "Something went wrong. Please try again."
  );
};

export const loginRequest = async (email, password) => {
  try {
    const response = await authClient.post("/auth/login", { email, password });
    return response.data?.data || response.data;
  } catch (error) {
    throw new Error(extractMessage(error));
  }
};

export const signupRequest = async (userData) => {
  try {
    const response = await authClient.post("/auth/signup", userData);
    return response.data?.data || response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      const fallback = await authClient.post("/auth/register", userData);
      return fallback.data?.data || fallback.data;
    }
    throw new Error(extractMessage(error));
  }
};

export const getCurrentUserRequest = async () => {
  try {
    const response = await axiosWithRetry(
      () => authClient.get("/user/me"),
      { retries: 3, retryDelay: 2000 }
    );
    return response.data?.data?.user || response.data?.user;
  } catch (error) {
    throw new Error(extractMessage(error));
  }
};

export default authClient;
