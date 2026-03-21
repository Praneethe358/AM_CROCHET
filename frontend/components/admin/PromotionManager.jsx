"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "react-hot-toast";
import { getAdminProducts } from "@/services/adminApi";
import {
  createAdminPromotion,
  deleteAdminPromotion,
  getAdminPromotions,
  updateAdminPromotion,
  uploadPromotionBanner,
} from "@/services/promotionApi";
import { getOptimizedImageUrl } from "@/utils/cloudinaryImage";

const initialForm = {
  title: "",
  description: "",
  banner: "",
  discount: "",
  startDate: "",
  endDate: "",
  status: "active",
  placement: "general",
  audience: "",
  products: [],
};

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const getPlacementLabel = (placement) => {
  if (placement === "home_thematic_banner") return "Home Banner Slider";
  if (placement === "special_combos") return "Home Special Combos";
  return "General Promotion";
};

export default function PromotionManager({
  pageTitle = "Promotions",
  fixedPlacement,
  description,
}) {
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    ...initialForm,
    placement: fixedPlacement || initialForm.placement,
  });
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isPlacementLocked = Boolean(fixedPlacement);
  const formTitle = useMemo(() => (editingId ? "Edit Promotion" : "Create Promotion"), [editingId]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [promoData, productData] = await Promise.all([getAdminPromotions(), getAdminProducts()]);
        const filteredPromotions = fixedPlacement
          ? (promoData || []).filter((promotion) => promotion.placement === fixedPlacement)
          : (promoData || []);

        setPromotions(filteredPromotions);
        setProducts(productData || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load promotions");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fixedPlacement]);

  const resetForm = () => {
    setForm({
      ...initialForm,
      placement: fixedPlacement || initialForm.placement,
    });
    setEditingId("");
  };

  const onFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSelectProducts = (event) => {
    const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
    onFieldChange("products", selected);
  };

  const onUploadBanner = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const imageUrl = await uploadPromotionBanner(file);
      if (!imageUrl) {
        toast.error("Upload failed. Please add URL manually.");
        return;
      }
      onFieldChange("banner", imageUrl);
      toast.success("Banner uploaded");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Banner upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const onEdit = (promotion) => {
    setEditingId(promotion._id);
    setForm({
      title: promotion.title || "",
      description: promotion.description || "",
      banner: promotion.banner || "",
      discount: promotion.discount ?? "",
      startDate: toDateInput(promotion.startDate),
      endDate: toDateInput(promotion.endDate),
      status: promotion.status || "active",
      placement: fixedPlacement || promotion.placement || "general",
      audience: promotion.audience || "",
      products: (promotion.products || []).map((product) => product._id || product),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (promotionId) => {
    if (!confirm("Delete this promotion?")) return;

    try {
      await deleteAdminPromotion(promotionId);
      setPromotions((prev) => prev.filter((promotion) => promotion._id !== promotionId));
      toast.success("Promotion deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete promotion");
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!form.title || !form.description || !form.banner || !form.startDate || !form.endDate) {
      toast.error("Please fill all required fields");
      return;
    }

    const placement = fixedPlacement || form.placement;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      banner: form.banner.trim(),
      discount: form.discount === "" ? undefined : Number(form.discount),
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      status: form.status,
      placement,
      audience: form.audience || undefined,
      products: form.products,
    };

    try {
      setSaving(true);

      if (editingId) {
        const updated = await updateAdminPromotion(editingId, payload);
        setPromotions((prev) => prev.map((promotion) => (promotion._id === editingId ? updated : promotion)));
        toast.success("Promotion updated");
      } else {
        const created = await createAdminPromotion(payload);
        if (!fixedPlacement || created.placement === fixedPlacement) {
          setPromotions((prev) => [created, ...prev]);
        }
        toast.success("Promotion created");
      }

      resetForm();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save promotion");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-serif text-dark-text dark:text-cream">{pageTitle}</h1>
      {description ? <p className="text-sm text-gray-500 -mt-2">{description}</p> : null}

      <section className="bg-white dark:bg-dark-card rounded-2xl border border-black/5 dark:border-white/10 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-dark-text dark:text-cream mb-4">{formTitle}</h2>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => onFieldChange("title", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2"
              required
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Banner URL *</label>
            <input
              type="url"
              value={form.banner}
              onChange={(e) => onFieldChange("banner", e.target.value)}
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
              {form.banner ? <span className="text-xs text-gray-500 truncate max-w-[220px]">{form.banner}</span> : null}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Discount %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.discount}
              onChange={(e) => onFieldChange("discount", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select
              value={form.status}
              onChange={(e) => onFieldChange("status", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {isPlacementLocked ? (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Placement</label>
              <div className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-black/20 px-4 py-2 text-sm">
                {getPlacementLabel(fixedPlacement)}
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Placement</label>
              <select
                value={form.placement}
                onChange={(e) => onFieldChange("placement", e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2"
              >
                <option value="general">General Promotion (not pinned to Home sections)</option>
                <option value="home_thematic_banner">Home Banner Slider (Women/Teens/College banner)</option>
                <option value="special_combos">Home Special Combos Section</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Audience</label>
            <select
              value={form.audience}
              onChange={(e) => onFieldChange("audience", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2"
            >
              <option value="">All Audiences</option>
              <option value="women">Women</option>
              <option value="teens">Teens</option>
              <option value="college">College</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start date *</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => onFieldChange("startDate", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End date *</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => onFieldChange("endDate", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Related products</label>
            <select
              multiple
              value={form.products}
              onChange={onSelectProducts}
              className="mt-1 h-36 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2"
            >
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple products.</p>
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-black text-white dark:bg-cream dark:text-dark-bg px-4 py-2 text-sm font-medium disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editingId ? "Update Promotion" : "Create Promotion"}
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
          <h2 className="text-lg font-semibold text-dark-text dark:text-cream">All Promotions</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-dark-text dark:text-cream" />
          </div>
        ) : !promotions.length ? (
          <p className="p-6 text-sm text-gray-500">No promotions created yet.</p>
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/10">
            {promotions.map((promotion) => (
              <article key={promotion._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative h-20 w-full sm:w-32 rounded-lg overflow-hidden border border-black/5 dark:border-white/10 shrink-0">
                  <Image
                    src={getOptimizedImageUrl(promotion.banner || "https://picsum.photos/800/500", { width: 400 })}
                    alt={promotion.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-dark-text dark:text-cream truncate">{promotion.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{promotion.description}</p>
                  <div className="text-xs text-gray-500 mt-2 flex flex-wrap gap-3">
                    <span>Status: {promotion.status}</span>
                    <span>Placement: {promotion.placement || "general"}</span>
                    {promotion.audience ? <span>Audience: {promotion.audience}</span> : null}
                    <span>Clicks: {promotion.clickCount || 0}</span>
                    {promotion.discount !== null && promotion.discount !== undefined ? (
                      <span>Discount: {promotion.discount}%</span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(promotion)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-white/10 px-3 py-2 text-xs"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(promotion._id)}
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
