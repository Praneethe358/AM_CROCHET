"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Upload } from "lucide-react";
import { toast } from "react-hot-toast";
import { getAdminHero, updateAdminHero, uploadAdminImage } from "@/services/adminApi";

const initialState = {
  title: "",
  subtitle: "",
  buttonText: "Explore Collection",
  buttonLink: "/products",
  bannerImage: "",
  isActive: true,
};

export default function AdminHeroPage() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadHero = async () => {
      try {
        setLoading(true);
        const hero = await getAdminHero();
        if (hero) {
          setForm({
            title: hero.title || "",
            subtitle: hero.subtitle || "",
            buttonText: hero.buttonText || "Explore Collection",
            buttonLink: hero.buttonLink || "/products",
            bannerImage: hero.bannerImage || "",
            isActive: hero.isActive !== false,
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load hero data");
      } finally {
        setLoading(false);
      }
    };

    loadHero();
  }, []);

  const onFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onUploadBanner = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const imageUrl = await uploadAdminImage(file);
      if (!imageUrl) {
        toast.error("Upload failed. Please add URL manually.");
        return;
      }

      onFieldChange("bannerImage", imageUrl);
      toast.success("Banner uploaded");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Banner upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const onSave = async (event) => {
    event.preventDefault();

    if (!form.title || !form.subtitle || !form.buttonText || !form.bannerImage) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      buttonText: form.buttonText.trim(),
      buttonLink: (form.buttonLink || "/products").trim(),
      bannerImage: form.bannerImage.trim(),
      isActive: form.isActive,
    };

    try {
      setSaving(true);
      const updated = await updateAdminHero(payload);
      setForm({
        title: updated.title || "",
        subtitle: updated.subtitle || "",
        buttonText: updated.buttonText || "Explore Collection",
        buttonLink: updated.buttonLink || "/products",
        bannerImage: updated.bannerImage || "",
        isActive: updated.isActive !== false,
      });
      toast.success("Hero section updated");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save hero section");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-dark-text dark:text-cream" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-serif text-dark-text dark:text-cream">Hero Section</h1>

      <section className="bg-white dark:bg-dark-card rounded-2xl border border-black/5 dark:border-white/10 p-5 sm:p-6">
        <form onSubmit={onSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(event) => onFieldChange("title", event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subtitle *</label>
            <textarea
              value={form.subtitle}
              onChange={(event) => onFieldChange("subtitle", event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Button text *</label>
            <input
              type="text"
              value={form.buttonText}
              onChange={(event) => onFieldChange("buttonText", event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Button link</label>
            <input
              type="text"
              value={form.buttonLink}
              onChange={(event) => onFieldChange("buttonLink", event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2"
              placeholder="/products"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Banner image URL *</label>
            <input
              type="url"
              value={form.bannerImage}
              onChange={(event) => onFieldChange("bannerImage", event.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2"
              placeholder="https://..."
              required
            />

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 cursor-pointer text-sm">
                <Upload size={14} />
                {uploading ? "Uploading..." : "Upload banner"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={onUploadBanner}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => onFieldChange("isActive", event.target.checked)}
              />
              Set hero section as active
            </label>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-black text-white dark:bg-cream dark:text-dark-bg px-4 py-2 text-sm font-medium disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save Hero Section
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white dark:bg-dark-card rounded-2xl border border-black/5 dark:border-white/10 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-dark-text dark:text-cream mb-4">Preview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <h3 className="text-2xl font-serif text-theme-text">{form.title || "Hero title"}</h3>
            <p className="mt-2 text-sm text-theme-muted">{form.subtitle || "Hero subtitle"}</p>
            <button
              type="button"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-theme-text px-4 py-2 text-sm font-semibold text-white"
            >
              {form.buttonText || "Explore Collection"}
            </button>
          </div>
          <div className="relative h-44 rounded-xl overflow-hidden border border-theme-border">
            {form.bannerImage ? (
              <Image src={form.bannerImage} alt="Hero preview" fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-theme-muted bg-theme-bg">
                Banner preview
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
