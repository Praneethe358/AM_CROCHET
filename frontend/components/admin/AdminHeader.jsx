"use client";

import { Menu, User, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminHeader({ toggleSidebar }) {
  const { user } = useAuth();
  
  return (
    <header className="h-16 bg-theme-bg border-b border-theme-border flex items-center justify-between px-4 md:px-6 transition-colors duration-300">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 -ml-2 mr-2 text-theme-text hover:bg-theme-secondary rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-theme-faint hover:text-theme-text transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-theme-bg"></span>
        </button>
        
        <div className="flex items-center space-x-2 pl-4 border-l border-theme-border">
          <div className="w-8 h-8 rounded-full bg-theme-secondary flex items-center justify-center text-theme-text">
            <User size={16} />
          </div>
          <span className="text-sm font-medium text-theme-text hidden sm:block">
            {user?.name || "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}
