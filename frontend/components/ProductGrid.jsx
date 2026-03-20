"use client";
import React, { useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ProductGrid({ products }) {
  const gridRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Select all the cards inside the grid
    const cards = gridRef.current.children;
    
    if (cards.length > 0) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%", // Starts animation when top of grid hits 85% of viewport
            toggleActions: "play none none none"
          }
        }
      );
    }
  }, [products]);

  return (
    <div 
      ref={gridRef}
      className="grid grid-cols-[repeat(auto-fit,minmax(220px,320px))] justify-center gap-6 sm:gap-8 w-full"
    >
      {products.map((product) => (
        <div key={product.id || product._id} className="will-change-transform w-full">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
