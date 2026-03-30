"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getAdminOrders, updateOrderStatus } from "@/services/adminApi";
import OrderTable from "@/components/admin/OrderTable";
import { toast } from "react-hot-toast";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAdminOrders();
      setOrders(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      toast.success("Order status updated");
      setOrders(orders.map(order => 
        order._id === id ? { ...order, orderStatus: newStatus, status: newStatus } : order
      ));
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-serif text-theme-text">Orders</h1>
      </div>

      <div className="bg-theme-card rounded-2xl shadow-sm border border-theme-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-theme-text" />
          </div>
        ) : (
          <OrderTable orders={orders} onStatusUpdate={handleStatusUpdate} />
        )}
      </div>
    </div>
  );
}
