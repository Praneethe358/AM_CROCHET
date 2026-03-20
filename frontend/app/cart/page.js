"use client";
import React from "react";
import Container from "@/components/Container";
import Button from "@/components/Button";
import Link from "next/link";
import CartItem from "@/components/CartItem";
import CartSummary from "@/components/CartSummary";
import { useCart } from "@/context/CartContext";
import { ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function CartPage() {
  const { cartItems } = useCart(); // Adjusted to useCart hook mapping

  // Safely get cart items to accommodate Context returning 'cart' or 'cartItems'
  const items = cartItems || [];

  return (
    <div className="pt-32 pb-24 min-h-screen bg-white">
      <Container>
        <motion.h1 
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-12 tracking-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Shopping Bag
        </motion.h1>
        
        {items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="bg-gray-50 rounded-[2rem] p-12 md:p-20 text-center border border-gray-100 flex flex-col items-center justify-center min-h-[50vh]"
          >
             <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-gray-400">
                <ShoppingBag size={40} strokeWidth={1.5} />
             </div>
             <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Your bag is empty</h2>
             <p className="text-gray-500 mb-10 max-w-md mx-auto text-lg leading-relaxed">
               You haven&apos;t added any items to your bag yet. Explore our premium collection to find your perfect match.
             </p>
             <Link href="/products">
               <Button variant="primary" className="px-8 py-4 rounded-full text-base font-semibold shadow-lg">
                 Continue Shopping
               </Button>
             </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            {/* Cart Items List */}
            <div className="flex-grow">
              <div className="border-t border-gray-200">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Cart Summary */}
            <div className="lg:w-[400px] flex-shrink-0">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="sticky top-32"
              >
                <CartSummary />
              </motion.div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
