"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Upload, X, ImagePlus, GripVertical } from "lucide-react";
import { toast } from "react-hot-toast";
import { uploadAdminImage } from "@/services/adminApi";
import { getOptimizedImageUrl } from "@/utils/cloudinaryImage";

export default function ProductForm({ initialData = {}, onSubmit, isLoading }) {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const initialImages =
    Array.isArray(initialData.images) && initialData.images.length > 0
      ? initialData.images.map((url) => ({ type: "url", value: url, preview: url }))
      : initialData.image
        ? [{ type: "url", value: initialData.image, preview: initialData.image }]
        : [];

  const [formData, setFormData] = useState({
    name: initialData.name || "",
    description: initialData.description || "",
    price: initialData.price || "",
    category: initialData.category || "handbags",
    stock: initialData.countInStock || initialData.stock || 0,
    isFeatured: Boolean(initialData.isFeatured),
    featuredOrder: initialData.featuredOrder || 1,
  });

  // Each entry: { type: 'file' | 'url', value: File | string, preview: string, uploading?: boolean }
  const [images, setImages] = useState(initialImages);
  const [dragOver, setDragOver] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // ── File Selection ─────────────────────────────────────────────
  const processFiles = useCallback(async (fileList) => {
    const files = Array.from(fileList).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );

    if (files.length === 0) {
      toast.error("Only JPG, PNG, and WebP images are allowed.");
      return;
    }

    const totalAfter = images.length + files.length;
    if (totalAfter > 10) {
      toast.error("Maximum 10 images per product.");
      return;
    }

    // Add files with local preview immediately
    const newEntries = files.map((file) => ({
      type: "file",
      value: file,
      preview: URL.createObjectURL(file),
      uploading: true,
    }));

    setImages((prev) => [...prev, ...newEntries]);
    setUploadingCount((c) => c + files.length);

    // Upload each file to Cloudinary
    for (let i = 0; i < files.length; i++) {
      try {
        const cloudinaryUrl = await uploadAdminImage(files[i]);

        setImages((prev) =>
          prev.map((img) =>
            img.value === files[i]
              ? { type: "url", value: cloudinaryUrl, preview: cloudinaryUrl, uploading: false }
              : img
          )
        );
      } catch (err) {
        toast.error(`Failed to upload ${files[i].name}`);
        // Remove the failed entry
        setImages((prev) => prev.filter((img) => img.value !== files[i]));
      } finally {
        setUploadingCount((c) => Math.max(0, c - 1));
      }
    }
  }, [images.length]);

  const handleFileSelect = (e) => {
    if (e.target.files) processFiles(e.target.files);
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const removeImage = (index) => {
    setImages((prev) => {
      const removed = prev[index];
      // Revoke object URL if it's a local preview
      if (removed?.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // ── Manual URL entry ───────────────────────────────────────────
  const [manualUrl, setManualUrl] = useState("");

  const addManualUrl = () => {
    const url = manualUrl.trim();
    if (!url) return;
    if (images.length >= 10) {
      toast.error("Maximum 10 images per product.");
      return;
    }
    setImages((prev) => [...prev, { type: "url", value: url, preview: url }]);
    setManualUrl("");
  };

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (uploadingCount > 0) {
      return toast.error("Please wait for all images to finish uploading.");
    }

    const cleanedImages = images
      .filter((img) => img.type === "url" && img.value)
      .map((img) => img.value);

    if (!formData.name || !formData.price || cleanedImages.length === 0) {
      return toast.error("Please fill in all required fields and add at least one image.");
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      category: formData.category,
      stock: Number(formData.stock),
      image: cleanedImages[0],
      images: cleanedImages,
      isFeatured: formData.isFeatured,
      featuredOrder: formData.isFeatured ? Number(formData.featuredOrder || 1) : null,
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-black/5 dark:border-white/10">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-transparent text-dark-text dark:text-cream focus:ring-2 focus:ring-black dark:focus:ring-cream outline-none transition-all"
            placeholder="Crochet Tote Bag"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-transparent text-dark-text dark:text-cream focus:ring-2 focus:ring-black dark:focus:ring-cream outline-none transition-all"
              placeholder="49.99"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Stock
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-transparent text-dark-text dark:text-cream focus:ring-2 focus:ring-black dark:focus:ring-cream outline-none transition-all"
              placeholder="10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-transparent text-dark-text dark:text-cream focus:ring-2 focus:ring-black dark:focus:ring-cream outline-none transition-all"
          >
            <option value="handbags">Handbags</option>
            <option value="backpacks">Backpacks</option>
            <option value="accessories">Accessories</option>
            <option value="clothing">Clothing</option>
          </select>
        </div>

        {/* ────────── Image Upload Area ────────── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Product Images * <span className="text-xs text-gray-400">({images.length}/10)</span>
            </label>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
              dragOver
                ? "border-black dark:border-cream bg-black/5 dark:bg-white/5 scale-[1.01]"
                : "border-gray-300 dark:border-white/15 hover:border-gray-400 dark:hover:border-white/25 hover:bg-gray-50 dark:hover:bg-white/[0.02]"
            }`}
          >
            <div className={`p-3 rounded-full transition-colors ${dragOver ? "bg-black/10 dark:bg-white/10" : "bg-gray-100 dark:bg-white/5"}`}>
              <Upload className={`w-6 h-6 transition-colors ${dragOver ? "text-black dark:text-cream" : "text-gray-400"}`} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {dragOver ? "Drop images here" : "Click or drag images here"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG, WebP • Max 10MB each • Up to 10 images
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Manual URL Input */}
          <div className="flex items-center gap-2 mt-3">
            <input
              type="url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-transparent text-dark-text dark:text-cream focus:ring-2 focus:ring-black dark:focus:ring-cream outline-none transition-all text-sm"
              placeholder="Or paste an image URL..."
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addManualUrl(); } }}
            />
            <button
              type="button"
              onClick={addManualUrl}
              className="px-3 py-2 rounded-lg bg-black text-white dark:bg-cream dark:text-dark-bg text-xs font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <ImagePlus className="w-4 h-4" />
            </button>
          </div>

          {/* Image Previews Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
              {images.map((img, index) => (
                <div
                  key={`img-${index}-${img.preview?.slice(-20) || index}`}
                  className={`relative group rounded-xl overflow-hidden border transition-all duration-300 aspect-square ${
                    index === 0
                      ? "border-black dark:border-cream ring-2 ring-black/20 dark:ring-cream/20"
                      : "border-gray-200 dark:border-white/10"
                  } ${img.uploading ? "animate-pulse" : ""}`}
                >
                  {img.preview ? (
                    <Image
                      src={
                        img.preview.startsWith("blob:")
                          ? img.preview
                          : getOptimizedImageUrl(img.preview, { width: 300 })
                      }
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 150px"
                      unoptimized={img.preview.startsWith("blob:")}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                      <ImagePlus className="w-6 h-6 text-gray-300" />
                    </div>
                  )}

                  {/* Primary badge */}
                  {index === 0 && !img.uploading && (
                    <div className="absolute top-1.5 left-1.5 bg-black/80 dark:bg-cream/90 text-white dark:text-dark-bg text-[10px] font-bold px-2 py-0.5 rounded-md z-10">
                      PRIMARY
                    </div>
                  )}

                  {/* Upload spinner overlay */}
                  {img.uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}

                  {/* Remove button */}
                  {!img.uploading && (
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1.5 right-1.5 bg-red-500/90 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-transparent text-dark-text dark:text-cream focus:ring-2 focus:ring-black dark:focus:ring-cream outline-none transition-all resize-none"
            placeholder="Detailed product description..."
          ></textarea>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 dark:border-white/10"
            />
            Mark as Featured Product
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Featured Order
            </label>
            <input
              type="number"
              name="featuredOrder"
              value={formData.featuredOrder}
              onChange={handleChange}
              min="1"
              disabled={!formData.isFeatured}
              className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-transparent text-dark-text dark:text-cream focus:ring-2 focus:ring-black dark:focus:ring-cream outline-none transition-all disabled:opacity-60"
              placeholder="1"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4 pt-4 border-t border-black/5 dark:border-white/10">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 rounded-lg border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || uploadingCount > 0}
          className="flex flex-1 items-center justify-center space-x-2 bg-black text-white dark:bg-cream dark:text-dark-bg px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : uploadingCount > 0 ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Uploading {uploadingCount}...</span></> : <span>Save Product</span>}
        </button>
      </div>
    </form>
  );
}
