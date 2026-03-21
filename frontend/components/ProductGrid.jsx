"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ProductGrid({ products }) {
  const gridRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    const unique = new Set((products || []).map((item) => String(item.category || "").trim()).filter(Boolean));
    return ["all", ...Array.from(unique)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return (products || []).filter((item) => {
      const categoryMatch =
        selectedCategory === "all"
          ? true
          : String(item.category || "").toLowerCase() === String(selectedCategory).toLowerCase();

      if (!categoryMatch) return false;
      if (!normalizedQuery) return true;

      const name = String(item.name || "").toLowerCase();
      const category = String(item.category || "").toLowerCase();

      return name.includes(normalizedQuery) || category.includes(normalizedQuery);
    });
  }, [products, selectedCategory, searchQuery]);

  const displayedProducts = useMemo(() => {
    const next = [...filteredProducts];

    if (sortBy === "price-low") {
      next.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "price-high") {
      next.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === "rating") {
      next.sort((a, b) => Number(b.averageRating || 0) - Number(a.averageRating || 0));
    } else {
      next.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return next;
  }, [filteredProducts, sortBy]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Select all the cards inside the grid
    const cards = gridRef.current?.children || [];
    
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
  }, [displayedProducts]);

  const activeSortLabel = useMemo(() => {
    if (sortBy === "price-low") return "Price ↑";
    if (sortBy === "price-high") return "Price ↓";
    if (sortBy === "rating") return "Top Rated";
    return "Newest";
  }, [sortBy]);

  const hasActiveFilters = selectedCategory !== "all" || sortBy !== "newest" || searchQuery.trim().length > 0;

  const resetFilters = () => {
    setSelectedCategory("all");
    setSortBy("newest");
    setSearchQuery("");
  };

  return (
    <div className="w-full">
      <div className="sticky top-16 z-20 mb-4 rounded-xl border border-theme-border bg-white/95 backdrop-blur px-3 py-2 md:px-4 md:py-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-xs md:text-sm font-semibold text-theme-text">{displayedProducts.length} items</p>
          <p className="text-[11px] md:text-xs text-theme-faint">Sort & Filter</p>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search products"
          className="mb-2 w-full rounded-lg border border-theme-border bg-white px-3 py-2 text-xs md:text-sm text-theme-text placeholder:text-theme-faint"
        />

        <div className="grid grid-cols-2 gap-2">
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="w-full rounded-lg border border-theme-border bg-white px-2.5 py-2 text-xs md:text-sm text-theme-text"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="w-full rounded-lg border border-theme-border bg-white px-2.5 py-2 text-xs md:text-sm text-theme-text"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {hasActiveFilters && (
          <div className="mt-2 flex items-center gap-2 overflow-x-auto">
            {searchQuery.trim().length > 0 && (
              <span className="shrink-0 rounded-full bg-theme-secondary border border-theme-border px-2.5 py-1 text-[11px] text-theme-text">
                Search: {searchQuery.trim()}
              </span>
            )}

            {selectedCategory !== "all" && (
              <span className="shrink-0 rounded-full bg-theme-secondary border border-theme-border px-2.5 py-1 text-[11px] text-theme-text">
                {selectedCategory}
              </span>
            )}

            {sortBy !== "newest" && (
              <span className="shrink-0 rounded-full bg-theme-secondary border border-theme-border px-2.5 py-1 text-[11px] text-theme-text">
                {activeSortLabel}
              </span>
            )}

            <button
              type="button"
              onClick={resetFilters}
              className="shrink-0 rounded-full border border-theme-border px-2.5 py-1 text-[11px] font-medium text-theme-text hover:bg-theme-secondary"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 w-full"
      >
        {displayedProducts.map((product) => (
          <div key={product.id || product._id} className="will-change-transform min-w-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {!displayedProducts.length && (
        <div className="mt-10 rounded-xl border border-theme-border bg-theme-secondary px-4 py-8 text-center">
          <p className="text-sm font-medium text-theme-text">No products found for this filter.</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-3 rounded-lg border border-theme-border bg-white px-3 py-1.5 text-xs font-medium text-theme-text hover:bg-theme-bg"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
