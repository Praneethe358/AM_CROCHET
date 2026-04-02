"use client";

import { useState } from "react";
import { User, Lock, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { updateProfileRequest } from "@/services/authApi";
import { toast } from "react-hot-toast";

export default function AdminSettingsPage() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (formData.password && formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }

    setLoading(true);
    try {
      const updateData = { name: formData.name };
      if (formData.password) {
        updateData.password = formData.password;
      }

      const updatedUser = await updateProfileRequest(updateData);
      
      // Update local auth context
      if (setUser) {
        setUser({ ...user, ...updatedUser });
      }

      toast.success("Settings updated successfully");
      setFormData({ ...formData, password: "", confirmPassword: "" });
    } catch (error) {
      console.error("Failed to update settings", error);
      toast.error(error.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-serif text-theme-text mb-2">Account Settings</h1>
        <p className="text-theme-faint text-sm">Update your administrative credentials and profile information.</p>
      </header>

      <div className="bg-theme-card rounded-3xl p-8 shadow-sm border border-theme-border">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-theme-text flex items-center gap-2">
              <User size={16} className="text-theme-faint" />
              Admin Display Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter new administrator name"
              className="w-full px-4 py-3 rounded-xl bg-theme-bg border border-theme-border focus:ring-2 focus:ring-theme-text/10 focus:border-theme-text outline-none transition-all"
            />
            <p className="text-[10px] text-theme-faint uppercase tracking-wider pl-1">This is the name displayed in the admin panel and store communications.</p>
          </div>

          <div className="h-px bg-theme-border my-8" />

          {/* Password Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-serif text-theme-text flex items-center gap-2">
              <Lock size={18} className="text-theme-faint" />
              Security Update
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-theme-text">New Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current"
                  className="w-full px-4 py-3 rounded-xl bg-theme-bg border border-theme-border focus:ring-2 focus:ring-theme-text/10 focus:border-theme-text outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-theme-text">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-3 rounded-xl bg-theme-bg border border-theme-border focus:ring-2 focus:ring-theme-text/10 focus:border-theme-text outline-none transition-all"
                />
              </div>
            </div>
            {formData.password && (
               <p className="text-[10px] text-theme-faint uppercase tracking-wider pl-1 font-medium text-amber-600">You are requesting a password change. Ensure this is stored securely.</p>
            )}
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-theme-text text-white rounded-xl font-medium hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
