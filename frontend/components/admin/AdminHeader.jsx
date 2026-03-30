"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Menu, User, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAdminOrders, getAdminProducts } from "@/services/adminApi";

export default function AdminHeader({ toggleSidebar }) {
  const NOTIFICATION_SEEN_KEY = "admin_notifications_seen_signature";
  const { user } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seenSignature, setSeenSignature] = useState("");
  const panelRef = useRef(null);

  const currentSignature = useMemo(() => {
    if (!notifications.length) return "";
    return notifications.map((item) => `${item.id}:${item.title}`).join("|");
  }, [notifications]);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(NOTIFICATION_SEEN_KEY) || "";
    setSeenSignature(saved);
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const [orders, products] = await Promise.all([getAdminOrders(), getAdminProducts()]);

        const pendingOrders = (orders || []).filter(
          (order) => (order.status || order.orderStatus || "pending") === "pending"
        ).length;
        const lowStockProducts = (products || []).filter(
          (product) => Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 5
        ).length;
        const outOfStockProducts = (products || []).filter(
          (product) => Number(product.stock || 0) <= 0
        ).length;

        const nextNotifications = [];
        if (pendingOrders > 0) {
          nextNotifications.push({
            id: "pending-orders",
            title: `${pendingOrders} pending order${pendingOrders > 1 ? "s" : ""}`,
            href: "/admin/orders",
          });
        }
        if (lowStockProducts > 0) {
          nextNotifications.push({
            id: "low-stock",
            title: `${lowStockProducts} low stock product${lowStockProducts > 1 ? "s" : ""}`,
            href: "/admin/products",
          });
        }
        if (outOfStockProducts > 0) {
          nextNotifications.push({
            id: "out-of-stock",
            title: `${outOfStockProducts} out of stock product${outOfStockProducts > 1 ? "s" : ""}`,
            href: "/admin/products",
          });
        }

        setNotifications(nextNotifications);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const markNotificationsSeen = () => {
    if (!currentSignature || typeof window === "undefined") return;
    window.localStorage.setItem(NOTIFICATION_SEEN_KEY, currentSignature);
    setSeenSignature(currentSignature);
  };

  const unreadCount = useMemo(() => {
    if (!notifications.length) return 0;
    return currentSignature && currentSignature !== seenSignature ? notifications.length : 0;
  }, [notifications, currentSignature, seenSignature]);

  return (
    <header className="h-16 bg-theme-bg border-b border-theme-border flex items-center justify-between px-4 md:px-6 transition-colors duration-300">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 -ml-2 mr-2 text-theme-text hover:bg-theme-secondary rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative" ref={panelRef}>
          <button
            type="button"
            aria-label="Open notifications"
            onClick={() => {
              const willOpen = !notificationsOpen;
              setNotificationsOpen(willOpen);
              if (willOpen) {
                markNotificationsSeen();
              }
            }}
            className="p-2 text-theme-faint hover:text-theme-text transition-colors relative"
          >
            <Bell size={20} />
            {unreadCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] leading-4 rounded-full text-center border border-theme-bg">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </button>

          {notificationsOpen ? (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-theme-border bg-theme-card shadow-xl z-50 overflow-hidden">
              <div className="px-3 py-2 border-b border-theme-border">
                <p className="text-sm font-semibold text-theme-text">Notifications</p>
              </div>

              {loading ? (
                <p className="px-3 py-3 text-xs text-theme-faint">Loading...</p>
              ) : notifications.length === 0 ? (
                <p className="px-3 py-3 text-xs text-theme-faint">No new notifications</p>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => {
                        markNotificationsSeen();
                        setNotificationsOpen(false);
                      }}
                      className="block px-3 py-2.5 text-sm text-theme-text hover:bg-theme-secondary transition-colors"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
        
        <div className="flex items-center space-x-2 pl-4 border-l border-theme-border">
          <div className="w-8 h-8 rounded-full bg-theme-secondary flex items-center justify-center text-theme-text">
            <User size={16} />
          </div>
          <span className="text-sm font-medium text-theme-text hidden sm:block">
            {user?.name || "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}
