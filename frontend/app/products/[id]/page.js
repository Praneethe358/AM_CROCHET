import ProductDetails from "@/components/ProductDetails";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BRAND_NAME, SITE_URL, buildProductPath, extractProductIdFromSlug } from "@/utils/seo";

export const dynamic = "force-dynamic";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const normalizeProduct = (item) => ({
  ...item,
  id: item._id,
  image: item.image || "",
  images: item.images || [],
});

const fetchProductBySlug = async (slugParam) => {
  const productId = extractProductIdFromSlug(slugParam);
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, { cache: "no-store" });
  if (!response.ok) return null;

  const payload = await response.json();
  const item = payload?.data;
  if (!item) return null;
  return normalizeProduct(item);
};

export async function generateMetadata({ params }) {
  const { id: slug } = await params;

  try {
    const product = await fetchProductBySlug(slug);

    if (!product) {
      return {
        title: "Product | AM Crochet Bags",
        description: "Explore premium handmade crochet bags from AM Crochet Bags.",
      };
    }

    const productDescription = (product.description || "Premium handmade crochet bag from AM Crochet Bags.")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);
    const canonicalPath = buildProductPath(product);

    return {
      title: `${product.name} | AM Crochet Bags`,
      description: productDescription,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        title: `${product.name} | AM Crochet Bags`,
        description: productDescription,
        url: `${SITE_URL}${canonicalPath}`,
        type: "product",
        images: product.image
          ? [
              {
                url: product.image,
                alt: `${product.name} by AM Crochet Bags`,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} | AM Crochet Bags`,
        description: productDescription,
        images: product.image ? [product.image] : [],
      },
    };
  } catch {
    return {
      title: "Product | AM Crochet Bags",
      description: "Explore premium handmade crochet bags from AM Crochet Bags.",
    };
  }
}

export default async function ProductPage({ params }) {
  const { id: slug } = await params;
  let product = null;
  let availableProducts = [];

  try {
    product = await fetchProductBySlug(slug);
    if (!product) {
      notFound();
    }
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
        image: item.image || item.images?.[0] || "",
      }));
  } catch {
    availableProducts = [];
  }

  const relatedProducts = availableProducts
    .sort((a, b) => {
      const aRelated = String(a.category || "").toLowerCase() === String(product.category || "").toLowerCase() ? 1 : 0;
      const bRelated = String(b.category || "").toLowerCase() === String(product.category || "").toLowerCase() ? 1 : 0;
      if (aRelated !== bRelated) return bRelated - aRelated;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    })
    .slice(0, 8);

  const productDescription = (product.description || "Premium handmade crochet bag from AM Crochet Bags.").replace(/\s+/g, " ").trim();
  const productUrl = `${SITE_URL}${buildProductPath(product)}`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: productDescription,
    image: Array.isArray(product.images) && product.images.length ? product.images : [product.image],
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: BRAND_NAME,
    },
    url: productUrl,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: Number(product.price || 0).toFixed(2),
      availability: Number(product.stock || 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: productUrl,
    },
  };

  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ProductDetails product={product} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

        {relatedProducts.length > 0 && (
          <section className="mt-8 md:mt-10">
            <h2 className="text-2xl font-serif font-bold text-theme-text mb-4">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  href={buildProductPath(item)}
                  className="group rounded-xl border border-theme-border bg-theme-bg overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="relative aspect-square bg-theme-secondary">
                    <Image
                      src={item.image}
                      alt={`${item.name} - AM Crochet Bags`}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-theme-text truncate">{item.name}</p>
                    <p className="text-xs text-theme-faint uppercase mt-1">{item.category}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-theme-text">₹{Number(item.price || 0).toFixed(2)}</p>
                      <p className={`text-[10px] font-semibold ${Number(item.stock || 0) > 0 ? "text-emerald-700" : "text-red-700"}`}>
                        {Number(item.stock || 0) > 0 ? "In stock" : "Out of stock"}
                      </p>
                    </div>
                    <p className="text-[11px] text-theme-faint mt-1">
                      {Number(item.reviewCount || 0) > 0
                        ? `${Number(item.averageRating || 0).toFixed(1)}★ (${Number(item.reviewCount || 0)})`
                        : "New product"}
                    </p>
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
