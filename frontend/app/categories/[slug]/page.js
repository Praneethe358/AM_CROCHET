import Container from "@/components/Container";
import ProductGrid from "@/components/ProductGrid";
import SectionTitle from "@/components/SectionTitle";
import Link from "next/link";
import { humanizeSlug, slugify } from "@/utils/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const categoryName = humanizeSlug(slug);

  return {
    title: `${categoryName} Crochet Bags India | Handmade Bags Online`,
    description: `Shop ${categoryName.toLowerCase()} at AM Crochet Bags. Discover crochet bags India shoppers love, handmade bags online, and custom crochet handbags crafted for daily style.`,
    alternates: {
      canonical: `/categories/${slug}`,
    },
  };
}

const getCategorySeoContent = (categoryName) => {
  const lowerCategory = categoryName.toLowerCase();

  return [
    `If you are searching for ${lowerCategory} in crochet bags India collections, this page is curated for exactly that intent. At AM Crochet Bags, each design is built around practical styling, durable yarn selection, and finish quality that supports everyday use. Customers looking for handmade bags online often want more than just appearance: they want shape retention, comfortable carry options, secure storage, and a design language that fits workdays, casual outings, and festive looks. Our ${lowerCategory} range combines handcrafted texture with contemporary silhouettes so you can confidently style one piece across multiple wardrobes. Whether you prefer minimalist neutrals or statement colorwork, this collection is structured to help you compare options quickly and choose a bag that truly matches your routine.`,
    `As a brand focused on handmade bags online shopping experiences, we prioritize transparency in product detailing. You will find clear images, product dimensions where available, and practical use-focused descriptions across this category page. If you are exploring custom crochet handbags, this section is also a strong starting point because it helps you identify patterns, stitch density, and form factors that can guide future custom preferences. Many customers in crochet bags India searches prioritize lightweight carrying comfort and long-term durability, so our product filtering and category organization are designed to reduce browsing friction. You can review styles by price, category relevance, and product freshness, then move directly into product detail pages for deeper information on stock, ratings, and checkout readiness.`,
    `To get the most value from this ${lowerCategory} collection, begin with the latest arrivals and then compare your top picks by structure and use case: office carry, weekend essentials, gifting, or travel basics. If you are new to handmade bags online shopping, start with versatile neutral pieces and gradually expand into seasonal accents. If you already buy custom crochet handbags regularly, use this collection as a benchmark for shape, finish, and price-value balance before placing your order. AM Crochet Bags is built around reliable craftsmanship and practical elegance, so every category page is meant to be both inspirational and conversion-friendly. Explore the products below, check our care tips in the blog, and discover why our crochet bags India audience continues to return for quality and style.`
  ];
};

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
  let products = [];

  try {
    const response = await fetch(`${API_BASE_URL}/products?limit=120&sort=newest`, { cache: "no-store" });
    const payload = await response.json();
    const items = payload?.data || [];

    products = items
      .map((item) => ({
        ...item,
        id: item._id,
        image: item.image || item.images?.[0] || "",
      }))
      .filter((item) => slugify(item.category || "") === slug);
  } catch {
    products = [];
  }

  const categoryName = humanizeSlug(slug);
  const seoParagraphs = getCategorySeoContent(categoryName);

  return (
    <div className="pt-24 md:pt-32 pb-16 md:pb-20 min-h-screen bg-white">
      <Container>
        <h1 className="sr-only">{categoryName} - AM Crochet Bags</h1>
        <SectionTitle
          title={`${categoryName} Collection`}
          subtitle={`Discover premium ${categoryName.toLowerCase()} at AM Crochet Bags.`}
        />
        <div className="mt-5 md:mt-10">
          <ProductGrid products={products} />
        </div>

        <section className="mt-10 md:mt-14 rounded-2xl border border-theme-border bg-theme-bg p-5 md:p-8">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-theme-text mb-4">
            {categoryName} Buying Guide
          </h2>
          <div className="space-y-4 text-sm md:text-base leading-relaxed text-theme-text/85">
            {seoParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-xs md:text-sm">
            <Link href="/products" className="rounded-full border border-theme-border px-4 py-2 text-theme-text hover:bg-theme-secondary transition-colors">
              Shop Handmade Bags Online
            </Link>
            <Link href="/blog/handmade-crochet-bags-care-tips" className="rounded-full border border-theme-border px-4 py-2 text-theme-text hover:bg-theme-secondary transition-colors">
              Read Care Tips
            </Link>
            <Link href="/blog/best-crochet-bags-for-daily-use" className="rounded-full border border-theme-border px-4 py-2 text-theme-text hover:bg-theme-secondary transition-colors">
              Daily Use Guide
            </Link>
          </div>
        </section>
      </Container>
    </div>
  );
}
