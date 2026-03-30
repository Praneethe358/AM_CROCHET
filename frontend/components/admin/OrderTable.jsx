"use client";

import { format } from "date-fns";

export default function OrderTable({ orders, onStatusUpdate }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="p-8 text-center text-theme-faint">
        No orders found.
      </div>
    );
  }

  const STATUS_OPTIONS = ["pending_whatsapp", "contacted", "shipped", "delivered"];
  const STATUS_BADGE_CLASS = {
    pending:
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
    pending_whatsapp:
      "bg-green-100 text-green-800 border-green-300 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/40",
    contacted:
      "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40",
    shipped:
      "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40",
    delivered:
      "bg-green-100 text-green-800 border-green-300 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/40",
  };

  const STATUS_LABELS = {
    pending: "Pending",
    pending_whatsapp: "WhatsApp Order",
    contacted: "Contacted",
    shipped: "Shipped",
    delivered: "Delivered",
  };

  const getStatusLabel = (status) => STATUS_LABELS[status] || status;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-theme-secondary text-theme-text font-medium border-b border-theme-border">
          <tr>
            <th className="px-6 py-4">Order ID</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Customer</th>
            <th className="px-6 py-4">Items</th>
            <th className="px-6 py-4">Total</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-theme-border">
          {orders.map((order) => (
            <tr key={order._id} className="hover:bg-theme-secondary transition-colors">
              <td className="px-6 py-4 font-mono text-xs text-theme-faint">
                {order._id}
              </td>
              <td className="px-6 py-4 text-theme-text">
                {order.createdAt ? format(new Date(order.createdAt), "MMM dd, yyyy") : "-"}
              </td>
              <td className="px-6 py-4 text-theme-text">
                {order.user?.name || "Unknown"}
                <div className="text-xs text-theme-faint">
                  {order.user?.email || ""}
                </div>
              </td>
              <td className="px-6 py-4 text-theme-text">
                <div className="space-y-1 min-w-56 max-w-72 whitespace-normal">
                  {(order.items || []).slice(0, 2).map((item, index) => (
                    <div key={`${order._id}-item-${index}`} className="text-xs leading-5 text-theme-text">
                      <span className="font-medium">{item.product?.name || "Product"}</span>
                      <span className="text-theme-faint"> × {item.quantity || 0}</span>
                    </div>
                  ))}
                  {(order.items || []).length > 2 && (
                    <div className="text-xs text-theme-faint">
                      +{(order.items || []).length - 2} more
                    </div>
                  )}
                  {(!order.items || order.items.length === 0) && (
                    <div className="text-xs text-theme-faint">No items</div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-theme-text font-medium">₹{Number(order.finalAmount || order.totalAmount || 0).toFixed(2)}
              </td>
              <td className="px-6 py-4">
                <div className="mb-2">
                  {order.whatsappOrder && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300 mr-2">
                      📱 WhatsApp
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${
                      STATUS_BADGE_CLASS[order.status || order.orderStatus || "pending"] || STATUS_BADGE_CLASS.pending
                    }`}
                  >
                    {getStatusLabel(order.status || order.orderStatus || "pending")}
                  </span>
                </div>
                <select
                  value={order.status || order.orderStatus || "pending_whatsapp"}
                  onChange={(e) => onStatusUpdate(order._id, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm font-semibold outline-none border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-black/10 transition-colors capitalize dark:bg-dark-card dark:text-cream dark:border-white/20"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status} className="capitalize">
                      {getStatusLabel(status)}
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
