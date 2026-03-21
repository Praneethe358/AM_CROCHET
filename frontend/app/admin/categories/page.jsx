"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
  uploadAdminImage,
} from "@/services/adminApi";

const initialForm = {
  name: "",
  image: "",
  sortOrder: 0,
  isActive: true,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pageTitle = useMemo(() => (editingId ? "Edit Category" : "Create Category"), [editingId]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await getAdminCategories();
        setCategories(data || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const onFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId("");
  };

  const onEdit = (category) => {
    setEditingId(category._id);
    setForm({
      name: category.name || "",
      image: category.image || "",
      sortOrder: Number.isFinite(Number(category.sortOrder)) ? Number(category.sortOrder) : 0,
      isActive: category.isActive !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (categoryId) => {
    if (!confirm("Delete this category?")) return;

    try {
      await deleteAdminCategory(categoryId);
      setCategories((prev) => prev.filter((category) => category._id !== categoryId));
      toast.success("Category deleted");

      if (editingId === categoryId) {
        resetForm();
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to delete category");
    }
  };

  const onUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const imageUrl = await uploadAdminImage(file);
      if (!imageUrl) {
        toast.error("Upload failed. Please add URL manually.");
        return;
      }

      onFieldChange("image", imageUrl);
      toast.success("Category image uploaded");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    const payload = {
      name: form.name.trim(),
      image: form.image ? form.image.trim() : undefined,
      sortOrder: Number.isFinite(Number(form.sortOrder)) ? Number(form.sortOrder) : 0,
      isActive: form.isActive,
    };

    try {
      setSaving(true);

      if (editingId) {
        const updated = await updateAdminCategory(editingId, payload);
        setCategories((prev) => prev.map((category) => (category._id === editingId ? updated : category)));
        toast.success("Category updated");
      } else {
        const created = await createAdminCategory(payload);
        setCategories((prev) => [...prev, created].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
        toast.success("Category created");
      }

      resetForm();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-serif text-dark-text dark:text-cream">Categories</h1>

      <section className="bg-white dark:bg-dark-card rounded-2xl border border-black/5 dark:border-white/10 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-dark-text dark:text-cream mb-4">{pageTitle}</h2>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(event) => onFieldChange("name", event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort order</label>
            <input
              type="number"
              min="0"
              value={form.sortOrder}
              onChange={(event) => onFieldChange("sortOrder", event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Image/Icon URL</label>
            <input
              type="url"
              value={form.image}
              onChange={(event) => onFieldChange("image", event.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2"
              placeholder="https://..."
            />

            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 cursor-pointer text-sm w-fit">
              <Upload size={14} />
              {uploading ? "Uploading..." : "Upload image"}
              <input
                type="file"
                accept="image/*"
                onChange={onUploadImage}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => onFieldChange("isActive", event.target.checked)}
              />
              Active on homepage
            </label>
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-black text-white dark:bg-cream dark:text-dark-bg px-4 py-2 text-sm font-medium disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editingId ? "Update Category" : "Create Category"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center rounded-lg border border-gray-300 dark:border-white/10 px-4 py-2 text-sm"
              >
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="bg-white dark:bg-dark-card rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-black/5 dark:border-white/10">
          <h2 className="text-lg font-semibold text-dark-text dark:text-cream">All Categories</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-dark-text dark:text-cream" />
          </div>
        ) : !categories.length ? (
          <p className="p-6 text-sm text-gray-500">No categories created yet.</p>
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/10">
            {categories.map((category) => (
              <article key={category._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-dark-text dark:text-cream truncate">{category.name}</h3>
                  <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-3">
                    <span>Slug: {category.slug}</span>
                    <span>Order: {category.sortOrder || 0}</span>
                    <span>Status: {category.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(category)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-white/10 px-3 py-2 text-xs"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(category._id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-300 text-red-600 px-3 py-2 text-xs"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
