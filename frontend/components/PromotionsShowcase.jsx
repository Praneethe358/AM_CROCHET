"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getActivePromotions, trackPromotionClick } from "@/services/promotionApi";

const formatPrice = (price) => {
  if (price === null || price === undefined || Number.isNaN(Number(price))) {
    return "₹ 0.00";
  }

  return `₹ ${Number(price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function PromotionsShowcase() {
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    const fetchSpecialCombos = async () => {
      try {
        const data = await getActivePromotions({ placement: "special_combos" });
        setPromotions(data || []);
      } catch (error) {
        console.error("Failed to fetch special combos", error);
        setPromotions([]);
      }
    };

    fetchSpecialCombos();
  }, []);

  const comboItems = useMemo(() => {
    return promotions
      .flatMap((promotion) => {
        const linkedProducts = promotion.products || [];

        if (!linkedProducts.length) {
          return [
            {
              product: null,
              promotionId: promotion._id,
              badge: promotion.title,
              title: promotion.title,
              banner: promotion.banner,
              discount: promotion.discount,
            },
          ];
        }

        return linkedProducts.map((product) => ({
          product,
          promotionId: promotion._id,
          badge: promotion.title,
          title: promotion.title,
          banner: promotion.banner,
          discount: promotion.discount,
        }));
      })
      .slice(0, 6);
  }, [promotions]);

  const handleComboClick = async (promotionId) => {
    if (!promotionId) {
      return;
    }

    try {
      await trackPromotionClick(promotionId);
    } catch (error) {
      console.error("Failed to track combo click", error);
    }
  };

  if (!comboItems.length) {
    return (
      <section className="py-12 bg-theme-secondary/55 border-t border-theme-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-theme-text">Special Combos</h2>
            <Link href="/products" className="text-sm font-medium text-theme-accent hover:underline">
              View All
            </Link>
          </div>

          <div className="rounded-2xl border border-theme-border bg-white p-6 sm:p-8 shadow-sm text-center">
            <p className="text-lg font-semibold text-theme-text">No active special combos right now</p>
            <p className="text-sm text-theme-faint mt-2">Create combos from admin to display them on home.</p>
            <Link
              href="/products"
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-theme-accent px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-theme-secondary/55 border-t border-theme-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-theme-text">Special Combos</h2>
          <Link href="/products" className="text-sm font-medium text-theme-accent hover:underline">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {comboItems.map((item) => {
            const productId = item.product?._id;
            const productLink = productId ? `/products/${productId}` : "/products";

            return (
              <article key={`${item.promotionId}-${productId || item.badge}`} className="rounded-xl overflow-hidden border border-theme-border bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-44">
                  <Image
                    src={item.product?.image || item.product?.images?.[0] || item.banner || "https://picsum.photos/400/300"}
                    alt={item.product?.name || item.title || "Combo product"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 20vw"
                  />
                </div>
                <div className="p-3">
                  <p className="inline-flex rounded-full bg-theme-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-theme-faint">
                    Special Combo
                  </p>
                  <h3 className="mt-2 text-[17px] leading-6 font-medium text-theme-text line-clamp-2">{item.product?.name || item.title || "Combo Product"}</h3>
                  {item.product?.price !== undefined && item.product?.price !== null ? (
                    <p className="mt-2 text-[30px] leading-none font-semibold text-theme-text">{formatPrice(item.product?.price)}</p>
                  ) : item.discount !== undefined && item.discount !== null ? (
                    <p className="mt-2 text-lg font-semibold text-theme-accent">Up to {item.discount}% OFF</p>
                  ) : (
                    <p className="mt-2 text-base font-semibold text-theme-text">Exclusive Offer</p>
                  )}
                  <div className="mt-3 flex justify-end">
                    <Link
                      href={productLink}
                      onClick={() => handleComboClick(item.promotionId)}
                      className="inline-flex items-center justify-center rounded-md border border-theme-border px-4 py-1.5 text-sm font-medium text-theme-text hover:bg-theme-secondary"
                    >
                      Add
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
