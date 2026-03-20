"use client";
// frontend/components/Button.jsx
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Button({ children, onClick, className = "", variant = "primary" }) {
  const baseStyle = "px-6 py-3 rounded-xl font-medium flex justify-center items-center gap-2 overflow-hidden relative transition-colors duration-300";
  
  const variants = {
    primary: "bg-theme-text text-theme-card hover:bg-theme-accent hover:text-white shadow-[0_4px_20px_rgba(0,0,0,0.06)]",
    secondary: "bg-theme-secondary text-theme-text hover:bg-[#EADFD0]",
    outline: "border-2 border-theme-accent text-theme-accent hover:bg-theme-accent hover:text-white",
    custom: "" // for overriding entirely
  };

  return (
    <motion.button 
      onClick={onClick} 
      className={cn(baseStyle, variants[variant], className)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.button>
  );
}
