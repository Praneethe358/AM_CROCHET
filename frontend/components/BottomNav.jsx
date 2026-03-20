"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, ReceiptText, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { cartItems } = useCart();
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Ensure hydration matches
  if (!mounted) return null;

  // Calculate cart items for badge
  const totalItems = cartItems ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;

  // Hide on deep product details page since it has its own sticky CTA bar
  const isProductDetailsPage = pathname?.startsWith("/products/");
  if (isProductDetailsPage) {
    return null;
  }

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Explore", href: "/products", icon: Search },
    { name: "Cart", href: "/cart", icon: ShoppingBag, badge: totalItems },
    { name: "Orders", href: "/orders", icon: ReceiptText },
    { name: "Profile", href: "/login", icon: User },
  ].map((item) => {
    if (item.name === "Profile") {
      return {
        ...item,
        href: isAuthenticated ? "/orders" : "/login",
        name: isAuthenticated ? "Account" : "Login",
      };
    }

    return item;
  });

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] z-50 pb-safe">
      <div className="bg-white/85 backdrop-blur-xl border border-[#EADFD0] rounded-3xl shadow-[0_8px_32px_rgba(200,169,126,0.2)] px-6 py-3 flex justify-between items-center relative overflow-hidden">
        
        {/* Very subtle noise blend for premium glass effect */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }}></div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="relative flex flex-col items-center justify-center w-12 h-12 focus:outline-none"
              aria-label={item.name}
            >
              <motion.div
                whileTap={{ scale: 0.92 }}
                className="relative flex flex-col items-center gap-1.5"
              >
                <motion.div 
                  initial={false}
                  animate={{ 
                    color: isActive ? "#C8A97E" : "#9A8F84",
                    y: isActive ? -2 : 0 
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative"
                >
                  <Icon 
                    size={22} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className="transition-colors duration-300"
                  />
                  
                  {/* Cart Badge with pop animation */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <AnimatePresence>
                      <motion.div
                        key={item.badge}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        className="absolute -top-2 -right-2 bg-[#C8A97E] text-white text-[10px] font-bold h-[18px] min-w-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                      >
                        {item.badge}
                      </motion.div>
                    </AnimatePresence>
                  )}
                </motion.div>
                
                {/* Active Indicator & Label */}
                <motion.span 
                  initial={false}
                  animate={{ 
                    color: isActive ? "#C8A97E" : "#9A8F84",
                    fontWeight: isActive ? 600 : 500
                  }}
                  className="text-[10px]"
                >
                  {item.name}
                </motion.span>
                
                {/* Active Dot under icon */}
                {isActive && (
                  <motion.div 
                    layoutId="activeBottomNav"
                    className="absolute -bottom-3 w-1 h-1 bg-[#C8A97E] rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}