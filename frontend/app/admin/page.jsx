"use client";

import { useEffect, useState } from "react";
import { DollarSign, Package, ShoppingBag, Loader2 } from "lucide-react";
import { getAdminProducts, getAdminOrders } from "@/services/adminApi";
import { toast } from "react-hot-toast";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [productsData, ordersData] = await Promise.all([
        getAdminProducts().catch(() => []),
        getAdminOrders().catch(() => [])
      ]);

      const products = productsData || [];
      const orders = ordersData || [];

      const revenue = orders.reduce((sum, order) => sum + (order.finalAmount || order.totalAmount || 0), 0);

      setStats({
        products: products.length,
        orders: orders.length,
        revenue
      });
    } catch (error) {
      console.error("Failed to load stats", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
         <Loader2 className="w-8 h-8 animate-spin text-dark-text dark:text-cream" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-serif mb-8 text-dark-text dark:text-cream">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<ShoppingBag className="w-8 h-8 text-black dark:text-white" />}
          title="Total Orders"
          value={stats.orders}
        />
        <StatCard
          icon={<DollarSign className="w-8 h-8 text-black dark:text-white" />}
          title="Total Revenue"
          value={`₹${stats.revenue.toFixed(2)}`}
        />
        <StatCard
          icon={<Package className="w-8 h-8 text-black dark:text-white" />}
          title="Total Products"
          value={stats.products}
        />
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-black/5 dark:border-white/10 flex items-center space-x-4 transition-colors duration-300">
      <div className="p-3 bg-cream dark:bg-white/5 rounded-xl">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </h3>
        <p className="text-2xl font-bold text-dark-text dark:text-cream">
          {value}
        </p>
      </div>
    </div>
  );
}
