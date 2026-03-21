"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getAdminFeatured,
  getAdminProducts,
  updateAdminFeatured,
} from "@/services/adminApi";

const toProductMap = (products) => {
  const map = new Map();
  products.forEach((product) => {
    map.set(product._id, product);
  });
  return map;
};

export default function AdminFeaturedPage() {
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [maxItems, setMaxItems] = useState(6);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productData, featuredData] = await Promise.all([getAdminProducts(), getAdminFeatured()]);
        const safeProducts = productData || [];
        const productMap = toProductMap(safeProducts);
        setProducts(safeProducts);

        const items = (featuredData?.items || [])
          .map((entry) => {
            const product = entry?.product?._id ? entry.product : productMap.get(entry?.product);
            if (!product) return null;
            return {
              _id: product._id,
              name: product.name,
              price: product.price,
              image: product.image || product.images?.[0] || "",
            };
          })
          .filter(Boolean);

        setSelectedItems(items);
        setMaxItems(Number(featuredData?.maxItems) || 6);
        setIsActive(featuredData?.isActive !== false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load featured collection");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const selectedIds = useMemo(() => new Set(selectedItems.map((item) => item._id)), [selectedItems]);

  const availableProducts = useMemo(
    () => products.filter((product) => !selectedIds.has(product._id)),
    [products, selectedIds]
  );

  const addProduct = () => {
    if (!selectedProductId) return;

    if (selectedItems.length >= maxItems) {
      toast.error(`You can only add up to ${maxItems} items`);
      return;
    }

    const product = products.find((item) => item._id === selectedProductId);
    if (!product) return;

    setSelectedItems((prev) => [
      ...prev,
      {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image || product.images?.[0] || "",
      },
    ]);
    setSelectedProductId("");
  };

  const removeProduct = (id) => {
    setSelectedItems((prev) => prev.filter((item) => item._id !== id));
  };

  const moveItem = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= selectedItems.length) return;

    setSelectedItems((prev) => {
      const next = [...prev];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const saveCollection = async () => {
    if (selectedItems.length > maxItems) {
      toast.error(`Selected items exceed max limit (${maxItems})`);
      return;
    }

    try {
      setSaving(true);
      const updated = await updateAdminFeatured({
        items: selectedItems.map((item) => item._id),
        maxItems: Number(maxItems),
        isActive,
      });

      const normalized = (updated?.items || [])
        .map((entry) => ({
          _id: entry.product?._id,
          name: entry.product?.name,
          price: entry.product?.price,
          image: entry.product?.image || entry.product?.images?.[0] || "",
        }))
        .filter((item) => item._id);

      setSelectedItems(normalized);
      setMaxItems(Number(updated?.maxItems) || maxItems);
      setIsActive(updated?.isActive !== false);
      toast.success("Featured collection updated");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to update featured collection");
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
      <h1 className="text-2xl sm:text-3xl font-serif text-dark-text dark:text-cream">Featured Collection</h1>

      <section className="bg-white dark:bg-dark-card rounded-2xl border border-black/5 dark:border-white/10 p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Add product</label>
            <select
              value={selectedProductId}
              onChange={(event) => setSelectedProductId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2"
            >
              <option value="">Select a product</option>
              {availableProducts.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={addProduct}
            className="inline-flex items-center justify-center rounded-lg bg-black text-white dark:bg-cream dark:text-dark-bg px-4 py-2 text-sm font-medium"
          >
            Add to featured
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Max items</label>
            <input
              type="number"
              min="1"
              max="20"
              value={maxItems}
              onChange={(event) => setMaxItems(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2"
            />
          </div>

          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
              />
              Active on homepage
            </label>
          </div>
        </div>

        <p className="text-xs text-gray-500">Selected: {selectedItems.length} / {maxItems}</p>

        <div className="divide-y divide-black/5 dark:divide-white/10 rounded-xl border border-black/5 dark:border-white/10 overflow-hidden">
          {!selectedItems.length ? (
            <p className="p-4 text-sm text-gray-500">No featured products selected yet.</p>
          ) : (
            selectedItems.map((item, index) => (
              <div key={item._id} className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-dark-text dark:text-cream truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">Order: {index + 1}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveItem(index, -1)}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-white/10 p-2 text-xs"
                    aria-label="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, 1)}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-white/10 p-2 text-xs"
                    aria-label="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeProduct(item._id)}
                    className="inline-flex items-center justify-center rounded-lg border border-red-300 text-red-600 p-2 text-xs"
                    aria-label="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={saveCollection}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-black text-white dark:bg-cream dark:text-dark-bg px-4 py-2 text-sm font-medium disabled:opacity-70"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Save Featured Collection
        </button>
      </section>
    </div>
  );
}
