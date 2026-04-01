"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Hero from "@/components/Hero";

function SectionSkeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-theme-secondary/70 ${className}`} />;
}

const ThematicBannerStrip = dynamic(() => import("@/components/ThematicBannerStrip"), {
  ssr: false,
  loading: () => (
    <section className="bg-theme-bg py-4 sm:py-10">
      <div className="mx-auto max-w-7xl px-0 sm:px-6 lg:px-8">
        <SectionSkeleton className="h-[300px] w-full rounded-none sm:h-[360px] sm:rounded-3xl" />
      </div>
    </section>
  ),
});

const PromotionsShowcase = dynamic(() => import("@/components/PromotionsShowcase"), {
  ssr: false,
  loading: () => (
    <section className="bg-theme-bg px-3 py-6 md:px-8 md:py-12">
      <div className="mx-auto max-w-[1400px]">
        <SectionSkeleton className="mb-4 h-8 w-44" />
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
          <SectionSkeleton className="aspect-square w-full" />
          <SectionSkeleton className="aspect-square w-full" />
          <SectionSkeleton className="aspect-square w-full" />
          <SectionSkeleton className="aspect-square w-full" />
        </div>
      </div>
    </section>
  ),
});

const FeaturedProducts = dynamic(() => import("@/components/FeaturedProducts"), {
  ssr: false,
  loading: () => (
    <section className="bg-theme-bg py-12 sm:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-16">
        <div className="mb-8 flex justify-center">
          <SectionSkeleton className="h-8 w-52" />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5">
          <SectionSkeleton className="aspect-[16/9] w-full md:aspect-[21/9]" />
          <SectionSkeleton className="aspect-[16/9] w-full" />
        </div>
      </div>
    </section>
  ),
});

const FeaturesStrip = dynamic(() => import("@/components/FeaturesStrip"), {
  ssr: false,
  loading: () => (
    <section className="bg-theme-bg px-4 pb-16 sm:px-8">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-3 md:grid-cols-4">
        <SectionSkeleton className="h-20 w-full" />
        <SectionSkeleton className="h-20 w-full" />
        <SectionSkeleton className="h-20 w-full" />
        <SectionSkeleton className="h-20 w-full" />
      </div>
    </section>
  ),
});

const initialHomeData = {
  hero: {
    slides: [
      {
        image: "/bag.webp",
        title: "AM Crochet",
        subtitle: "Handcrafted Signature Bags",
        description: "Premium handmade crochet bags designed for everyday style.",
        link: "/products",
      },
    ],
  },
  featured: {
    items: [],
    maxItems: 6,
  },
  promotions: { thematicBanners: [], deals: [] },
};

export default function HomePageClient({ initialHomeData: serverData }) {
  const [deferredSectionsReady, setDeferredSectionsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const markReady = () => setDeferredSectionsReady(true);

    window.addEventListener("scroll", markReady, { once: true, passive: true });
    window.addEventListener("pointerdown", markReady, { once: true, passive: true });
    window.addEventListener("touchstart", markReady, { once: true, passive: true });
    window.addEventListener("keydown", markReady, { once: true });

    return () => {
      window.removeEventListener("scroll", markReady);
      window.removeEventListener("pointerdown", markReady);
      window.removeEventListener("touchstart", markReady);
      window.removeEventListener("keydown", markReady);
    };
  }, []);

  const homeData = {
    hero: serverData?.hero || initialHomeData.hero,
    featured: {
      items: Array.isArray(serverData?.featured?.items)
        ? serverData.featured.items
        : initialHomeData.featured.items,
      maxItems: serverData?.featured?.maxItems || initialHomeData.featured.maxItems,
    },
    promotions: {
      thematicBanners: Array.isArray(serverData?.promotions?.thematicBanners)
        ? serverData.promotions.thematicBanners
        : initialHomeData.promotions.thematicBanners,
      deals: Array.isArray(serverData?.promotions?.deals)
        ? serverData.promotions.deals
        : initialHomeData.promotions.deals,
    },
  };

  return (
    <>
      <Hero slides={homeData.hero?.slides} />
      {deferredSectionsReady ? (
        <>
          <ThematicBannerStrip
            initialSlides={
              Array.isArray(homeData.promotions?.thematicBanners) && homeData.promotions.thematicBanners.length > 0
                ? homeData.promotions.thematicBanners
                : undefined
            }
          />
          <PromotionsShowcase
            initialPromotions={
              Array.isArray(homeData.promotions?.deals) && homeData.promotions.deals.length > 0
                ? homeData.promotions.deals
                : undefined
            }
          />
          <FeaturedProducts
            initialItems={
              Array.isArray(homeData.featured?.items) && homeData.featured.items.length > 0
                ? homeData.featured.items
                : undefined
            }
            limit={homeData.featured?.maxItems || 6}
          />
          <FeaturesStrip />
        </>
      ) : null}
    </>
  );
}
