"use client";
import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const imageRef = useRef(null);
  const productId = product.id || product._id;
  const imageSrc = product.images?.[0] || product.image || "https://picsum.photos/200/300";

  const handleQuickAdd = (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <Link href={`/products/${productId}`} className="block group focus:outline-none">
      <motion.div 
        className="flex flex-col h-full bg-theme-bg rounded-2xl transition-all duration-500 will-change-transform border border-theme-border/70 shadow-sm hover:shadow-[0_10px_35px_rgba(44,44,44,0.08)]"
        whileHover={{ y: -8 }}
        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      >
        {/* Product Image Wrapper */}
        <div className="relative aspect-[4/5] overflow-hidden bg-theme-secondary rounded-t-2xl mb-4 border-b border-theme-border/70">
          <motion.div 
            className="w-full h-full relative"
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          >
            <Image
              ref={imageRef}
              src={imageSrc}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover mix-blend-multiply opacity-95 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.05] will-change-transform"
            />
          </motion.div>
          
          {/* Subtle warm overlay on hover */}
          <div className="absolute inset-0 bg-theme-accent/0 group-hover:bg-theme-accent/5 transition-colors duration-500"></div>

          {/* Quick Add Button (Persistent small button on Mobile, Fade and Slide In on Desktop) */}
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:left-0 sm:right-0 flex justify-end sm:justify-center sm:opacity-0 sm:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] sm:px-4 z-10">
            <motion.button
              onClick={handleQuickAdd}
              whileTap={{ scale: 0.9 }}
              className="flex items-center justify-center gap-2 rounded-full bg-theme-bg/95 backdrop-blur-md h-10 w-10 sm:h-auto sm:w-auto sm:px-6 sm:py-3 text-sm font-medium text-theme-text border border-theme-border shadow-md hover:bg-theme-accent hover:text-white hover:border-theme-accent transition-all focus:outline-none"
              aria-label="Quick Add"
            >
              <Plus size={18} className="sm:hidden" />
              <Plus size={16} className="hidden sm:block" /> 
              <span className="hidden sm:inline">Quick Add</span>
            </motion.button>
          </div>
        </div>
        
        {/* Product Information */}
        <div className="flex flex-col px-4 pb-4">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="text-base font-serif font-bold text-theme-text tracking-tight group-hover:text-theme-accent transition-colors">
                {product.name}
              </h3>
              <p className="text-sm font-medium text-theme-faint mt-1 uppercase tracking-widest text-[10px]">
                {product.category}
              </p>
            </div>
            <p className="text-base font-semibold text-theme-text bg-theme-secondary px-2.5 py-1 rounded-lg border border-theme-border/50">₹{Number(product.price || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
