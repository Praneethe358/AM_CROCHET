"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getActivePromotions, trackPromotionClick } from "@/services/promotionApi";

const audienceOrder = ["women", "teens", "college"];

const fallbackSlides = {
  women: {
    _id: "fallback-women",
    title: "Women Collection",
    description: "Elegant handcrafted bags for everyday confidence.",
    banner: "https://picsum.photos/seed/women-banner/1400/700",
    audience: "women",
    discount: 25,
  },
  teens: {
    _id: "fallback-teens",
    title: "Teens Collection",
    description: "Trendy and lightweight styles for daily college life.",
    banner: "https://picsum.photos/seed/teens-banner/1400/700",
    audience: "teens",
    discount: 20,
  },
  college: {
    _id: "fallback-college",
    title: "College Collection",
    description: "Spacious and stylish picks designed for busy campus days.",
    banner: "https://picsum.photos/seed/college-banner/1400/700",
    audience: "college",
    discount: 30,
  },
};

const getAudienceLabel = (audience) => {
  if (audience === "women") return "Women";
  if (audience === "teens") return "Teens";
  if (audience === "college") return "College";
  return "Collection";
};

export default function ThematicBannerStrip() {
  const [slides, setSlides] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
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
  }, []);

  const orderedSlides = useMemo(() => {
    const byAudience = new Map();

    slides.forEach((slide) => {
      if (slide?.audience && !byAudience.has(slide.audience)) {
        byAudience.set(slide.audience, slide);
      }
    });

    return audienceOrder.map((audience) => byAudience.get(audience) || fallbackSlides[audience]);
  }, [slides]);

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
    <section className="bg-theme-bg py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-theme-border bg-theme-secondary shadow-sm">
          <div className="grid md:grid-cols-2 items-center min-h-[360px]">
            <div className="relative h-[300px] sm:h-[360px] md:h-full">
              <Image
                src={activeSlide.banner || "https://picsum.photos/1400/700"}
                alt={activeSlide.title || "Thematic promotion banner"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-theme-text/40 to-transparent" />
            </div>

            <div className="p-6 sm:p-8 md:p-10">
              <p className="text-sm uppercase tracking-[0.2em] font-semibold text-theme-faint">{getAudienceLabel(activeSlide.audience)}</p>
              <h2 className="mt-2 text-3xl md:text-5xl font-semibold tracking-tight text-theme-text leading-tight">
                {activeSlide.title || "Season Collection"}
              </h2>
              <p className="mt-3 text-theme-muted text-base sm:text-lg leading-relaxed max-w-xl">
                {activeSlide.description || "Discover premium styles crafted for your daily lifestyle."}
              </p>
              {activeSlide.discount !== null && activeSlide.discount !== undefined ? (
                <p className="mt-4 text-lg font-semibold text-theme-accent">Up to {activeSlide.discount}% OFF</p>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href={`/products${activeSlide.audience ? `?audience=${activeSlide.audience}` : ""}`}
                  onClick={handleShopClick}
                  className="inline-flex items-center justify-center rounded-lg bg-theme-text px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                >
                  Shop now
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-lg border border-theme-border bg-white px-5 py-2.5 text-sm font-semibold text-theme-text hover:bg-theme-bg"
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
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-theme-text hover:bg-white"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next banner"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-theme-text hover:bg-white"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {orderedSlides.map((slide, index) => (
              <button
                key={`${slide._id}-${index}`}
                type="button"
                aria-label={`Go to banner ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${index === activeIndex ? "w-8 bg-theme-accent" : "w-2.5 bg-white/90"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
