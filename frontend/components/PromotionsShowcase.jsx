'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getActivePromotions, trackPromotionClick } from '@/services/promotionApi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

import { getOptimizedImageUrl } from '@/utils/cloudinaryImage';

export default function PromotionsShowcase({ initialPromotions = [] }) {
  const [promotions, setPromotions] = useState([]);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (Array.isArray(initialPromotions) && initialPromotions.length) {
      return;
    }

    const loadPromotions = async () => {
      try {
        const results = await getActivePromotions({ placement: 'special_combos' });
        setPromotions(results || []);
      } catch (error) {
        console.error('Failed to load promotions', error);
      }
    };

    loadPromotions();
  }, [initialPromotions]);

  const effectivePromotions = useMemo(() => {
    return (Array.isArray(initialPromotions) && initialPromotions.length)
      ? initialPromotions
      : promotions;
  }, [initialPromotions, promotions]);

  const comboItems = useMemo(() => {
    return effectivePromotions
      .filter((promo) => promo && (promo.applicableProducts?.length > 0 || promo.products?.length > 0))
      .flatMap((promotion) => {
        const productsArr = promotion.products || promotion.applicableProducts || [];
        const linkedProducts = productsArr.slice(0, 4);
        return linkedProducts.map((product) => ({
          product,
          promotionId: promotion._id,
          badge: promotion.title || 'MOST-LOVED COMBO',
          title: promotion.title,
          banner: promotion.banner,
          discount: promotion.discount,
          endDate: promotion.endDate,
        }));
      });
  }, [effectivePromotions]);

  useEffect(() => {
    if (!comboItems.length) return undefined;

    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [comboItems.length]);

  const formatCountdown = (endDate) => {
    const endTime = new Date(endDate).getTime();
    if (!endDate || Number.isNaN(endTime)) {
      return null;
    }

    const remainingMs = endTime - nowMs;
    if (remainingMs <= 0) {
      return '00h 00m 00s';
    }

    const totalSeconds = Math.floor(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');

    return `${hh}h ${mm}m ${ss}s`;
  };

  const handleComboClick = async (promotionId) => {
    if (!promotionId) return;
    try {
      await trackPromotionClick(promotionId);
    } catch (error) {
      console.error('Failed to track combo click', error);
    }
  };

  if (!comboItems.length) {
    return null;
  }

  return (
    <section className="bg-[#fef9f8] px-3 py-5 md:px-8 md:py-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-3 flex items-center justify-between md:mb-6">
          <h2 className="text-xl md:text-3xl font-semibold text-[#0a5d5d]">
            Special Combos
          </h2>
          <Link 
            href="/products" 
            className="text-sm md:text-base text-[#0a5d5d] underline underline-offset-4 decoration-1 hover:text-[#063f3f] transition-colors"
          >
            View All
          </Link>
        </div>

        <div className="relative w-full">
          <Swiper
            modules={[Navigation]}
            spaceBetween={6}
            slidesPerView={2.05}
            loop={comboItems.length > 2}
            grabCursor
            allowTouchMove={comboItems.length > 1}
            breakpoints={{
              390: { slidesPerView: 2.2 },
              480: { slidesPerView: 2.45 },
              768: { slidesPerView: 2.4 },
              1024: { slidesPerView: 4 },
            }}
            navigation
            className="promotions-swiper pb-2 !px-0.5 md:!px-2"
          >
            {comboItems.map((item, index) => {
              const productId = item.product?._id;
              const productLink = productId ? `/products/${productId}` : '/products';
              const countdownText = formatCountdown(item.endDate);
              
              const imageSrc = item.product?.image || item.product?.images?.[0] || item.banner || `https://picsum.photos/600/800?random=${index}`;

              return (
                <SwiperSlide key={`${item.promotionId}-${productId || index}`} className="h-auto">
                  <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                    <Link
                      href={productLink}
                      onClick={() => handleComboClick(item.promotionId)}
                      className="relative block w-full aspect-square overflow-hidden bg-gray-100"
                    >
                      <Image
                        src={getOptimizedImageUrl(imageSrc, { width: 600 })}
                        alt={item.product?.name || 'Combo item'}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      {countdownText ? (
                        <div className="absolute left-0 top-0 z-10 flex items-center gap-1 rounded-br-md bg-[#d9232d] px-1.5 py-0.5 text-[9px] font-bold text-white md:gap-1.5 md:rounded-br-lg md:px-3 md:py-1.5 md:text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></svg>
                          {countdownText}
                        </div>
                      ) : null}
                      {/* Wishlist Heart */}
                      <div className="absolute right-2 top-2 z-10 rounded-full bg-white/80 p-1 text-gray-400 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-red-500 md:right-3 md:top-3 md:p-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                      </div>
                    </Link>

                    <div className="flex min-h-[94px] flex-1 flex-col gap-1 p-2 md:min-h-[160px] md:gap-3 md:p-4">
                      <span className="inline-flex max-w-full self-start truncate rounded-full bg-[#0a5d5d] px-2 py-0.5 text-[7px] font-bold uppercase tracking-wide text-white md:px-3 md:py-1.5 md:text-xs">
                        {item.badge}
                      </span>
                      
                      <Link href={productLink} onClick={() => handleComboClick(item.promotionId)} className="block flex-1">
                        <h3 className="mb-0.5 line-clamp-2 text-[10px] font-medium leading-snug text-gray-800 transition-colors hover:text-[#0a5d5d] md:text-base">
                          {item.product?.name || item.title || 'Special Collection Item'}
                        </h3>
                      </Link>

                      <div className="mt-auto flex items-end justify-between gap-1 pt-0.5 md:gap-3 md:pt-2">
                        <span className="text-[13px] font-semibold text-gray-900 md:text-xl">
                          ₹ {item.product?.price ? parseInt(item.product.price).toLocaleString('en-IN') : '2,099'}.00
                        </span>
                        <button type="button" className="min-w-[44px] rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 md:min-w-[86px] md:px-5 md:py-1.5 md:text-sm">
                          Add
                        </button>
                      </div>
                    </div>
                  </article>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .promotions-swiper .swiper-button-next, 
        .promotions-swiper .swiper-button-prev {
          background-color: white;
          color: #333;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .promotions-swiper .swiper-button-next:after, 
        .promotions-swiper .swiper-button-prev:after {
          font-size: 16px;
          font-weight: bold;
        }
        .promotions-swiper .swiper-button-disabled {
          opacity: 0 !important;
          pointer-events: none;
        }
        @media (max-width: 767px) {
          .promotions-swiper .swiper-button-next,
          .promotions-swiper .swiper-button-prev {
            display: none;
          }
        }
      `}} />
    </section>
  );
}
