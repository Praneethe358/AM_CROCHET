import Container from "@/components/Container";
import ProductGrid from "@/components/ProductGrid";
import SectionTitle from "@/components/SectionTitle";
import { humanizeSlug, slugify } from "@/utils/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const categoryName = humanizeSlug(slug);

  return {
    title: `${categoryName} | AM Crochet Bags`,
    description: `Shop ${categoryName.toLowerCase()} from AM Crochet Bags. Discover premium handmade crochet bags and accessories.`,
    alternates: {
      canonical: `/categories/${slug}`,
    },
  };
}

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
      </Container>
    </div>
  );
}
