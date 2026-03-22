"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import QuantitySelector from "./QuantitySelector";
import Button from "./Button";
import { gsap } from "gsap";
import authClient from "@/services/authApi";
import { toast } from "react-hot-toast";
import { ChevronLeft, ChevronRight, ShoppingBag, Star, Heart, ShieldCheck, RotateCcw, Truck } from "lucide-react";
import { getOptimizedImageUrl, getResponsiveSizes } from "@/utils/cloudinaryImage";

export default function ProductDetails({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const containerRef = useRef(null);
  const textRefs = useRef([]);
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  const productId = product.id || product._id;
  const stockCount = Number(product.stock || 0);
  const hasStock = stockCount > 0;
  const isLowStock = stockCount > 0 && stockCount <= 5;
  const averageRating = Number(product.averageRating || 0);
  const reviewCount = Number(product.reviewCount || 0);

  const stockLabel = useMemo(() => {
    if (!hasStock) return "Out of stock";
    if (isLowStock) return `Only ${stockCount} left`;
    return "In stock";
  }, [hasStock, isLowStock, stockCount]);

  const galleryImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image || ""];

  const goPrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const goNextImage = () => {
    setActiveImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const onTouchStart = (event) => {
    touchStartXRef.current = event.changedTouches[0].clientX;
  };

  const onTouchEnd = (event) => {
    touchEndXRef.current = event.changedTouches[0].clientX;
    const delta = touchStartXRef.current - touchEndXRef.current;

    if (Math.abs(delta) < 40) return;

    if (delta > 0) {
      goNextImage();
    } else {
      goPrevImage();
    }
  };

  useEffect(() => {
    // GSAP Stagger Reveal for Text
    const ctx = gsap.context(() => {
      gsap.fromTo(
        textRefs.current,
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.1, 
          ease: "power3.out"
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    let mounted = true;

    const syncWishlist = async () => {
      if (!isAuthenticated || !productId) {
        if (mounted) setIsWishlisted(false);
        return;
      }

      try {
        const response = await authClient.get("/wishlist");
        const wishlistItems = response.data?.data || [];
        const exists = wishlistItems.some((item) => (item._id || item.id) === productId);
        if (mounted) setIsWishlisted(exists);
      } catch {
        if (mounted) setIsWishlisted(false);
      }
    };

    syncWishlist();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, productId]);

  const handleAddToCart = () => {
    if (!hasStock) {
      toast.error("This item is currently out of stock");
      return;
    }

    addToCart(product, quantity);
  };

  const handleWishlistToggle = async () => {
    if (!productId || wishlistLoading) return;

    if (!isAuthenticated) {
      toast.error("Please login to manage wishlist");
      if (typeof window !== "undefined") {
        const next = `${window.location.pathname}${window.location.search}`;
        window.location.href = `/login?next=${encodeURIComponent(next)}`;
      }
      return;
    }

    const nextState = !isWishlisted;
    setWishlistLoading(true);
    setIsWishlisted(nextState);

    try {
      if (nextState) {
        await authClient.post("/wishlist", { productId });
        toast.success("Added to wishlist");
      } else {
        await authClient.delete(`/wishlist/${productId}`);
        toast.success("Removed from wishlist");
      }
    } catch {
      setIsWishlisted(!nextState);
      toast.error("Could not update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const description = product.description || "Designed for both utility and aesthetics, this premium bag ensures you carry your essentials in style. Crafted from durable materials, it perfectly blends modern luxury with everyday functionality.";

  const addToRefs = (el) => {
    if (el && !textRefs.current.includes(el)) {
      textRefs.current.push(el);
    }
  };

  return (
    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-6 md:gap-8 lg:gap-10 mb-12 md:mb-12 relative">
      {/* Left side: Premium Image */}
      <div className="flex flex-col max-w-[420px] w-full">
        <div 
          className="relative aspect-square md:aspect-[3/4] bg-theme-secondary rounded-xl overflow-hidden group shadow-sm border border-theme-border"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-theme-bg/30 to-transparent z-10 pointer-events-none mix-blend-overlay"></div>
          <div className="w-full h-full relative">
            <Image
              src={getOptimizedImageUrl(galleryImages[activeImageIndex], { width: 1200 })}
              alt={product.name}
              fill
              priority
              sizes={getResponsiveSizes("detail")}
              className="object-cover mix-blend-multiply"
            />
          </div>

          <button
            type="button"
            onClick={handleWishlistToggle}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute right-3 top-3 z-20 h-9 w-9 rounded-full border border-theme-border bg-white/90 backdrop-blur-sm flex items-center justify-center transition-colors ${
              isWishlisted ? "text-red-500" : "text-theme-faint hover:text-theme-text"
            } ${wishlistLoading ? "opacity-70" : ""}`}
          >
            <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
          </button>

          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/80 text-theme-text border border-theme-border flex items-center justify-center"
                aria-label="Previous product image"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={goNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/80 text-theme-text border border-theme-border flex items-center justify-center"
                aria-label="Next product image"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>

        {galleryImages.length > 1 && (
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-2">
            {galleryImages.map((imageUrl, index) => (
              <button
                type="button"
                key={`${imageUrl}-${index}`}
                onClick={() => setActiveImageIndex(index)}
                className={`relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border ${
                  activeImageIndex === index ? "border-theme-accent" : "border-theme-border"
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <Image src={getOptimizedImageUrl(imageUrl, { width: 200 })} alt={`${product.name} ${index + 1}`} fill className="object-cover" sizes={getResponsiveSizes("thumbnail")} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right side: Modern Details */}
      <div className="flex flex-col justify-center py-1 md:py-0">
        <p ref={addToRefs} className="text-xs font-semibold text-theme-faint tracking-widest uppercase mb-2">
          {product.category}
        </p>
        <h1 ref={addToRefs} className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-serif text-theme-text mb-2.5 tracking-tight leading-tight">
          {product.name}
        </h1>
        <p ref={addToRefs} className="text-xl font-medium text-theme-text mb-4 tracking-tight">₹{Number(product.price || 0).toFixed(2)}
        </p>

        <div ref={addToRefs} className="mb-4 flex flex-wrap items-center gap-3 text-sm">
          <div className="inline-flex items-center gap-1 rounded-full bg-[#0b6b37]/10 px-3 py-1 text-[#0b6b37]">
            <Star size={14} fill="currentColor" />
            <span className="font-semibold">{averageRating > 0 ? averageRating.toFixed(1) : "New"}</span>
            <span className="text-xs text-[#0b6b37]/80">({reviewCount} reviews)</span>
          </div>

          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            hasStock
              ? isLowStock
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}>
            {stockLabel}
          </span>
        </div>
        
        <div ref={addToRefs} className="h-px bg-theme-border w-full mb-4"></div>

        <p ref={addToRefs} className="text-sm sm:text-base text-theme-text/80 mb-6 leading-relaxed font-normal max-w-xl">
          {description}
        </p>

        <div ref={addToRefs} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-theme-faint uppercase tracking-widest">Quantity</label>
            <QuantitySelector
              quantity={quantity}
              onIncrease={() => {
                if (!hasStock) return;
                setQuantity((q) => Math.min(q + 1, stockCount));
              }}
              onDecrease={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={!hasStock}
            />
          </div>
        </div>

        <div ref={addToRefs} className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="rounded-lg border border-theme-border bg-theme-bg px-3 py-2 text-xs text-theme-faint flex items-center gap-2">
            <ShieldCheck size={14} className="text-theme-text" />
            Secure checkout
          </div>
          <div className="rounded-lg border border-theme-border bg-theme-bg px-3 py-2 text-xs text-theme-faint flex items-center gap-2">
            <RotateCcw size={14} className="text-theme-text" />
            Easy returns
          </div>
          <div className="rounded-lg border border-theme-border bg-theme-bg px-3 py-2 text-xs text-theme-faint flex items-center gap-2">
            <Truck size={14} className="text-theme-text" />
            Fast delivery
          </div>
        </div>

        {/* Desktop Add to Cart */}
        <div ref={addToRefs} className="hidden md:flex gap-4">
          <Button 
            className={`w-full sm:w-auto flex-grow py-3 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 transform ${
              hasStock
                ? "bg-theme-text text-white hover:bg-theme-accent shadow-theme-accent/20 hover:scale-[1.02] active:scale-[0.98]"
                : "bg-gray-300 text-gray-600 cursor-not-allowed pointer-events-none shadow-gray-200"
            }`}
            onClick={handleAddToCart}
          >
            <ShoppingBag size={18} className="mr-2" />
            {hasStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </div>

      {/* Mobile Sticky Add to Cart Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-theme-bg/95 backdrop-blur-xl border-t border-theme-border p-3 shadow-[0_-10px_40px_rgba(44,44,44,0.05)] flex items-center gap-3 animate-in slide-in-from-bottom duration-500 pb-safe">
        <div className="flex-shrink-0">
          <p className="text-xs text-theme-faint font-medium mb-0.5 uppercase tracking-wider">Total</p>
          <p className="text-lg font-bold text-theme-text">₹{(Number(product.price || 0) * quantity).toFixed(2)}</p>
          <p className={`text-[11px] ${hasStock ? (isLowStock ? "text-amber-700" : "text-emerald-700") : "text-red-700"}`}>{stockLabel}</p>
        </div>
        <Button 
          className={`flex-1 py-3 rounded-xl text-base font-semibold transition-all flex justify-center items-center ${
            hasStock
              ? "bg-theme-text text-white active:bg-theme-accent active:scale-[0.98] shadow-md shadow-theme-text/10"
              : "bg-gray-300 text-gray-600 cursor-not-allowed pointer-events-none"
          }`}
          onClick={handleAddToCart}
        >
          <ShoppingBag size={18} className="mr-2" />
          {hasStock ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>
    </div>
  );
}