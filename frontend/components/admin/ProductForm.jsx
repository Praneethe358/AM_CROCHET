"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ProductForm({ initialData = {}, onSubmit, isLoading }) {
  const router = useRouter();

  const initialImages =
    Array.isArray(initialData.images) && initialData.images.length > 0
      ? initialData.images
      : initialData.image
        ? [initialData.image]
        : [""];

  const [formData, setFormData] = useState({
    name: initialData.name || "",
    description: initialData.description || "",
    price: initialData.price || "",
    category: initialData.category || "handbags",
    images: initialImages,
    stock: initialData.countInStock || initialData.stock || 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index, value) => {
    setFormData((prev) => {
      const nextImages = [...prev.images];
      nextImages[index] = value;
      return { ...prev, images: nextImages };
    });
  };

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const removeImageField = (index) => {
    setFormData((prev) => {
      const nextImages = prev.images.filter((_, idx) => idx !== index);
      return { ...prev, images: nextImages.length > 0 ? nextImages : [""] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedImages = formData.images
      .map((img) => img.trim())
      .filter(Boolean);

    if (!formData.name || !formData.price || cleanedImages.length === 0) {
      return toast.error("Please fill in all required fields.");
    }
    
    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      category: formData.category,
      stock: Number(formData.stock),
      image: cleanedImages[0],
      images: cleanedImages,
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

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Product Images *
            </label>
            <button
              type="button"
              onClick={addImageField}
              className="text-xs px-2.5 py-1 rounded-md bg-black text-white dark:bg-cream dark:text-dark-bg"
            >
              + Add Image
            </button>
          </div>
          <div className="space-y-2">
            {formData.images.map((imageUrl, index) => (
              <div key={`${index}-${imageUrl}`} className="flex items-center gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  required={index === 0}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-transparent text-dark-text dark:text-cream focus:ring-2 focus:ring-black dark:focus:ring-cream outline-none transition-all"
                  placeholder={`https://example.com/image-${index + 1}.jpg`}
                />
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="px-2.5 py-2 rounded-md border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-300"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
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
          disabled={isLoading}
          className="flex flex-1 items-center justify-center space-x-2 bg-black text-white dark:bg-cream dark:text-dark-bg px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Save Product</span>}
        </button>
      </div>
    </form>
  );
}
