"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Hourglass } from "lucide-react";
import { getActivePromotions, trackPromotionClick } from "@/services/promotionApi";

const formatPrice = (price) => {
  if (price === null || price === undefined || Number.isNaN(Number(price))) {
    return "₹ 0.00";
  }
  return `₹ ${Number(price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function PromotionsShowcase({ initialPromotions = [] }) {
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    if (Array.isArray(initialPromotions) && initialPromotions.length > 0) {
      return;
    }

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
  }, [initialPromotions]);

  const effectivePromotions = useMemo(() => {
    if (Array.isArray(initialPromotions) && initialPromotions.length > 0) {
      return initialPromotions;
    }
    return promotions;
  }, [initialPromotions, promotions]);

  const comboItems = useMemo(() => {
    return effectivePromotions
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
      .slice(0, 5);
  }, [effectivePromotions]);

  const handleComboClick = async (promotionId) => {
    if (!promotionId) return;
    try {
      await trackPromotionClick(promotionId);
    } catch (error) {
      console.error("Failed to track combo click", error);
    }
  };

  if (!comboItems.length) {
    return null;
  }

  return (
    <section className="py-6 md:py-12 bg-[#Fbf9f6] border-t border-theme-border/40 pb-8 md:pb-16">
      <div className="mx-auto max-w-[1400px] px-2 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="relative mb-1.5 md:mb-6 flex justify-between items-center px-1 md:px-0">
          <h2 className="text-[18px] md:text-[22px] font-bold tracking-tight text-[#1a3b4d]">Special Combos</h2>
          <Link 
            href="/products" 
            className="text-[11px] md:text-[13px] text-[#4a6b7d] hover:text-[#1a3b4d] transition-colors underline underline-offset-4"
          >
            View All
          </Link>
        </div>

        {/* Grid (5 small cards width) */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-2 sm:gap-4 pb-4 -mx-2 px-2 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {comboItems.map((item, index) => {
            const productId = item.product?._id;
            const productLink = productId ? `/products/${productId}` : "/products";
            
            let imageSrc = item.banner;
            if (item.product?.image) imageSrc = item.product.image;
            if (item.product?.images?.length > 0) imageSrc = item.product.images[0];
            if (!imageSrc) imageSrc = `https://picsum.photos/400/400?random=${index}`;

            return (
              <article key={`${item.promotionId}-${productId || index}`} className="min-w-[150px] sm:min-w-0 snap-start flex flex-col bg-white rounded-lg overflow-hidden border border-[#e8e8e8] shadow-sm hover:shadow-md transition-shadow">
                
                {/* Image Container with strict aspect ratio */}
                <div className="relative aspect-[4/5] sm:aspect-square bg-[#f5f5f5] group">
                  {/* Timer Badge (Red) */}
                  <div className="absolute top-0 left-0 z-10 bg-[#df2c25] text-white text-[8px] sm:text-[11px] font-bold pl-1.5 pr-2 py-1 md:pl-2 md:pr-2.5 md:py-1.5 flex items-center gap-1 sm:gap-1.5 rounded-br-[6px]">
                    <Hourglass className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-90" />
                    <span className="tracking-wide">01h 40m 11s</span>
                  </div>

                  {/* Wishlist Button */}
                  <button className="absolute top-2.5 right-2.5 z-10 p-[7px] bg-white/90 backdrop-blur-sm rounded-full text-gray-400 hover:text-[#df2c25] hover:bg-white shadow-sm border border-gray-100 transition-colors">
                    <Heart className="w-3.5 h-3.5 sm:w-[15px] sm:h-[15px]" />
                  </button>

                  <Link href={productLink} onClick={() => handleComboClick(item.promotionId)}>
                    <Image
                      src={imageSrc}
                      alt={item.product?.name || item.title || "Combo product"}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 20vw"
                    />
                  </Link>

                  {/* Most-Loved Tag over image (Bottom left inside image area) */}
                  {(index < 2 || item.badge?.toLowerCase().includes('loved')) && (
                     <div className="absolute bottom-2 left-2 z-10">
                      <span className="inline-block bg-[#0f3443] text-white text-[7px] sm:text-[9px] font-bold px-1 py-[1.5px] sm:px-2 sm:py-[2.5px] rounded border border-[#0f3443]/20 shadow-sm uppercase tracking-wider">
                        MOST-LOVED COMBO
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-2 sm:p-3.5 flex-1 flex flex-col pt-2 sm:pt-4">
                  <Link href={productLink} onClick={() => handleComboClick(item.promotionId)} className="block group mb-3">
                    <h3 className="text-[11px] sm:text-[13px] leading-[1.3] md:leading-snug font-medium text-[#2f2f2f] line-clamp-2 group-hover:text-[#df2c25] transition-colors">
                      {item.product?.name || item.title || "Exclusive Combo Package"}
                    </h3>
                  </Link>

                  {/* Pricing and Button */}
                  <div className="mt-auto pt-2 sm:pt-3 border-t border-[#f0f0f0] flex items-center justify-between">
                    {item.product?.price !== undefined && item.product?.price !== null ? (
                      <span className="text-[12px] xs:text-[13px] sm:text-[15px] font-bold text-[#111]">{formatPrice(item.product.price)}</span>
                    ) : item.discount ? (
                      <span className="text-[12px] xs:text-[13px] sm:text-[15px] font-bold text-[#df2c25]">{item.discount}% OFF</span>
                    ) : (
                      <span className="text-[14px] sm:text-[15px] font-bold text-[#111]">Exclusive</span>
                    )}

                    <button className="text-[9px] sm:text-[11px] font-medium px-2 py-1 md:px-4 md:py-[5px] border border-[#d8d8d8] rounded text-[#444] hover:border-gray-500 hover:bg-gray-50 transition-colors focus:outline-none">
                      Add
                    </button>
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
