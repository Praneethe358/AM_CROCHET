import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import DisableScrollRestoration from "@/components/DisableScrollRestoration";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata = {
  title: "AM CROCHET | Luxury Handcrafted Bags",
  description: "Exquisite handcrafted crochet bags and accessories designed for enduring style and refined luxury.",
};

export default function RootLayout({ children }) {
  // Global Layout wrapper
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased font-sans text-theme-text bg-theme-bg min-h-screen flex flex-col selection:bg-theme-accent selection:text-white pb-safe">
        <DisableScrollRestoration />
        <AuthProvider>
          <CartProvider>
            <AppShell>{children}</AppShell>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
