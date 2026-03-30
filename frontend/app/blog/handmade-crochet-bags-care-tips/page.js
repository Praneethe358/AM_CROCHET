import Link from "next/link";
import Container from "@/components/Container";
import { buildProductPath } from "@/utils/seo";

export const metadata = {
  title: "Handmade Crochet Bags Care Tips | AM Crochet Bags",
  description:
    "Follow these handmade crochet bags care tips to preserve shape, color, and durability. A practical guide for crochet bags India buyers and handmade bags online customers.",
  alternates: {
    canonical: "/blog/handmade-crochet-bags-care-tips",
  },
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

async function getRecommendedProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products?limit=4&sort=newest`, { cache: "no-store" });
    const payload = await response.json();
    return (payload?.data || []).map((item) => ({
      ...item,
      id: item._id,
    }));
  } catch {
    return [];
  }
}

export default async function CareTipsBlogPage() {
  const recommendedProducts = await getRecommendedProducts();

  return (
    <main className="pt-24 md:pt-32 pb-16 md:pb-20 min-h-screen bg-white">
      <Container>
        <article className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-[0.18em] font-semibold text-theme-faint">Crochet Care Guide</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-serif font-bold text-theme-text">Handmade Crochet Bags Care Tips</h1>
          <p className="mt-4 text-sm md:text-base leading-relaxed text-theme-text/85">
            Handmade crochet bags can look premium for years when cared for correctly. This guide is built for shoppers who buy crochet bags India collections online and want practical, easy maintenance. If you regularly purchase handmade bags online or invest in custom crochet handbags, these steps will help preserve your bag structure, yarn texture, and color quality.
          </p>

          <div className="mt-8 space-y-5 text-sm md:text-base leading-relaxed text-theme-text/85">
            <p>
              Start with regular dust removal. Use a soft dry brush or a clean microfiber cloth once a week, especially around handles and seams. Avoid aggressive rubbing because friction can loosen fibers over time. For crochet bags India weather conditions, humidity can also affect yarn freshness. Store your bag in a breathable cotton dust bag and avoid closed plastic covers that trap moisture.
            </p>
            <p>
              For stain control, use spot cleaning first. Mix a small amount of mild liquid detergent with cold water, test on a hidden area, and dab gently with a white cloth. Never soak your handmade crochet bags fully unless the care label clearly allows it. Excess water can stretch shape and weaken reinforcement areas. If your bag has embellishments or mixed materials, keep cleaning limited to affected zones.
            </p>
            <p>
              Shape retention is the biggest differentiator between average and premium upkeep. Do not hang heavy custom crochet handbags for long periods, as that may distort strap angles. Instead, store bags lying flat or stuffed with soft tissue paper to maintain volume. Keep direct heat away from your collection. Hair dryers, sunlight on window ledges, and steam irons can cause fading and uneven fiber tension.
            </p>
            <p>
              Rotation is another underrated habit. If you use one bag every day, it experiences faster strain. Rotating between two or three pieces improves longevity across your handmade bags online purchases. Before storage, empty every compartment and check for cosmetic products or pens that may leak. Monthly maintenance takes less than ten minutes and saves significant restoration effort later.
            </p>
            <p>
              Finally, buy quality-first pieces from trusted sources and maintain a simple routine. Good craftsmanship plus proper care delivers long-term value. If you are browsing crochet bags India collections right now, prioritize strong finishing, reinforced handles, and clear product details. That combination makes everyday care easier and keeps your custom crochet handbags looking elegant season after season.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="rounded-full border border-theme-border px-4 py-2 text-sm text-theme-text hover:bg-theme-secondary transition-colors">
              Shop Handmade Bags Online
            </Link>
            <Link href="/categories/handbags" className="rounded-full border border-theme-border px-4 py-2 text-sm text-theme-text hover:bg-theme-secondary transition-colors">
              Explore Handbags Category
            </Link>
            <Link href="/blog/best-crochet-bags-for-daily-use" className="rounded-full border border-theme-border px-4 py-2 text-sm text-theme-text hover:bg-theme-secondary transition-colors">
              Read Daily Use Guide
            </Link>
          </div>
        </article>

        {recommendedProducts.length > 0 && (
          <section className="mx-auto max-w-5xl mt-12">
            <h2 className="text-2xl font-serif font-bold text-theme-text mb-4">Recommended Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {recommendedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={buildProductPath(product)}
                  className="rounded-xl border border-theme-border bg-theme-bg p-3 text-sm text-theme-text hover:shadow-sm transition-shadow"
                >
                  <p className="font-semibold line-clamp-1">{product.name}</p>
                  <p className="mt-1 text-xs text-theme-faint uppercase">{product.category}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </Container>
    </main>
  );
}
