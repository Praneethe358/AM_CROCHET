"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import QuantitySelector from "./QuantitySelector";
import { useCart } from "@/context/CartContext";
import { resolveImageSrc } from "@/utils/cloudinaryImage";
import { buildProductPath } from "@/utils/seo";

export default function CartItem({ item }) {
  const { removeFromCart, increaseQuantity, decreaseQuantity } = useCart();
  const itemId = item?.id || item?._id || item?.productId;
  const productHref = buildProductPath(item);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 25 }}
      className="group rounded-xl border border-gray-100 p-3 sm:p-0 sm:rounded-none sm:border-0 sm:flex sm:flex-row sm:items-center sm:gap-6 py-3 sm:py-8 border-b sm:border-b-gray-100"
    >
      {/* Product Image */}
      <div className="w-24 h-24 sm:w-32 sm:h-32 relative bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100/50 mx-auto sm:mx-0">
        <Link href={productHref}>
          <Image
            src={resolveImageSrc(item.image, { width: 300 })}
            alt={item?.name || "Product image"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      </div>

      {/* Product Details */}
      <div className="flex-grow flex flex-col items-center sm:items-start text-center sm:text-left h-full justify-center mt-3 sm:mt-0">
        <Link
          href={productHref}
          className="text-base sm:text-lg font-bold text-gray-900 tracking-tight hover:text-gray-500 transition-colors line-clamp-1"
        >
          {item.name}
        </Link>
        <p className="text-gray-400 font-medium text-[10px] sm:text-xs tracking-wider sm:tracking-widest uppercase mt-1">{item.category}</p>
        <p className="text-base sm:text-lg font-semibold text-gray-800 mt-2">₹{item.price.toFixed(2)}</p>
      </div>

      {/* Controls & Action */}
      <div className="flex items-center justify-between sm:justify-center sm:flex-col sm:items-end gap-3 mt-3 sm:mt-0 w-full sm:w-auto">
        <QuantitySelector
          quantity={item.quantity}
          onIncrease={() => increaseQuantity(itemId)}
          onDecrease={() => decreaseQuantity(itemId)}
        />
        <motion.button
          whileHover={{ scale: 1.05, color: "#ef4444" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => removeFromCart(itemId)}
          className="flex items-center gap-1 text-xs sm:text-sm font-medium text-gray-400 hover:text-red-500 transition-colors focus:outline-none py-1 px-2 rounded-md"
        >
          <Trash2 size={16} strokeWidth={2} />
          Remove
        </motion.button>
      </div>
    </motion.div>
  );
}
