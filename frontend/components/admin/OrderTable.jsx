"use client";

import { format } from "date-fns";

export default function OrderTable({ orders, onStatusUpdate }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        No orders found.
      </div>
    );
  }

  const STATUS_OPTIONS = ["pending", "paid", "shipped", "delivered", "cancelled"];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 font-medium border-b border-black/5 dark:border-white/10">
          <tr>
            <th className="px-6 py-4">Order ID</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Customer</th>
            <th className="px-6 py-4">Total</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 dark:divide-white/10">
          {orders.map((order) => (
            <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                {order._id}
              </td>
              <td className="px-6 py-4 text-dark-text dark:text-cream">
                {order.createdAt ? format(new Date(order.createdAt), "MMM dd, yyyy") : "-"}
              </td>
              <td className="px-6 py-4 text-dark-text dark:text-cream">
                {order.user?.name || "Unknown"}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {order.user?.email || ""}
                </div>
              </td>
              <td className="px-6 py-4 text-dark-text dark:text-cream font-medium">
                ${order.totalPrice?.toFixed(2)}
              </td>
              <td className="px-6 py-4">
                <select
                  value={order.orderStatus || "pending"}
                  onChange={(e) => onStatusUpdate(order._id, e.target.value)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium outline-none border focus:ring-2 focus:ring-black/10 transition-colors capitalize
                    ${order.orderStatus === "delivered" ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20" : ""}
                    ${order.orderStatus === "shipped" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" : ""}
                    ${order.orderStatus === "paid" ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20" : ""}
                    ${order.orderStatus === "cancelled" ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20" : ""}
                    ${(!order.orderStatus || order.orderStatus === "pending") ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20" : ""}
                  `}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status} className="bg-white dark:bg-dark-card text-black dark:text-white capitalize">
                      {status}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
