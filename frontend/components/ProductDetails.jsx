"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import QuantitySelector from "./QuantitySelector";
import Button from "./Button";
import { gsap } from "gsap";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";

export default function ProductDetails({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { addToCart } = useCart();
  const containerRef = useRef(null);
  const textRefs = useRef([]);
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  const galleryImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image || "https://picsum.photos/200/300"];

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

  const handleAddToCart = () => {
    addToCart(product, quantity);
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
              src={galleryImages[activeImageIndex]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover mix-blend-multiply"
            />
          </div>

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
                <Image src={imageUrl} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
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
        
        <div ref={addToRefs} className="h-px bg-theme-border w-full mb-4"></div>

        <p ref={addToRefs} className="text-sm sm:text-base text-theme-text/80 mb-6 leading-relaxed font-normal max-w-xl">
          {description}
        </p>

        <div ref={addToRefs} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-theme-faint uppercase tracking-widest">Quantity</label>
            <QuantitySelector
              quantity={quantity}
              onIncrease={() => setQuantity(q => q + 1)}
              onDecrease={() => setQuantity(q => Math.max(1, q - 1))}
            />
          </div>
        </div>

        {/* Desktop Add to Cart */}
        <div ref={addToRefs} className="hidden md:flex gap-4">
          <Button 
            className="w-full sm:w-auto flex-grow py-3 rounded-xl text-sm font-semibold bg-theme-text text-white hover:bg-theme-accent shadow-lg shadow-theme-accent/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleAddToCart}
          >
            <ShoppingBag size={18} className="mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Mobile Sticky Add to Cart Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-theme-bg/95 backdrop-blur-xl border-t border-theme-border p-4 shadow-[0_-10px_40px_rgba(44,44,44,0.05)] flex items-center gap-4 animate-in slide-in-from-bottom duration-500 pb-safe">
        <div className="flex-shrink-0">
          <p className="text-xs text-theme-faint font-medium mb-0.5 uppercase tracking-wider">Total</p>
          <p className="text-lg font-bold text-theme-text">₹{(Number(product.price || 0) * quantity).toFixed(2)}</p>
        </div>
        <Button 
          className="flex-1 py-3.5 rounded-xl text-base font-semibold bg-theme-text text-white active:bg-theme-accent active:scale-[0.98] transition-all flex justify-center items-center shadow-md shadow-theme-text/10"
          onClick={handleAddToCart}
        >
          <ShoppingBag size={18} className="mr-2" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}