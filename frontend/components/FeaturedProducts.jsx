"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

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

  const renderBannerCard = (card, idx, isMobile = false) => {
    const targetHref = card.id && !String(card.id).startsWith("featured-") ? `/products/${card.id}` : "/products";
    const isPrimaryBanner = idx === 0;

    return (
      <article key={card.id} className={`group cursor-pointer ${!isMobile && isPrimaryBanner ? "md:col-span-2" : ""}`}>
        <Link
          href={targetHref}
          className={`relative block w-full overflow-hidden rounded-2xl bg-gray-50 ${
            isMobile
              ? "aspect-[16/10]"
              : isPrimaryBanner
                ? "aspect-[16/9] md:aspect-[18/7]"
                : "aspect-[16/9]"
          }`}
        >
          <Image
            src={card.image}
            alt={card.name || "Featured collection"}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes={isMobile ? "100vw" : isPrimaryBanner ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />

          <span className="absolute left-3 top-3 rounded-full bg-[#0b4e6e] px-3 py-1 text-[10px] font-semibold tracking-wider text-white uppercase">
            New
          </span>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className={`line-clamp-2 font-semibold uppercase tracking-wide drop-shadow-sm ${isMobile ? "text-base" : isPrimaryBanner ? "text-lg md:text-2xl" : "text-base md:text-lg"}`}>
              {card.name}
            </h3>
            <span className="mt-1.5 inline-block text-xs md:text-sm font-medium underline underline-offset-2">
              Explore Now
            </span>
          </div>
        </Link>
      </article>
    );
  };

  return (
    <section className="bg-white py-8 sm:py-12" id="featured-products">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-16">
        <div className="mb-5 md:mb-8 text-center">
          <h2 className="text-2xl md:text-4xl font-semibold text-[#0b4e6e]">
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