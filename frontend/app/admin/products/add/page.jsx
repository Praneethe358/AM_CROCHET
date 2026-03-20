"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { createAdminProduct } from "@/services/adminApi";
import { toast } from "react-hot-toast";

export default function AddProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (productData) => {
    setIsSubmitting(true);
    try {
      await createAdminProduct(productData);
      toast.success("Product created successfully");
      router.push("/admin/products");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Add New Product
        </h1>
      </div>

      <ProductForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
