"use client";

import Link from "next/link";
import { Edit2, Trash2 } from "lucide-react";
import Image from "next/image";

export default function ProductTable({ products, onDelete }) {
  if (!products || products.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        No products found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 font-medium border-b border-black/5 dark:border-white/10">
          <tr>
            <th className="px-6 py-4">Product</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Price</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 dark:divide-white/10">
          {products.map((product) => (
            <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 relative rounded-md overflow-hidden bg-gray-100 dark:bg-white/10 shrink-0">
                    <Image
                      src={product.images?.[0] || product.image || "/bags/placeholder.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="font-medium text-dark-text dark:text-cream truncate max-w-[200px]">
                    {product.name}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-400 capitalize">
                {product.category || "Uncategorized"}
              </td>
              <td className="px-6 py-4 text-dark-text dark:text-cream font-medium">
                ${product.price?.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <Link
                  href={`/admin/products/edit/${product._id}`}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                >
                  <Edit2 size={16} />
                </Link>
                <button
                  onClick={() => onDelete(product._id)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
