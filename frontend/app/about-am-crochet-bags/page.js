import Link from "next/link";
import { buildCategoryPath } from "@/utils/seo";

export const metadata = {
  title: "About AM Crochet Bags – Handmade Crochet Bags India",
  description:
    "Learn about AM Crochet Bags, our handmade crochet bags process, and why crochet handbags India customers choose our premium quality and everyday style.",
  alternates: {
    canonical: "/about-am-crochet-bags",
  },
};

export default function AboutBrandPage() {
  return (
    <main className="bg-theme-bg pt-24 md:pt-32 pb-16 md:pb-20 min-h-screen">
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-5xl font-serif text-theme-text">AM Crochet Bags</h1>

        <div className="mt-6 space-y-5 text-sm md:text-base leading-relaxed text-theme-text/85">
          <p>
            AM Crochet Bags began with a simple idea: build elegant, practical styles that celebrate handcrafted design.
            Every AM Crochet Bags piece is made with attention to texture, comfort, and daily usability.
          </p>

          <p>
            Our studio focuses on handmade crochet bags crafted with durable materials, clean finishing, and balanced silhouettes.
            At AM Crochet Bags, each design goes through quality checks so your bag looks premium and lasts longer.
          </p>

          <p>
            AM Crochet Bags serves students, professionals, and gift buyers who want expressive fashion with real function.
            Our crochet handbags India collections are designed for work days, travel plans, and casual outings without compromising style.
          </p>

          <p>
            What makes AM Crochet Bags different is our blend of handcrafted detail, lightweight construction, and accessible pricing.
            If you are exploring handmade crochet bags or premium crochet handbags India shoppers trust, AM Crochet Bags is built for you.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full border border-theme-border px-4 py-2 text-sm text-theme-text hover:bg-theme-secondary transition-colors"
          >
            Visit Homepage
          </Link>
          <Link
            href="/products"
            className="rounded-full border border-theme-border px-4 py-2 text-sm text-theme-text hover:bg-theme-secondary transition-colors"
          >
            Shop Products
          </Link>
          <Link
            href={buildCategoryPath("handbags")}
            className="rounded-full border border-theme-border px-4 py-2 text-sm text-theme-text hover:bg-theme-secondary transition-colors"
          >
            Handbags Category
          </Link>
          <Link
            href={buildCategoryPath("accessories")}
            className="rounded-full border border-theme-border px-4 py-2 text-sm text-theme-text hover:bg-theme-secondary transition-colors"
          >
            Accessories Category
          </Link>
        </div>
      </section>
    </main>
  );
}