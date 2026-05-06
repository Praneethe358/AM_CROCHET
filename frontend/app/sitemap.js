import { SITE_URL, buildProductPath, slugify } from "@/utils/seo";

export default async function sitemap() {
  const staticPages = [
    "",
    "/products",
    "/about-am-crochet-bags",
    "/blog",
    "/blog/handmade-crochet-bags-care-tips",
    "/blog/best-crochet-bags-for-daily-use",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  try {
    const response = await fetch(`${API_BASE_URL}/products?limit=500&sort=newest`, { cache: "no-store" });
    const payload = await response.json();
    const products = payload?.data || [];

    const productEntries = products
      .filter((item) => item?._id)
      .map((item) => ({
        url: `${SITE_URL}${buildProductPath({ id: item._id, name: item.name })}`,
        lastModified: new Date(item.updatedAt || item.createdAt || Date.now()),
        changeFrequency: "weekly",
        priority: 0.9,
      }));

    const categories = Array.from(new Set(products.map((item) => slugify(item.category || "")).filter(Boolean)));

    const categoryEntries = categories.map((categorySlug) => ({
      url: `${SITE_URL}/categories/${categorySlug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.75,
    }));

    return [...staticPages, ...productEntries, ...categoryEntries];
  } catch {
    return staticPages;
  }
}
