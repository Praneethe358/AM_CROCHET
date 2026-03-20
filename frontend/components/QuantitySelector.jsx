"use client";
import React from "react";
import { motion } from "framer-motion";

export default function QuantitySelector({ quantity, onIncrease, onDecrease }) {
  return (
    <div className="flex items-center bg-gray-50 border border-gray-100 rounded-full w-32 h-11 p-1 shadow-sm">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onDecrease}
        className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 rounded-full focus:outline-none transition-colors"
      >
        <span className="text-lg font-medium">−</span>
      </motion.button>
      <div className="flex-1 flex items-center justify-center text-sm font-semibold text-gray-900">
        <motion.span
          key={quantity}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {quantity}
        </motion.span>
      </div>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onIncrease}
        className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 rounded-full focus:outline-none transition-colors"
      >
        <span className="text-lg font-medium">+</span>
      </motion.button>
    </div>
  );
}
