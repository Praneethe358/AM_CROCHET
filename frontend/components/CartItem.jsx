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
      className="group flex flex-row gap-3 sm:gap-6 py-4 sm:py-6 border-b border-gray-100"
    >
      {/* Product Image */}
      <div className="w-20 h-20 sm:w-32 sm:h-32 relative bg-gray-50 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 shadow-sm mt-1 sm:mt-0">
        <Link href={productHref} className="block w-full h-full">
          <Image
            src={resolveImageSrc(item.image, { width: 300 })}
            alt={item?.name || "Product image"}
            fill
            sizes="(max-width: 640px) 80px, 128px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      </div>

      {/* Details & Controls wrapper */}
      <div className="flex-grow flex flex-col justify-between pt-0 sm:py-1 min-h-[5rem] sm:min-h-[8rem]">
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-col flex-1">
            <Link
              href={productHref}
              className="text-sm sm:text-lg font-bold text-gray-900 tracking-tight hover:text-gray-500 transition-colors line-clamp-2 leading-snug"
            >
              {item.name}
            </Link>
            <p className="text-gray-400 font-medium text-[9px] sm:text-xs tracking-wider uppercase mt-1">{item.category}</p>
          </div>
          <p className="text-sm sm:text-lg font-bold text-gray-900 shrink-0 mt-0.5">₹{item.price.toFixed(2)}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-3 mt-auto pt-3">
          <QuantitySelector
            quantity={item.quantity}
            onIncrease={() => increaseQuantity(itemId)}
            onDecrease={() => decreaseQuantity(itemId)}
          />
          <motion.button
            whileHover={{ scale: 1.05, color: "#ef4444" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => removeFromCart(itemId)}
            className="flex items-center gap-1 text-[11px] sm:text-sm font-medium text-gray-400 hover:text-red-500 transition-colors focus:outline-none p-1 shrink-0 -mr-1"
          >
            <Trash2 size={14} className="sm:w-4 sm:h-4 shrink-0" strokeWidth={2} />
            <span className="hidden xs:inline">Remove</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
