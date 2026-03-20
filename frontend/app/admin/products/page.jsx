"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";
import { getAdminProducts, deleteAdminProduct } from "@/services/adminApi";
import ProductTable from "@/components/admin/ProductTable";
import { toast } from "react-hot-toast";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAdminProducts();
      setProducts(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteAdminProduct(id);
        toast.success("Product deleted");
        setProducts(products.filter((p) => p._id !== id));
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete product");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-serif text-dark-text dark:text-cream">Products</h1>
        <Link
          href="/admin/products/add"
          className="inline-flex items-center justify-center space-x-2 bg-black text-white dark:bg-cream dark:text-dark-bg px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-black/5 dark:border-white/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-dark-text dark:text-cream" />
          </div>
        ) : (
          <ProductTable products={products} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
