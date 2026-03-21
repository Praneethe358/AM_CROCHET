"use client";
import React from "react";
import Button from "./Button";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";

export default function CartSummary() {
  const { cartItems } = useCart();
  
  const items = cartItems || [];
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  
  const shipping = subtotal > 0 ? 15.0 : 0;
  const total = subtotal + shipping;

  return (
    <div className="bg-gray-50/50 backdrop-blur-xl border border-gray-100/80 rounded-[2rem] p-8 sm:p-10 flex flex-col h-fit shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Order Summary</h2>
      
      <div className="space-y-5 mb-8">
        <div className="flex justify-between text-gray-500 font-medium">
          <span>Subtotal</span>
          <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-500 font-medium">
          <span>Shipping estimate</span>
          <span className="text-gray-900">₹{shipping.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="border-t border-gray-200/60 pt-6 mb-10">
        <div className="flex justify-between font-bold text-2xl text-gray-900 tracking-tight">
          <span>Total</span>
          <motion.span
            key={total}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >₹{total.toFixed(2)}
          </motion.span>
        </div>
      </div>
      
      <Link href="/checkout" className="block w-full">
        <Button variant="primary" className="w-full py-4 text-lg font-semibold rounded-2xl shadow-lg">
          Proceed to Checkout
        </Button>
      </Link>
    </div>
  );
}
