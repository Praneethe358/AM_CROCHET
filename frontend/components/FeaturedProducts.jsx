"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";

export default function FeaturedProducts({ initialItems = [], limit = 3 }) {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    if (Array.isArray(initialItems) && initialItems.length) {
      return;
    }

    const fetchFeaturedProducts = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
        const response = await axios.get(`${API_BASE_URL}/products?isFeatured=true&sort=featured&limit=${limit}`);
        const items = response.data?.data || [];

        setFeatured(
          items.map((item) => ({
            ...item,
            id: item._id,
            image: item.image || item.images?.[0] || "https://picsum.photos/1200/1600",
          }))
        );
      } catch (error) {
        console.error("Failed to load featured products", error);
        setFeatured([]);
      }
    };

    fetchFeaturedProducts();
  }, [initialItems, limit]);

  const effectiveFeatured = useMemo(() => {
    if (Array.isArray(initialItems) && initialItems.length) {
      return initialItems.map((item) => ({
        ...item,
        id: item._id || item.id,
        image: item.image || item.images?.[0] || "https://picsum.photos/1200/1600",
      }));
    }

    return featured;
  }, [initialItems, featured]);

  const cards = useMemo(() => {
    const fallback = [
      {
        id: "featured-1",
        name: "Gift Shop Collection",
        image: "https://picsum.photos/seed/featured-1/1200/1600",
      },
      {
        id: "featured-2",
        name: "Signature Collection",
        image: "https://picsum.photos/seed/featured-2/1200/1600",
      },
      {
        id: "featured-3",
        name: "Alt Collection",
        image: "https://picsum.photos/seed/featured-3/1200/1600",
      },
    ];

    return effectiveFeatured.length ? effectiveFeatured.slice(0, limit) : fallback.slice(0, limit);
  }, [effectiveFeatured, limit]);

  return (
    <section className="bg-[#Fbf9f6] py-8 sm:py-20" id="featured-products">
      <div className="mx-auto max-w-[1400px] px-3 sm:px-6 lg:px-8">
        
        {/* Header matching exactly */}
        <div className="text-center flex justify-center items-center gap-2 mb-6 sm:gap-4 sm:mb-10">
          <span className="text-[#e27339] text-[15px] sm:text-[20px] leading-none">•</span>
          <h2 className="text-[17px] md:text-[23px] font-bold text-[#2b4c5c] font-serif tracking-wide pt-1">Featured Collection</h2>
          <span className="text-[#e27339] text-[15px] sm:text-[20px] leading-none">•</span>
        </div>

        <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-2 sm:gap-3 md:gap-[18px] pb-4 md:pb-0 snap-x snap-mandatory -mx-3 px-3 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {cards.map((card) => {
            const targetHref = card.id && !String(card.id).startsWith("featured-") ? `/products/${card.id}` : "/products";
            return (
              <Link
                key={card.id}
                href={targetHref}
                className="min-w-[55%] sm:min-w-[45%] md:min-w-0 snap-center group relative overflow-hidden rounded-[8px] border-[1px] border-[#d5a067]/30 shadow-sm aspect-[1/1.05] bg-[#f5f5f5]"
              >
                <Image
                  src={card.image}
                  alt={card.name || "Featured collection"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 flex flex-col items-center justify-center text-white">
                  <h3 className="text-[12px] md:text-[19px] font-medium tracking-[0.1em] mb-1 text-center">
                    {card.name.toUpperCase()}
                  </h3>
                  <span className="text-[11px] md:text-[13px] leading-none underline underline-offset-[5px] decoration-white/80 hover:decoration-white transition-colors">
                    Explore Now
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}