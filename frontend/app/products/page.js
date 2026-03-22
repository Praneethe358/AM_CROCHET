import Container from "@/components/Container";
import ProductGrid from "@/components/ProductGrid";
import SectionTitle from "@/components/SectionTitle";

export const metadata = {
  title: "Products | BagStore",
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
        <SectionTitle 
          title="Our Collection" 
          subtitle="Browse our entire collection of meticulously crafted bags." 
        />
        <div className="mt-5 md:mt-10">
          <ProductGrid products={products} />
        </div>
      </Container>
    </div>
  );
}
