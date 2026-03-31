export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://am-crochet.vercel.app";
export const BRAND_NAME = "AM Crochet Bags";

export const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const buildProductSlug = (name = "product", id = "") => {
  const base = slugify(name) || "product";
  const suffix = String(id || "").trim();
  return suffix ? `${base}-${suffix}` : base;
};

export const buildProductPath = (product) => {
  const productId = product?.id || product?._id;
  if (!productId) return "/products";
  return `/products/${buildProductSlug(product?.name || "product", productId)}`;
};

export const extractProductIdFromSlug = (slugParam = "") => {
  const slug = String(slugParam || "").trim();
  const match = slug.match(/[a-f0-9]{24}$/i);
  return match ? match[0] : slug;
};

export const buildCategoryPath = (category = "") => `/categories/${slugify(category)}`;

export const humanizeSlug = (slug = "") =>
  String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
