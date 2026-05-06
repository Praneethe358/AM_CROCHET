"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { updateAdminProduct } from "@/services/adminApi";
import { toast } from "react-hot-toast";
import axios from "axios";
import { getApiBaseUrl } from "@/utils/apiBase";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProduct = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const API_BASE_URL = getApiBaseUrl();
      const { data } = await axios.get(`${API_BASE_URL}/products/${id}`);
      setProduct(data?.data || null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleSubmit = async (productData) => {
    setIsSubmitting(true);
    try {
      await updateAdminProduct(id, productData);
      toast.success("Product updated successfully");
      router.push("/admin/products");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 h-64">
        <Loader2 className="w-8 h-8 animate-spin text-dark-text dark:text-cream" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Product not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href="/admin/products"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-serif text-dark-text dark:text-cream">
          Edit Product
        </h1>
      </div>

      <ProductForm initialData={product} onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
