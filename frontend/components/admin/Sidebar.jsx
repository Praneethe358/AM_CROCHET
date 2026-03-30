"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingBag, LogOut, ImageIcon, Star, FolderTree, Layers, Gift } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Hero", href: "/admin/hero", icon: <ImageIcon size={20} /> },
    { name: "Home Banners", href: "/admin/home-banners", icon: <Layers size={20} /> },
    { name: "Special Combos", href: "/admin/special-combos", icon: <Gift size={20} /> },
    { name: "Featured", href: "/admin/featured", icon: <Star size={20} /> },
    { name: "Products", href: "/admin/products", icon: <Package size={20} /> },
    { name: "Orders", href: "/admin/orders", icon: <ShoppingBag size={20} /> },
  ];

  return (
    <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-theme-bg border-r border-theme-border flex flex-col z-40 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
      <div className="h-16 flex items-center justify-center border-b border-theme-border px-6 relative">
        <Link href="/admin" className="text-xl font-serif font-bold tracking-wider text-theme-text hover:opacity-80 transition-opacity">
          AM Crochet Bags <span className="text-sm font-sans font-light">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-theme-text text-white"
                  : "text-theme-faint hover:bg-theme-secondary hover:text-theme-text"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-theme-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
