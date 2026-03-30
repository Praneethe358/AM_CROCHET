"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }) {
  const { user, authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      const nextPath = pathname || "/admin";
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    if (user.role !== "admin") {
      router.replace("/");
    }
  }, [user, authLoading, router, pathname]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSidebarOpen(false); // Close sidebar on route change
  }, [pathname]);

  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-bg">
        <Loader2 className="w-10 h-10 animate-spin text-theme-text" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-theme-bg transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 min-w-0 text-theme-text">
        <AdminHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
