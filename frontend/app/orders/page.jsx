"use client";

import { useEffect, useState } from "react";
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

  return (
    <ProtectedRoute>
      <section className="pt-28 pb-24 min-h-screen bg-theme-bg">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-serif font-bold text-theme-text">Your Orders</h1>
              <p className="text-theme-faint mt-1">Track all purchases and payment status in one place.</p>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-24 rounded-2xl border border-theme-border bg-theme-card/70 animate-pulse"
                  />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-theme-card/90 border border-theme-border rounded-3xl p-8 text-center"
              >
                <PackageSearch size={34} className="mx-auto text-theme-accent mb-3" />
                <h2 className="text-xl font-semibold text-theme-text">No orders yet</h2>
                <p className="text-theme-faint mt-1">Your successful checkouts will appear here.</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
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
