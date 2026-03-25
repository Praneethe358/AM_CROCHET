"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import ThematicBannerStrip from "@/components/ThematicBannerStrip";
import FeaturedProducts from "@/components/FeaturedProducts";
import PromotionsShowcase from "@/components/PromotionsShowcase";
import FeaturesStrip from "@/components/FeaturesStrip";
import { getHomeData } from "@/services/homeApi";
import { products as fallbackProducts } from "@/data/products";

export const dynamic = "force-dynamic";

const fallbackHomeData = {
  hero: {
    slides: [
      {
        image: "/bags/bag1.jpg",
        subtitle: "Handcrafted Luxury",
        title: "AM CROCHET",
        description: "Premium handcrafted crochet bags designed for timeless everyday elegance.",
        link: "/products",
      },
    ],
  },
  featured: {
    items: fallbackProducts.map((item) => ({
      _id: `fallback-${item.id}`,
      name: item.name,
      price: item.price,
      image: item.image,
      images: [item.image],
    })),
    maxItems: 6,
  },
  promotions: { thematicBanners: [], deals: [] },
};

export default function Home() {
  const [homeData, setHomeData] = useState(fallbackHomeData);

  useEffect(() => {
    let isMounted = true;

    const loadHomeData = async () => {
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
    };

    loadHomeData();

    return () => {
      isMounted = false;
    };
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
