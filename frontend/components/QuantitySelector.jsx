"use client";
import React from "react";
import { motion } from "framer-motion";

export default function QuantitySelector({ quantity, onIncrease, onDecrease, disabled = false }) {
  return (
    <div className={`flex items-center border rounded-full w-24 h-9 sm:w-32 sm:h-11 p-0.5 sm:p-1 shadow-sm ${disabled ? "bg-gray-100 border-gray-200 opacity-60" : "bg-gray-50 border-gray-100"}`}>
      <motion.button
        whileTap={disabled ? undefined : { scale: 0.9 }}
        onClick={onDecrease}
        disabled={disabled}
        className="w-8 sm:w-10 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 rounded-full focus:outline-none transition-colors disabled:cursor-not-allowed disabled:hover:text-gray-500 disabled:hover:bg-transparent"
      >
        <span className="text-base sm:text-lg font-medium">−</span>
      </motion.button>
      <div className="flex-1 flex items-center justify-center text-xs sm:text-sm font-semibold text-gray-900">
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
        whileTap={disabled ? undefined : { scale: 0.9 }}
        onClick={onIncrease}
        disabled={disabled}
        className="w-8 sm:w-10 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 rounded-full focus:outline-none transition-colors disabled:cursor-not-allowed disabled:hover:text-gray-500 disabled:hover:bg-transparent"
      >
        <span className="text-base sm:text-lg font-medium">+</span>
      </motion.button>
    </div>
  );
}
