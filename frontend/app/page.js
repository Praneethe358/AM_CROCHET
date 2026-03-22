"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import ThematicBannerStrip from "@/components/ThematicBannerStrip";
import FeaturedProducts from "@/components/FeaturedProducts";
import PromotionsShowcase from "@/components/PromotionsShowcase";
import FeaturesStrip from "@/components/FeaturesStrip";
import { getHomeData } from "@/services/homeApi";

export const dynamic = "force-dynamic";

export default function Home() {
  const [homeData, setHomeData] = useState({
    hero: null,
    featured: { items: [], maxItems: 6 },
    promotions: { thematicBanners: [], deals: [] },
  });

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const data = await getHomeData();
        setHomeData(data);
      } catch (error) {
        console.error("Failed to fetch home data", error);
      }
    };

    loadHomeData();
  }, []);

  return (
    <>
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
