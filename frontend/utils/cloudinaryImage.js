/**
 * Cloudinary image URL helper
 *
 * Takes a raw Cloudinary image URL and returns a transformed URL
 * for responsive, high-quality display without image breaking.
 *
 * Works by inserting on-the-fly transformations into Cloudinary's
 * delivery URL so the original stored image is never mutated.
 */

/**
 * Build an optimised display URL from a Cloudinary URL.
 *
 * @param {string} url       – Original Cloudinary URL
 * @param {object} [options] – Optional overrides
 * @param {number} [options.width]   – Target width (default: auto)
 * @param {number} [options.height]  – Target height (default: auto)
 * @param {string} [options.crop]    – Crop mode (default: 'limit')
 * @param {string} [options.quality] – Quality setting (default: 'auto:best')
 * @param {string} [options.format]  – Format (default: 'auto')
 * @returns {string} – Optimised Cloudinary URL
 */
export function getOptimizedImageUrl(url, options = {}) {
  if (!url || typeof url !== "string") return url || "";

  // Only transform Cloudinary URLs
  if (!url.includes("res.cloudinary.com")) return url;

  const {
    width,
    height,
    crop = "limit",
    quality = "auto:best",
    format = "auto",
  } = options;

  const parts = [];
  if (quality) parts.push(`q_${quality}`);
  if (format) parts.push(`f_${format}`);
  parts.push("dpr_auto");   // serve 2× for retina screens automatically
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  if ((width || height) && crop) parts.push(`c_${crop}`);

  const transformStr = parts.join(",");

  // Insert transform right after "/upload/"
  return url.replace("/image/upload/", `/image/upload/${transformStr}/`);
}

/**
 * Responsive sizes helper for Next.js <Image> `sizes` prop
 * Returns a sensible default sizes string.
 */
export function getResponsiveSizes(variant = "card") {
  switch (variant) {
    case "hero":
      return "100vw";
    case "detail":
      return "(max-width: 768px) 100vw, 50vw";
    case "thumbnail":
      return "(max-width: 640px) 25vw, 80px";
    case "card":
    default:
      return "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";
  }
}
