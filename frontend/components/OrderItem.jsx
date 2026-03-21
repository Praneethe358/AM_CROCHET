"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Package2 } from "lucide-react";

const STATUS_COLOR = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  shipped: "bg-blue-100 text-blue-700 border-blue-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
};

export default function OrderItem({ order }) {
  const [expanded, setExpanded] = useState(false);

  const itemCount = (order.items || []).reduce((acc, item) => acc + Number(item.quantity || 0), 0);
  const effectiveStatus = order.status || order.orderStatus || "pending";
  const statusClass = STATUS_COLOR[effectiveStatus] || STATUS_COLOR.pending;
  const total = Number(order.finalAmount || order.totalAmount || 0);

  return (
    <article className="border border-theme-border rounded-xl md:rounded-2xl bg-theme-card/90 shadow-[0_6px_18px_rgba(200,169,126,0.1)]">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full text-left p-3.5 md:p-5 flex items-start justify-between gap-3"
      >
        <div className="min-w-0">
          <p className="text-xs md:text-sm text-theme-faint mb-1">Order #{String(order._id || "").slice(-8).toUpperCase()}</p>
          <p className="text-sm md:text-base font-semibold text-theme-text">₹{total.toFixed(2)} • {itemCount} item{itemCount > 1 ? "s" : ""}</p>
          <p className="text-[11px] md:text-xs text-theme-faint mt-1">{new Date(order.createdAt).toLocaleString()}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[11px] md:text-xs px-2.5 py-1 rounded-full border capitalize ${statusClass}`}>{effectiveStatus}</span>
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} className="text-theme-faint" />
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
            <div className="p-3.5 md:p-5 space-y-2.5 md:space-y-3">
              {(order.items || []).map((item, index) => (
                <div key={`${item.product?._id || index}-${index}`} className="flex items-start justify-between gap-3 text-xs md:text-sm">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Package2 size={14} className="text-theme-accent shrink-0" />
                    <p className="text-theme-text line-clamp-2">{item.product?.name || "Product"}</p>
                  </div>
                  <p className="text-theme-faint shrink-0 text-right">Qty {item.quantity}<br />₹{Number(item.priceAtPurchase || 0).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
