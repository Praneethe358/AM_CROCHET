"use client";

import Hero from "@/components/Hero";
import ThematicBannerStrip from "@/components/ThematicBannerStrip";
import FeaturedProducts from "@/components/FeaturedProducts";
import PromotionsShowcase from "@/components/PromotionsShowcase";
import FeaturesStrip from "@/components/FeaturesStrip";

const initialHomeData = {
  hero: {
    slides: [
      {
        image: "/bag.png",
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
  );
}
