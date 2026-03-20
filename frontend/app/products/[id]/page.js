import ProductDetails from "@/components/ProductDetails";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }) {
  const { id } = await params;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
  let product = null;
  let availableProducts = [];

  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, { cache: "no-store" });
    if (!response.ok) {
      notFound();
    }

    const payload = await response.json();
    const item = payload?.data;

    if (!item) {
      notFound();
    }

    product = {
      ...item,
      id: item._id,
      image: item.image || "https://picsum.photos/200/300",
      images: item.images || [],
    };
  } catch {
    notFound();
  }

  if (!product) {
    notFound();
  }

  try {
    const availableResponse = await fetch(`${API_BASE_URL}/products?limit=8&sort=newest`, { cache: "no-store" });
    const availablePayload = await availableResponse.json();
    const items = availablePayload?.data || [];

    availableProducts = items
      .filter((item) => item._id !== product.id)
      .map((item) => ({
        ...item,
        id: item._id,
        image: item.image || item.images?.[0] || "https://picsum.photos/200/300",
      }));
  } catch {
    availableProducts = [];
  }

  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ProductDetails product={product} />

        {availableProducts.length > 0 && (
          <section className="mt-8 md:mt-10">
            <h2 className="text-2xl font-serif font-bold text-theme-text mb-4">Available Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableProducts.slice(0, 8).map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.id}`}
                  className="group rounded-xl border border-theme-border bg-theme-bg overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="relative aspect-square bg-theme-secondary">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-theme-text truncate">{item.name}</p>
                    <p className="text-xs text-theme-faint uppercase mt-1">{item.category}</p>
                    <p className="text-sm font-bold text-theme-text mt-2">${Number(item.price || 0).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
