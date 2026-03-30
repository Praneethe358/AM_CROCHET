import Link from "next/link";
import Container from "@/components/Container";

export const metadata = {
  title: "Crochet Bags Blog | AM Crochet Bags India",
  description:
    "Read practical guides from AM Crochet Bags on crochet bags India shoppers care about, including handmade bags online buying tips and custom crochet handbags styling.",
  alternates: {
    canonical: "/blog",
  },
};

const posts = [
  {
    title: "Handmade Crochet Bags Care Tips",
    slug: "handmade-crochet-bags-care-tips",
    excerpt:
      "Learn simple and effective care routines to preserve shape, color, and texture in your handmade crochet bags.",
  },
  {
    title: "Best Crochet Bags for Daily Use",
    slug: "best-crochet-bags-for-daily-use",
    excerpt:
      "A practical buying guide to choose crochet bags India customers can use every day for work, travel, and casual outings.",
  },
];

export default function BlogPage() {
  return (
    <main className="pt-24 md:pt-32 pb-16 md:pb-20 min-h-screen bg-white">
      <Container>
        <header className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-theme-text">AM Crochet Bags Blog</h1>
          <p className="mt-3 text-sm md:text-base text-theme-faint leading-relaxed">
            Explore expert guides on crochet bags India trends, handmade bags online shopping, and custom crochet handbags care and styling.
          </p>
        </header>

        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          {posts.map((post) => (
            <article key={post.slug} className="rounded-2xl border border-theme-border bg-theme-bg p-5 md:p-6">
              <h2 className="text-xl font-serif font-bold text-theme-text">{post.title}</h2>
              <p className="mt-2 text-sm md:text-base text-theme-text/80 leading-relaxed">{post.excerpt}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-4 inline-flex rounded-full border border-theme-border px-4 py-2 text-sm text-theme-text hover:bg-theme-secondary transition-colors"
              >
                Read Article
              </Link>
            </article>
          ))}
        </section>
      </Container>
    </main>
  );
}
