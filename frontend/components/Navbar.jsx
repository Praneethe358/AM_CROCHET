"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Container from "./Container";
import Logo from "./Logo";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  // Calculate total items for badge
  const totalItems = cartItems ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scrolling when menu is open
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Blog", href: "/blog" },
    { name: "Orders", href: "/orders" },
  ];

  // If user is admin, add Admin link
  if (user?.role === "admin") {
    navLinks.push({ name: "Admin", href: "/admin" });
  }

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const isHomePage = pathname === "/";
  // The header is transparent if we are on the homepage AND haven't scrolled down yet
  const isTransparent = isHomePage && !scrolled;

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
          isTransparent
            ? "bg-transparent py-6 md:py-8"
            : scrolled
              ? "bg-white/95 backdrop-blur-xl border-b border-gray-100 py-3 md:py-4 shadow-sm"
              : "bg-white py-4 md:py-6 border-b border-gray-100"
        }`}
      >
        <Container>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Logo
              variant={isTransparent ? "light" : "dark"}
              priority
              className="relative z-10 shrink-0"
              imageClassName="h-8 md:h-10 lg:h-12"
              showText
              textClassName={`hidden md:inline-block text-[11px] md:text-xs ${isTransparent ? "text-white/95" : "text-black"}`}
              alt="AM Crochet Bags brand logo"
              ariaLabel="AM Crochet Bags home"
            />

            {/* Center Navigation (Desktop) */}
            <div className="hidden md:flex space-x-12 items-center">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`group relative py-2 text-xs uppercase tracking-[0.2em] font-medium transition-colors duration-500 focus:outline-none ${
                      isTransparent ? "text-white/90 hover:text-white" : "text-gray-600 hover:text-black"
                    }`}
                  >
                    {link.name}
                    {/* Active / Hover subtle underline */}
                    <span className={`absolute left-0 bottom-0 block h-[1px] bg-current transition-all duration-500 ease-out ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}></span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side */}
            <div className={`flex items-center space-x-5 md:space-x-8 transition-colors duration-500 ${isTransparent ? 'text-white' : 'text-black'}`}>
              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isTransparent ? 'border-white/20 bg-white/10' : 'border-gray-200 bg-gray-50'}`}>
                    <User size={14} className={isTransparent ? 'text-white' : 'text-gray-500'} />
                    <span className="text-xs font-medium tracking-wide max-w-[100px] truncate">{user?.name || "Account"}</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLogout}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-widest uppercase transition-all duration-500 ${isTransparent ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-gray-800'}`}
                  >
                    Logout
                  </motion.button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-4">
                  <Link href="/login" className="text-xs font-medium tracking-widest uppercase hover:opacity-70 transition-opacity">
                    Login
                  </Link>
                  <Link href="/signup" className={`flex items-center justify-center px-5 py-2 rounded-full text-xs font-medium tracking-widest uppercase transition-all duration-500 ${isTransparent ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-gray-800'}`}>
                    Sign Up
                  </Link>
                </div>
              )}

              <Link href="/cart" className="relative transition-opacity duration-500 hover:opacity-70 focus:outline-none flex items-center justify-center h-10 w-10">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <ShoppingBag size={20} strokeWidth={1.5} className="transition-colors duration-500" />
                </motion.div>
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className={`absolute top-1.5 right-1 text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center -translate-y-1/2 translate-x-1/2 ${isTransparent ? 'bg-white text-black' : 'bg-black text-white'}`}
                    >
                      {totalItems}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>

              {/* Mobile menu button */}
              <button
                className="md:hidden transition-opacity hover:opacity-70 focus:outline-none rounded-lg p-2 -mr-2"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open Menu"
              >
                <Menu size={24} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </Container>
      </motion.nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-in drawer */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#FDF6EC] z-50 shadow-2xl md:hidden border-l border-[#EADFD0] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-theme-border">
                <Logo
                  variant="dark"
                  imageClassName="h-8 w-auto"
                  showText
                  textClassName="text-xs text-[#2C2C2C]"
                  alt="AM Crochet Bags logo"
                  ariaLabel="AM Crochet Bags home"
                />
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 -mr-2 text-[#2C2C2C] hover:text-[#C8A97E] transition-colors rounded-full bg-[#F7EFE5]"
                >
                  <X size={20} strokeWidth={2} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-6 flex flex-col space-y-6">
                {navLinks.map(link => {
                  const isActive = pathname === link.href;
                  return (
                    <Link 
                      key={link.name} 
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-2xl font-serif tracking-tight transition-colors duration-300 ${isActive ? "text-[#C8A97E]" : "text-[#2C2C2C] hover:text-[#C8A97E]"}`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>

              <div className="p-6 border-t border-[#EADFD0] flex flex-col gap-4">
                {isAuthenticated ? (
                  <>
                    <div className="w-full flex items-center justify-center gap-2 bg-[#F7EFE5] text-[#2C2C2C] py-4 rounded-xl font-medium border border-[#EADFD0]">
                      <User size={18} className="text-[#C8A97E]" />
                      {user?.name || "Account"}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 bg-[#2C2C2C] text-white py-4 rounded-xl font-medium"
                    >
                      <LogOut size={18} />
                      Logout
                    </motion.button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 bg-[#2C2C2C] text-white py-4 rounded-xl font-medium"
                    >
                      <User size={18} />
                      Login
                    </Link>
                    <Link 
                      href="/signup" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 bg-transparent text-[#2C2C2C] border-2 border-[#EADFD0] py-4 rounded-xl font-medium"
                    >
                      Create Account
                    </Link>
                  </>
                )}
                <Link 
                  href="/cart" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-transparent text-[#2C2C2C] border-2 border-[#EADFD0] py-4 rounded-xl font-medium"
                >
                  <ShoppingBag size={18} />
                  View Cart {totalItems > 0 && `(${totalItems})`}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
