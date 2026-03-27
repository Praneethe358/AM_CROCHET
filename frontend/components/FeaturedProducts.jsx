"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import { getOptimizedImageUrl } from "@/utils/cloudinaryImage";

export default function FeaturedProducts({ initialItems = [], limit = 6 }) {
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
            image: item.image || item.images?.[0] || "",
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
        image: item.image || item.images?.[0] || "",
      }));
    }

    return featured;
  }, [initialItems, featured]);

  const cards = useMemo(() => {
    return effectiveFeatured.length ? effectiveFeatured.slice(0, limit) : [];
  }, [effectiveFeatured, limit]);

  if (cards.length === 0) return null;

  const renderBannerCard = (card, idx, isMobile = false) => {
    const targetHref = card.id && !String(card.id).startsWith("featured-") ? `/products/${card.id}` : "/products";
    const isPrimaryBanner = idx === 0;
    const imageSizes = isMobile
      ? "(max-width: 768px) 92vw, 45vw"
      : isPrimaryBanner
        ? "(max-width: 1024px) 92vw, 1200px"
        : "(max-width: 1024px) 46vw, 620px";

    return (
      <article key={card.id} className={`group cursor-pointer ${!isMobile && isPrimaryBanner ? "md:col-span-2" : ""}`}>
        <Link
          href={targetHref}
          className={`relative block w-full overflow-hidden rounded-[2rem] bg-theme-secondary ${
            isMobile
              ? "aspect-[16/10]"
              : isPrimaryBanner
                ? "aspect-[16/9] md:aspect-[21/9]"
                : "aspect-[16/9]"
          } border border-theme-border/50 shadow-sm`}
        >
          <Image
            src={getOptimizedImageUrl(card.image, { width: 1400 })}
            alt={card.name || "Featured collection"}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes={imageSizes}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <span className="absolute left-4 top-4 rounded-full bg-theme-accent/90 backdrop-blur-md px-4 py-1.5 text-[10px] font-bold tracking-widest text-theme-text uppercase">
            New
          </span>

          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h3 className={`line-clamp-2 font-bold uppercase tracking-widest drop-shadow-md ${isMobile ? "text-lg" : isPrimaryBanner ? "text-xl md:text-3xl" : "text-lg md:text-xl"}`}>
              {card.name}
            </h3>
            <span className="mt-2 inline-flex items-center gap-2 text-xs md:text-sm font-semibold uppercase tracking-widest opacity-90 group-hover:opacity-100 transition-opacity">
              Explore Collection
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </span>
          </div>
        </Link>
      </article>
    );
  };

  return (
    <section className="bg-theme-bg py-12 sm:py-20" id="featured-products">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-16">
        <div className="mb-5 md:mb-8 text-center">
          <h2 className="text-theme-text font-bold">
            Featured Collection
          </h2>
        </div>

        <div className="md:hidden">
          <Swiper
            modules={[Autoplay, Pagination]}
            slidesPerView={1.08}
            spaceBetween={12}
            autoplay={{ delay: 3200, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            className="featured-banners-swiper !pb-8"
          >
            {cards.map((card, idx) => (
              <SwiperSlide key={card.id}>{renderBannerCard(card, idx, true)}</SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
          {cards.map((card, idx) => {
            return renderBannerCard(card, idx);
          })}
        </div>
      </div>
    </section>
  );
}