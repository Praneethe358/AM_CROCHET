"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useCart } from "@/context/CartContext";

export default function OrderSummary({ shippingFee = 49 }) {
  const { cartItems } = useCart();

  const { subtotal, total, totalItems } = useMemo(() => {
    const items = cartItems || [];
    const nextSubtotal = items.reduce((acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0), 0);
    const nextTotalItems = items.reduce((acc, item) => acc + Number(item.quantity || 0), 0);
    const nextShipping = nextSubtotal > 0 ? shippingFee : 0;

    return {
      subtotal: nextSubtotal,
      total: nextSubtotal + nextShipping,
      totalItems: nextTotalItems,
    };
  }, [cartItems, shippingFee]);

  const items = cartItems || [];

  return (
    <aside className="bg-theme-card/90 border border-theme-border rounded-3xl p-5 sm:p-7 shadow-[0_10px_30px_rgba(200,169,126,0.12)]">
      <h3 className="text-2xl font-serif font-bold text-theme-text mb-5">Order Summary</h3>

      <div className="space-y-3 max-h-64 overflow-auto pr-1">
        {items.length === 0 ? (
          <p className="text-sm text-theme-faint">No items in cart.</p>
        ) : (
          items.map((item) => (
            <div key={item.id || item._id} className="flex items-start justify-between gap-3 text-sm">
              <div>
                <p className="font-medium text-theme-text leading-snug">{item.name}</p>
                <p className="text-theme-faint">Qty {item.quantity}</p>
              </div>
              <p className="font-semibold text-theme-text">₹{(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}</p>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-theme-border mt-5 pt-5 space-y-2 text-sm">
        <div className="flex items-center justify-between text-theme-faint">
          <span>Items ({totalItems})</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-theme-faint">
          <span>Shipping</span>
          <span>₹{(subtotal > 0 ? shippingFee : 0).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-lg font-bold text-theme-text pt-1">
          <span>Total</span>
          <motion.span key={total} initial={{ opacity: 0.4, y: 2 }} animate={{ opacity: 1, y: 0 }}>
            ₹{total.toFixed(2)}
          </motion.span>
        </div>
      </div>
    </aside>
  );
}
