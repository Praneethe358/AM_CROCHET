"use client";

import { useEffect, useState } from "react";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { PackageSearch } from "lucide-react";
import { toast } from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import Container from "@/components/Container";
import OrderItem from "@/components/OrderItem";
import { getUserOrdersRequest } from "@/services/orderApi";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("recent");

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const data = await getUserOrdersRequest();
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(error.message || "Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((order) => (order.status || order.orderStatus || "pending") === statusFilter);
  }, [orders, statusFilter]);

  const displayedOrders = useMemo(() => {
    const next = [...filteredOrders];

    next.sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return sortOrder === "recent" ? bTime - aTime : aTime - bTime;
    });

    return next;
  }, [filteredOrders, sortOrder]);

  const orderCounts = useMemo(() => {
    const counters = { all: orders.length, pending: 0, shipped: 0, delivered: 0 };
    orders.forEach((order) => {
      const status = order.status || order.orderStatus || "pending";
      if (counters[status] !== undefined) counters[status] += 1;
    });
    return counters;
  }, [orders]);

  return (
    <ProtectedRoute>
      <section className="pt-24 md:pt-28 pb-20 md:pb-24 min-h-screen bg-theme-bg">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="mb-4 md:mb-6">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-theme-text">Your Orders</h1>
              <p className="text-sm md:text-base text-theme-faint mt-1">Track all purchases and delivery status in one place.</p>
            </div>

            {!isLoading && orders.length > 0 && (
              <div className="sticky top-16 z-20 mb-4 rounded-xl border border-theme-border bg-theme-bg/95 backdrop-blur px-3 py-2">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-theme-text">{displayedOrders.length} orders</p>
                  <div className="flex items-center gap-1 rounded-lg border border-theme-border bg-theme-card p-1">
                    <button
                      type="button"
                      onClick={() => setSortOrder("recent")}
                      className={`rounded-md px-2 py-1 text-[11px] font-medium ${
                        sortOrder === "recent" ? "bg-theme-accent text-white" : "text-theme-faint"
                      }`}
                    >
                      Recent
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortOrder("oldest")}
                      className={`rounded-md px-2 py-1 text-[11px] font-medium ${
                        sortOrder === "oldest" ? "bg-theme-accent text-white" : "text-theme-faint"
                      }`}
                    >
                      Oldest
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {[
                    ["all", `All (${orderCounts.all})`],
                    ["pending", `Pending (${orderCounts.pending})`],
                    ["shipped", `Shipped (${orderCounts.shipped})`],
                    ["delivered", `Delivered (${orderCounts.delivered})`],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStatusFilter(value)}
                      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        statusFilter === value
                          ? "border-theme-accent bg-theme-accent text-white"
                          : "border-theme-border bg-theme-card text-theme-faint hover:text-theme-text"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-20 md:h-24 rounded-xl md:rounded-2xl border border-theme-border bg-theme-card/70 animate-pulse"
                  />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-theme-card/90 border border-theme-border rounded-2xl md:rounded-3xl p-6 md:p-8 text-center"
              >
                <PackageSearch size={34} className="mx-auto text-theme-accent mb-3" />
                <h2 className="text-xl font-semibold text-theme-text">No orders yet</h2>
                <p className="text-theme-faint mt-1">Your successful checkouts will appear here.</p>
              </motion.div>
            ) : filteredOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-theme-card/90 border border-theme-border rounded-2xl md:rounded-3xl p-6 text-center"
              >
                <h2 className="text-base md:text-lg font-semibold text-theme-text">No orders in this status</h2>
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className="mt-3 rounded-full border border-theme-border px-3 py-1.5 text-xs font-medium text-theme-text hover:bg-theme-secondary"
                >
                  Show all orders
                </button>
              </motion.div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {displayedOrders.map((order) => (
                  <OrderItem key={order._id} order={order} />
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>
    </ProtectedRoute>
  );
}
