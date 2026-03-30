"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import ThematicBannerStrip from "@/components/ThematicBannerStrip";
import FeaturedProducts from "@/components/FeaturedProducts";
import PromotionsShowcase from "@/components/PromotionsShowcase";
import FeaturesStrip from "@/components/FeaturesStrip";
import { getHomeData } from "@/services/homeApi";

const initialHomeData = {
  hero: {
    slides: [],
  },
  featured: {
    items: [],
    maxItems: 6,
  },
  promotions: { thematicBanners: [], deals: [] },
};

export default function HomePageClient() {
  const [homeData, setHomeData] = useState(initialHomeData);
  const [isRefreshing, setIsRefreshing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadHomeData = async () => {
      try {
        const data = await getHomeData();
        if (!isMounted || !data) return;

        setHomeData((prev) => ({
          hero: data.hero || prev.hero,
          featured: {
            items: Array.isArray(data.featured?.items) && data.featured.items.length
              ? data.featured.items
              : prev.featured.items,
            maxItems: data.featured?.maxItems || prev.featured.maxItems,
          },
          promotions: {
            thematicBanners: Array.isArray(data.promotions?.thematicBanners)
              ? data.promotions.thematicBanners
              : prev.promotions.thematicBanners,
            deals: Array.isArray(data.promotions?.deals)
              ? data.promotions.deals
              : prev.promotions.deals,
          },
        }));
      } finally {
        if (isMounted) {
          setIsRefreshing(false);
        }
      }
    };

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      {isRefreshing ? (
        <div className="fixed top-24 right-4 z-40 rounded-full border border-theme-border bg-theme-card/95 px-3 py-1.5 text-[11px] font-medium tracking-wide text-theme-faint shadow-sm">
          Refreshing content...
        </div>
      ) : null}
      <Hero slides={homeData.hero?.slides} />
      <ThematicBannerStrip initialSlides={homeData.promotions?.thematicBanners || []} />
      <PromotionsShowcase initialPromotions={homeData.promotions?.deals || []} />
      <FeaturedProducts
        initialItems={homeData.featured?.items || []}
        limit={homeData.featured?.maxItems || 6}
      />
      <FeaturesStrip />
    </>
  );
}
