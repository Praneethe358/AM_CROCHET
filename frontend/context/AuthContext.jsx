"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  clearStoredToken,
  getCurrentUserRequest,
  getStoredToken,
  loginRequest,
  setUnauthorizedHandler,
  setStoredToken,
  signupRequest,
} from "@/services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const clearAuthState = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  const handleUnauthorized = useCallback(({ reason } = { reason: "expired" }) => {
    clearAuthState();

    if (reason === "expired") {
      toast.error("Session expired, please login again");
    }

    if (typeof window !== "undefined") {
      const isAuthPage = window.location.pathname === "/login" || window.location.pathname === "/signup";

      if (!isAuthPage) {
        const next = `${window.location.pathname}${window.location.search}`;
        window.location.href = `/login?next=${encodeURIComponent(next)}`;
      }
    }
  }, [clearAuthState]);

  const getCurrentUser = useCallback(async () => {
    const existingToken = getStoredToken();

    if (!existingToken) {
      setUser(null);
      setToken(null);
      setAuthLoading(false);
      return null;
    }

    try {
      setToken(existingToken);
      const currentUser = await getCurrentUserRequest();
      setUser(currentUser);
      return currentUser;
    } catch {
      clearAuthState();
      return null;
    } finally {
      setAuthLoading(false);
    }
  }, [clearAuthState]);

  useEffect(() => {
    setUnauthorizedHandler(handleUnauthorized);
    getCurrentUser();

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [handleUnauthorized, getCurrentUser]);

  const login = useCallback(async (email, password) => {
    try {
      const response = await loginRequest(email, password);
      const nextToken = response?.token;
      const nextUser = response?.user;

      if (!nextToken || !nextUser) {
        throw new Error("Invalid login response from server.");
      }

      setStoredToken(nextToken);
      setToken(nextToken);
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      throw error;
    }
  }, []);

  const signup = useCallback(async (userData) => {
    try {
      const response = await signupRequest(userData);
      const nextToken = response?.token;
      const nextUser = response?.user;

      if (!nextToken || !nextUser) {
        throw new Error("Invalid signup response from server.");
      }

      setStoredToken(nextToken);
      setToken(nextToken);
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback((showToast = true) => {
    clearAuthState();

    if (showToast) {
      toast.success("Logged out successfully");
    }
  }, [clearAuthState]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading: authLoading,
      authLoading,
      isAuthenticated: Boolean(token && user),
      login,
      signup,
      logout,
      getCurrentUser,
    }),
    [user, token, authLoading, login, signup, logout, getCurrentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
