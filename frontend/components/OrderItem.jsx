"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Package2 } from "lucide-react";

const STATUS_COLOR = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  shipped: "bg-blue-100 text-blue-700 border-blue-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

export default function OrderItem({ order }) {
  const [expanded, setExpanded] = useState(false);

  const itemCount = (order.items || []).reduce((acc, item) => acc + Number(item.quantity || 0), 0);
  const statusClass = STATUS_COLOR[order.orderStatus] || STATUS_COLOR.pending;
  const total = Number(order.finalAmount || order.totalAmount || 0);

  return (
    <article className="border border-theme-border rounded-2xl bg-theme-card/90 shadow-[0_8px_24px_rgba(200,169,126,0.1)]">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4"
      >
        <div className="min-w-0">
          <p className="text-sm text-theme-faint mb-1">Order #{String(order._id || "").slice(-8).toUpperCase()}</p>
          <p className="font-semibold text-theme-text">₹{total.toFixed(2)} • {itemCount} item{itemCount > 1 ? "s" : ""}</p>
          <p className="text-xs text-theme-faint mt-1">{new Date(order.createdAt).toLocaleString()}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs px-2.5 py-1 rounded-full border capitalize ${statusClass}`}>{order.orderStatus}</span>
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={18} className="text-theme-faint" />
          </motion.span>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="overflow-hidden border-t border-theme-border"
          >
            <div className="p-4 sm:p-5 space-y-3">
              {(order.items || []).map((item, index) => (
                <div key={`${item.product?._id || index}-${index}`} className="flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <Package2 size={14} className="text-theme-accent shrink-0" />
                    <p className="text-theme-text truncate">{item.product?.name || "Product"}</p>
                  </div>
                  <p className="text-theme-faint shrink-0">Qty {item.quantity} • ₹{Number(item.priceAtPurchase || 0).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
