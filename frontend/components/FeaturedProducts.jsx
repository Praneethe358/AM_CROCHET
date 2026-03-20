"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";

export default function FeaturedProducts() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
        const response = await axios.get(`${API_BASE_URL}/products?limit=3&sort=newest`);
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
  }, []);

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

    return featured.length ? featured.slice(0, 3) : fallback;
  }, [featured]);

  return (
    <section className="bg-theme-bg py-16 sm:py-20" id="featured-products">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-theme-accent text-2xl leading-none">•</p>
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-theme-text mt-1">Featured Collection</h2>
          <p className="text-theme-accent text-2xl leading-none mt-1">•</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map((card) => {
            const targetHref = card.id && !String(card.id).startsWith("featured-") ? `/products/${card.id}` : "/products";

            return (
              <Link
                key={card.id}
                href={targetHref}
                className="group relative overflow-hidden rounded-3xl border border-theme-accent/60 shadow-sm min-h-[420px]"
              >
                <Image
                  src={card.image}
                  alt={card.name || "Featured collection"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-6 text-white text-center">
                  <h3 className="text-2xl sm:text-3xl font-semibold uppercase tracking-wide line-clamp-2">{card.name}</h3>
                  <p className="mt-2 text-xl sm:text-2xl leading-none underline underline-offset-4">Explore Now</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
