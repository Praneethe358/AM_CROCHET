import Container from "@/components/Container";
import ProductGrid from "@/components/ProductGrid";
import SectionTitle from "@/components/SectionTitle";
import Link from "next/link";
import { buildCategoryPath } from "@/utils/seo";
import { serverFetchWithRetry } from "@/lib/fetchWithRetry";

export const metadata = {
  title: "Shop Products | AM Crochet Bags",
  description:
    "Explore handmade crochet bags from AM Crochet Bags, including premium handbags, backpacks, and accessories.",
  alternates: {
    canonical: "/products",
  },
};
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
  let products = [];

  try {
    const payload = await serverFetchWithRetry(
      `${API_BASE_URL}/products?limit=60&sort=newest`,
      {
        retries: 3,
        retryDelay: 2000,
        timeout: 12000,
        cache: "no-store",
      }
    );
    const items = payload?.data || [];

    products = items.map((item) => ({
      ...item,
      id: item._id,
      image: item.image || "",
    }));
  } catch (error) {
    console.error("Failed to load products after retries", error);
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
          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <div className="rounded-2xl border border-theme-border bg-theme-secondary/50 px-6 py-16 text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-theme-border/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-theme-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-theme-text">
                Products are loading — our server is warming up.
              </p>
              <p className="mt-1 text-xs text-theme-faint">
                Please refresh the page in a few seconds.
              </p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
