"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-theme-bg flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-theme-card/90 border border-theme-border rounded-2xl px-6 py-5 shadow-[0_12px_36px_rgba(200,169,126,0.15)] text-center"
      >
        <div className="w-8 h-8 border-2 border-theme-border border-t-theme-accent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-theme-faint">Restoring your secure session...</p>
      </motion.div>
    </div>
  );
}

export default function AppShell({ children }) {
  const { authLoading } = useAuth();
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const shouldBlockForAuth = authLoading && isAdminRoute;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history?.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.body.style.overflow = "";
  }, [pathname]);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2600,
          style: {
            background: "#FDF6EC",
            color: "#2C2C2C",
            border: "1px solid #EADFD0",
            boxShadow: "0 12px 30px rgba(200,169,126,0.18)",
            fontSize: "14px",
          },
          success: {
            iconTheme: {
              primary: "#C8A97E",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#d9534f",
              secondary: "#ffffff",
            },
          },
        }}
      />

      {shouldBlockForAuth ? (
        <FullScreenLoader />
      ) : (
        <>
          {!isAdminRoute && <Navbar />}
          <main className={isAdminRoute ? "flex-grow" : "flex-grow"}>{children}</main>
          {!isAdminRoute && <Footer />}
        </>
      )}
    </>
  );
}
