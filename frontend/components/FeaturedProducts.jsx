"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { axiosWithRetry } from "@/lib/fetchWithRetry";
import axios from "axios";
import { getApiBaseCandidates } from "@/utils/apiBase";

import "swiper/css";
import "swiper/css/pagination";

import { resolveImageSrc } from "@/utils/cloudinaryImage";
import { buildProductPath } from "@/utils/seo";

export default function FeaturedProducts({ initialItems, limit = 6 }) {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const hasInitialItemsProp = Array.isArray(initialItems) && initialItems.length > 0;

  useEffect(() => {
    if (hasInitialItemsProp) {
      return;
    }

    const fetchFeaturedProducts = async () => {
      setLoading(true);
      setRetrying(false);

      try {
        const baseUrlCandidates = getApiBaseCandidates();

        const fetchOnce = async () => {
          let response = null;
          let lastError = null;

          for (const baseUrl of baseUrlCandidates) {
            try {
              response = await axios.get(`${baseUrl}/products?isFeatured=true&sort=featured&limit=${limit}`, {
                timeout: 8000,
              });
              break;
            } catch (requestError) {
              lastError = requestError;
            }
          }

          if (!response) {
            throw lastError || new Error("Unable to load featured products");
          }

          return response;
        };

        const response = await axiosWithRetry(fetchOnce, {
          retries: 3,
          retryDelay: 2000,
          onRetry: () => setRetrying(true),
        });

        const items = response.data?.data || [];

        setFeatured(
          items.map((item) => ({
            ...item,
            id: item._id,
            image: item.images?.[0] || item.image || "",
            hoverImage: item.images?.[1] || item.images?.[0] || item.image || "",
          }))
        );
      } catch (error) {
        console.error("Failed to load featured products", error);
        setFeatured([]);
      } finally {
        setLoading(false);
        setRetrying(false);
      }
    };

    fetchFeaturedProducts();
  }, [hasInitialItemsProp, limit]);

  const effectiveFeatured = useMemo(() => {
    if (hasInitialItemsProp) {
      return initialItems.map((item) => ({
        ...item,
        id: item._id || item.id,
        image: item.images?.[0] || item.image || "",
        hoverImage: item.images?.[1] || item.images?.[0] || item.image || "",
      }));
    }

    return featured;
  }, [hasInitialItemsProp, initialItems, featured]);

  const cards = useMemo(() => {
    return effectiveFeatured.length ? effectiveFeatured.slice(0, limit) : [];
  }, [effectiveFeatured, limit]);

  // Show skeleton while loading (no initial server data)
  if (loading && cards.length === 0) {
    return (
      <section className="bg-theme-bg py-12 sm:py-20" id="featured-products">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-16">
          <div className="mb-5 md:mb-8 text-center">
            <div className="mx-auto h-8 w-52 animate-pulse rounded-lg bg-theme-secondary/70" />
          </div>
          {retrying && (
            <div className="mb-4 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-theme-border bg-theme-card/90 px-4 py-1.5 text-xs text-theme-faint">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-theme-border border-t-theme-accent" />
                Connecting to server…
              </span>
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5">
            <div className="animate-pulse rounded-xl bg-theme-secondary/70 aspect-[16/9] md:aspect-[21/9] md:col-span-2" />
            <div className="animate-pulse rounded-xl bg-theme-secondary/70 aspect-[16/9]" />
            <div className="animate-pulse rounded-xl bg-theme-secondary/70 aspect-[16/9]" />
          </div>
        </div>
      </section>
    );
  }

  if (cards.length === 0) return null;

  const renderBannerCard = (card, idx, isMobile = false) => {
    const targetHref = card.id && !String(card.id).startsWith("featured-") ? buildProductPath(card) : "/products";
    const isPrimaryBanner = idx === 0;
    const imageSizes = isMobile
      ? "(max-width: 768px) 92vw, 45vw"
      : isPrimaryBanner
        ? "(max-width: 1024px) 92vw, 1200px"
        : "(max-width: 1024px) 46vw, 620px";
    const hasHoverImage = Boolean(card.hoverImage) && card.hoverImage !== card.image;

    return (
      <motion.article
        key={card.id}
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: prefersReducedMotion ? 0.12 : 0.5, delay: prefersReducedMotion ? 0 : Math.min(idx * 0.08, 0.32), ease: [0.22, 1, 0.36, 1] }}
        className={`group cursor-pointer ${!isMobile && isPrimaryBanner ? "md:col-span-2" : ""}`}
      >
        <Link
          href={targetHref}
          className={`relative block w-full overflow-hidden rounded-lg md:rounded-xl bg-theme-secondary ${
            isMobile
              ? "aspect-[16/10]"
              : isPrimaryBanner
                ? "aspect-[16/9] md:aspect-[21/9]"
                : "aspect-[16/9]"
          } border border-theme-border/50 shadow-sm`}
        >
          <Image
            src={resolveImageSrc(card.image, { width: 1400 })}
            alt={card.name || "Featured collection"}
            fill
            loading="lazy"
            className={`object-cover transition-all duration-500 group-hover:scale-105 ${hasHoverImage ? "group-hover:opacity-0" : ""}`}
            sizes={imageSizes}
          />
          {hasHoverImage ? (
            <Image
              src={resolveImageSrc(card.hoverImage, { width: 1400 })}
              alt={card.name ? `${card.name} alternate view` : "Featured collection alternate view"}
              fill
              loading="lazy"
              className="object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
              sizes={imageSizes}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <span className="absolute left-4 top-4 rounded-md border border-theme-border/70 bg-theme-accent/90 backdrop-blur-md px-4 py-1.5 text-[10px] font-bold tracking-widest text-theme-text uppercase shadow-sm">
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
      </motion.article>
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