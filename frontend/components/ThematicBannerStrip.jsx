"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getActivePromotions, trackPromotionClick } from "@/services/promotionApi";
import { getOptimizedImageUrl } from "@/utils/cloudinaryImage";

const audienceOrder = ["women", "teens", "college"];

const fallbackSlides = {};

const getAudienceLabel = (audience) => {
  if (audience === "women") return "Women";
  if (audience === "teens") return "Teens";
  if (audience === "college") return "College";
  return "Collection";
};

export default function ThematicBannerStrip({ initialSlides = [] }) {
  const [slides, setSlides] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (Array.isArray(initialSlides) && initialSlides.length) {
      return;
    }

    const loadSlides = async () => {
      try {
        const results = await getActivePromotions({ placement: "home_thematic_banner" });
        setSlides(results || []);
      } catch (error) {
        console.error("Failed to load thematic banners", error);
        setSlides([]);
      }
    };

    loadSlides();
  }, [initialSlides]);

  const effectiveSlides = useMemo(() => {
    if (Array.isArray(initialSlides) && initialSlides.length) {
      return initialSlides;
    }

    return slides;
  }, [initialSlides, slides]);

  const orderedSlides = useMemo(() => {
    // Only show what's actually in Atlas; no fallbacks.
    return effectiveSlides;
  }, [effectiveSlides]);

  useEffect(() => {
    if (!orderedSlides.length) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % orderedSlides.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [orderedSlides]);

  const activeSlide = orderedSlides[activeIndex] || orderedSlides[0];

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + orderedSlides.length) % orderedSlides.length);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % orderedSlides.length);
  };

  const handleShopClick = async () => {
    if (activeSlide?._id && !activeSlide._id.startsWith("fallback")) {
      await trackPromotionClick(activeSlide._id);
    }
  };

  if (!activeSlide) {
    return null;
  }

  return (
    <section className="bg-theme-bg py-4 sm:py-10">
      <div className="mx-auto max-w-7xl px-0 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-none sm:rounded-3xl border-0 sm:border border-theme-border bg-theme-secondary shadow-sm">
          <div className="grid items-center md:grid-cols-2 min-h-[290px] sm:min-h-[360px]">
            <div className="relative h-[220px] sm:h-[360px] md:h-full">
              <Image
                src={getOptimizedImageUrl(activeSlide.banner || "", { width: 1400 })}
                alt={activeSlide.title || "Thematic promotion banner"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-theme-text/40 to-transparent" />
            </div>

            <div className="p-4 sm:p-8 md:p-10">
              <p className="text-xs sm:text-sm uppercase tracking-[0.18em] font-semibold text-theme-faint">{getAudienceLabel(activeSlide.audience)}</p>
              <h2 className="mt-1.5 text-4xl md:text-5xl font-semibold tracking-tight text-theme-text leading-tight">
                {activeSlide.title || "Season Collection"}
              </h2>
              <p className="mt-2 text-theme-muted text-sm sm:text-lg leading-relaxed max-w-xl">
                {activeSlide.description || "Discover premium styles crafted for your daily lifestyle."}
              </p>
              {activeSlide.discount !== null && activeSlide.discount !== undefined ? (
                <p className="mt-3 text-lg font-semibold text-theme-accent">Up to {activeSlide.discount}% OFF</p>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href={`/products${activeSlide.audience ? `?audience=${activeSlide.audience}` : ""}`}
                  onClick={handleShopClick}
                  className="inline-flex items-center justify-center bg-black px-6 py-2.5 text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase text-white hover:bg-black/90 transition-colors"
                >
                  Shop now
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center border border-gray-300 bg-transparent px-6 py-2.5 text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase text-black hover:bg-gray-50 transition-colors"
                >
                  Explore more
                </Link>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous banner"
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 sm:p-2 text-theme-text hover:bg-white"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next banner"
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 sm:p-2 text-theme-text hover:bg-white"
          >
            <ChevronRight size={16} />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2">
            {orderedSlides.map((slide, index) => (
              <button
                key={`${slide._id}-${index}`}
                type="button"
                aria-label={`Go to banner ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition-all ${index === activeIndex ? "w-7 bg-theme-accent" : "w-2 bg-white/90"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
