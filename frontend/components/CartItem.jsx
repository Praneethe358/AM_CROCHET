"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import QuantitySelector from "./QuantitySelector";
import { useCart } from "@/context/CartContext";

export default function CartItem({ item }) {
  const { removeFromCart, increaseQuantity, decreaseQuantity } = useCart();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 25 }}
      className="flex flex-col sm:flex-row items-center gap-6 py-8 border-b border-gray-100 group"
    >
      {/* Product Image */}
      <div className="w-28 h-28 sm:w-36 sm:h-36 relative bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100/50">
        <Link href={`/products/${item.id}`}>
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      </div>

      {/* Product Details */}
      <div className="flex-grow flex flex-col items-center sm:items-start text-center sm:text-left h-full justify-center">
        <Link
          href={`/products/${item.id}`}
          className="text-xl font-bold text-gray-900 tracking-tight hover:text-gray-500 transition-colors"
        >
          {item.name}
        </Link>
        <p className="text-gray-400 font-medium text-xs tracking-widest uppercase mt-1.5">{item.category}</p>
        <p className="text-lg font-semibold text-gray-800 mt-3">${item.price.toFixed(2)}</p>
      </div>

      {/* Controls & Action */}
      <div className="flex flex-col items-center sm:items-end gap-4 mt-4 sm:mt-0 justify-center">
        <QuantitySelector
          quantity={item.quantity}
          onIncrease={() => increaseQuantity(item.id)}
          onDecrease={() => decreaseQuantity(item.id)}
        />
        <motion.button
          whileHover={{ scale: 1.05, color: "#ef4444" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => removeFromCart(item.id)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-red-500 transition-colors focus:outline-none py-1 px-2 rounded-md"
        >
          <Trash2 size={16} strokeWidth={2} />
          Remove
        </motion.button>
      </div>
    </motion.div>
  );
}
