import Container from "@/components/Container";
import ProductGrid from "@/components/ProductGrid";
import SectionTitle from "@/components/SectionTitle";
import Link from "next/link";
import { buildCategoryPath } from "@/utils/seo";

export const metadata = {
  title: "Shop Products | AM Crochet Bags",
  description: "Explore handmade crochet bags from AM Crochet Bags, including premium handbags, backpacks, and accessories.",
  alternates: {
    canonical: "/products",
  },
};
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
  let products = [];

  try {
    const response = await fetch(`${API_BASE_URL}/products?limit=60&sort=newest`, { cache: "no-store" });
    const payload = await response.json();
    const items = payload?.data || [];

    products = items.map((item) => ({
      ...item,
      id: item._id,
      image: item.image || "",
    }));
  } catch (error) {
    console.error("Failed to load products", error);
  }

  return (
    <div className="pt-24 md:pt-32 pb-16 md:pb-20 min-h-screen bg-white">
      <Container>
        <h1 className="sr-only">AM Crochet Bags Product Collection</h1>
        <SectionTitle 
          title="Our Collection" 
          subtitle="Browse our entire collection of meticulously crafted bags." 
        />
        <div className="mt-5 flex flex-wrap gap-2.5">
          {["handbags", "backpacks", "accessories"].map((category) => (
            <Link
              key={category}
              href={buildCategoryPath(category)}
              className="rounded-full border border-theme-border px-3.5 py-1.5 text-xs md:text-sm text-theme-text hover:bg-theme-secondary transition-colors"
            >
              Shop {category.charAt(0).toUpperCase() + category.slice(1)}
            </Link>
          ))}
        </div>
        <div className="mt-5 md:mt-10">
          <ProductGrid products={products} />
        </div>
      </Container>
    </div>
  );
}
