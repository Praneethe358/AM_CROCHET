import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import DisableScrollRestoration from "@/components/DisableScrollRestoration";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { BRAND_NAME, SITE_URL } from "@/utils/seo";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AM Crochet Bags – Official Store | Handmade Crochet Bags India",
    template: "%s | AM Crochet Bags",
  },
  description: "AM Crochet Bags offers premium handmade crochet bags. Stylish, durable, and affordable. Shop now.",
  keywords: [
    "AM Crochet Bags",
    "handmade crochet bags",
    "crochet handbags India",
    "crochet bags online",
    "women crochet handbags",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/bag.png",
    shortcut: "/bag.png",
    apple: "/bag.png",
  },
  openGraph: {
    title: "AM Crochet Bags – Official Store | Handmade Crochet Bags India",
    description: "AM Crochet Bags offers premium handmade crochet bags. Stylish, durable, and affordable. Shop now.",
    url: SITE_URL,
    siteName: BRAND_NAME,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/bag.png",
        width: 1200,
        height: 630,
        alt: "AM Crochet Bags brand image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AM Crochet Bags – Official Store | Handmade Crochet Bags India",
    description: "AM Crochet Bags offers premium handmade crochet bags. Stylish, durable, and affordable. Shop now.",
    images: ["/bag.png"],
    site: "@amcrochetbags",
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      || "a2TNDReSxPtZRtH4Pgk5FirSWZcnNaVI2PEhwlHiBOE",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BRAND_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/bag.png`,
  description: "AM Crochet Bags offers premium handmade crochet bags. Stylish, durable, and affordable.",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: BRAND_NAME,
  url: SITE_URL,
};

export default function RootLayout({ children }) {
  // Global Layout wrapper
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased font-sans text-theme-text bg-theme-bg min-h-screen flex flex-col selection:bg-theme-accent selection:text-white pb-safe">
        <DisableScrollRestoration />
        <AppErrorBoundary>
          <AuthProvider>
            <CartProvider>
              <AppShell>{children}</AppShell>
            </CartProvider>
          </AuthProvider>
        </AppErrorBoundary>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </body>
    </html>
  );
}
