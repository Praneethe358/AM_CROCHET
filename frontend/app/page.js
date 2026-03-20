import Hero from "@/components/Hero";
import ThematicBannerStrip from "@/components/ThematicBannerStrip";
import FeaturedProducts from "@/components/FeaturedProducts";
import PromotionsShowcase from "@/components/PromotionsShowcase";
import FeaturesStrip from "@/components/FeaturesStrip";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Hero />
      <ThematicBannerStrip />
      <PromotionsShowcase />
      <FeaturedProducts />
      <FeaturesStrip />
    </>
  );
}
