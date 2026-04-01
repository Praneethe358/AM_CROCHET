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
  const { cartItems, clearCart } = useCart(); // Adjusted to useCart hook mapping

  // Safely get cart items to accommodate Context returning 'cart' or 'cartItems'
  const items = cartItems || [];
  const subtotal = items.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 1), 0);

  return (
    <div className="pt-24 md:pt-32 pb-36 md:pb-24 min-h-screen bg-white">
      <Container>
        <motion.div
          className="mb-6 md:mb-12 flex items-end justify-between gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Shopping Bag</h1>
            {items.length > 0 && (
              <p className="mt-1 text-xs md:text-sm text-gray-500">{items.length} item{items.length > 1 ? "s" : ""}</p>
            )}
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs md:text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          )}
        </motion.div>
        
        {items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="bg-gray-50 rounded-2xl md:rounded-[2rem] p-6 md:p-20 text-center border border-gray-100 flex flex-col items-center justify-center min-h-[40vh] md:min-h-[50vh]"
          >
             <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 md:mb-6 text-gray-400">
                <ShoppingBag size={40} strokeWidth={1.5} />
             </div>
             <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4 tracking-tight">Your bag is empty</h2>
             <p className="text-gray-500 mb-6 md:mb-10 max-w-md mx-auto text-sm md:text-lg leading-relaxed">
               You haven&apos;t added any items to your bag yet. Explore our premium collection to find your perfect match.
             </p>
             <Link href="/products">
               <Button variant="primary" className="px-6 md:px-8 py-3 md:py-4 rounded-full text-sm md:text-base font-semibold shadow-lg">
                 Continue Shopping
               </Button>
             </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 md:gap-10 lg:gap-16">
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
                className="sticky top-24 md:top-32"
              >
                <CartSummary />
              </motion.div>
            </div>
          </div>
        )}
      </Container>

      {items.length > 0 && (
        <div className="md:hidden fixed bottom-[84px] left-0 right-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur px-4 py-2.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-500">Subtotal</p>
            <p className="text-base font-bold text-gray-900">₹{subtotal.toFixed(2)}</p>
          </div>
          <Link href="/checkout">
            <Button variant="primary" className="px-4 py-2.5 text-sm rounded-lg">
              Checkout
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
