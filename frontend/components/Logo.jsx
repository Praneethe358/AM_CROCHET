import Image from "next/image";
import Link from "next/link";

const DEFAULT_LOGO_SRC = "/bag.png";

export default function Logo({
  href = "/",
  alt = "AM Crochet Bags logo",
  variant = "dark",
  className = "",
  imageClassName = "",
  textClassName = "",
  showText = false,
  text = "AM Crochet Bags",
  priority = false,
  ariaLabel,
}) {
  const defaultDarkLogo = process.env.NEXT_PUBLIC_BRAND_LOGO_DARK_URL || process.env.NEXT_PUBLIC_BRAND_LOGO_URL || DEFAULT_LOGO_SRC;
  const defaultLightLogo =
    process.env.NEXT_PUBLIC_BRAND_LOGO_LIGHT_URL || process.env.NEXT_PUBLIC_BRAND_LOGO_URL || defaultDarkLogo;

  const src = variant === "light" ? defaultLightLogo : defaultDarkLogo;
  const shouldInvertLight =
    variant === "light"
    && process.env.NEXT_PUBLIC_FORCE_INVERT_LIGHT_LOGO === "true"
    && !process.env.NEXT_PUBLIC_BRAND_LOGO_LIGHT_URL;

  return (
    <Link
      href={href}
      aria-label={ariaLabel || "Go to homepage"}
      className={`group inline-flex items-center ${className}`.trim()}
    >
      <Image
        src={src}
        alt={alt}
        width={180}
        height={56}
        priority={priority}
        sizes="(max-width: 640px) 112px, (max-width: 1024px) 144px, 176px"
        className={`h-8 md:h-10 lg:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02] ${
          variant === "light" ? "drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]" : ""
        } ${
          shouldInvertLight ? "brightness-0 invert" : ""
        } ${imageClassName}`.trim()}
      />
      {showText && (
        <span className={`ml-2 uppercase tracking-[0.24em] font-medium ${textClassName}`.trim()}>{text}</span>
      )}
    </Link>
  );
}