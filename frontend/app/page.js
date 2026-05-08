import HomePageClient from "@/components/HomePageClient";
import { SITE_URL } from "@/utils/seo";
import { getHomeDataServer } from "@/services/homeApi.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "AM Crochet Bags – Official Store | Handmade Crochet Bags India",
  description:
    "AM Crochet Bags offers premium handmade crochet bags, crochet handbags India shoppers love, and durable everyday styles at affordable prices.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AM Crochet Bags – Official Store | Handmade Crochet Bags India",
    description:
      "Shop AM Crochet Bags for handmade crochet bags and crochet handbags India customers trust for style, durability, and value.",
    url: SITE_URL,
    type: "website",
  },
};

export default async function Home() {
  const initialHomeData = await getHomeDataServer();

  return (
    <>
      <section className="sr-only" aria-label="Homepage SEO heading">
        <h1>AM Crochet Bags</h1>
        <p>
          AM Crochet Bags creates handmade crochet bags and crochet handbags India customers trust for premium design, durability,
          and value.
        </p>
      </section>

      <HomePageClient initialHomeData={initialHomeData} />
    </>
  );
}
