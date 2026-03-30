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
import { buildProductPath } from '@/utils/seo';

export default function PromotionsShowcase({ initialPromotions }) {
  const [promotions, setPromotions] = useState([]);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const hasInitialPromotionsProp = Array.isArray(initialPromotions) && initialPromotions.length > 0;

  useEffect(() => {
    if (hasInitialPromotionsProp) {
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
  }, [hasInitialPromotionsProp]);

  const effectivePromotions = useMemo(() => {
    return hasInitialPromotionsProp
      ? initialPromotions
      : promotions;
  }, [hasInitialPromotionsProp, initialPromotions, promotions]);

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

  const shouldEnableLoop = comboItems.length > 4;

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
    <section className="bg-theme-bg px-3 py-6 md:px-8 md:py-12 border-t border-theme-border/50">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center md:mb-6">
          <div />
          <h2 className="text-center text-theme-text font-bold">
            Special Combos
          </h2>
          <div className="justify-self-end">
            <Link 
              href="/products" 
              className="text-sm md:text-base text-theme-accent underline underline-offset-4 decoration-1 hover:text-theme-text transition-colors"
            >
              View All
            </Link>
          </div>
        </div>

        <div className="relative w-full rounded-xl border border-theme-border/80 bg-white/70 p-1.5 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.03)] md:rounded-2xl md:p-3">
          <Swiper
            modules={[Navigation]}
            spaceBetween={6}
            slidesPerView={2.05}
            loop={shouldEnableLoop}
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
              const productLink = productId ? buildProductPath(item.product) : '/products';
              const countdownText = formatCountdown(item.endDate);
              const discountValue = Number(item.discount);
              const showDiscount = Number.isFinite(discountValue) && discountValue > 0;
              
              const imageSrc = item.product?.image || item.product?.images?.[0] || item.banner || '';

              return (
                <SwiperSlide key={`${item.promotionId}-${productId || index}`} className="h-auto">
                  <article className="group flex h-full flex-col overflow-hidden rounded-lg border-2 border-theme-border/70 bg-white shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-theme-accent/70 hover:shadow-[0_10px_30px_rgba(0,0,0,0.09)] md:rounded-xl">
                    <Link
                      href={productLink}
                      onClick={() => handleComboClick(item.promotionId)}
                      className="relative block w-full aspect-square overflow-hidden bg-gray-100"
                    >
                      <Image
                        src={getOptimizedImageUrl(imageSrc, { width: 600 })}
                        alt={item.product?.name ? `${item.product.name} - AM Crochet Bags` : 'Handmade crochet bag combo item'}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      {countdownText ? (
                        <div className="absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded-full bg-theme-text/80 backdrop-blur-md px-2.5 py-1 text-[9px] font-semibold text-white md:gap-2 md:px-4 md:py-2 md:text-xs">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></svg>
                          <span className="tracking-wider">{countdownText}</span>
                        </div>
                      ) : null}
                      {/* Wishlist Heart */}
                      <div className="absolute right-2 top-2 z-10 rounded-full bg-white/80 p-1 text-gray-400 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-red-500 md:right-3 md:top-3 md:p-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                      </div>
                    </Link>

                    <div className="flex min-h-[94px] flex-1 flex-col gap-1 border-t border-theme-border/70 p-2 md:min-h-[160px] md:gap-3 md:p-4">
                      <span className="inline-flex max-w-full self-start truncate rounded-full border border-theme-border/60 bg-theme-accent px-2 py-0.5 text-[7px] font-bold uppercase tracking-wide text-theme-text md:px-3 md:py-1.5 md:text-xs">
                        {item.badge}
                      </span>
                      
                      <Link href={productLink} onClick={() => handleComboClick(item.promotionId)} className="block flex-1">
                        <h3 className="mb-0.5 line-clamp-2 text-[10px] font-medium leading-snug text-theme-text transition-colors hover:text-theme-accent md:text-base">
                          {item.product?.name || item.title || 'Special Collection Item'}
                        </h3>
                      </Link>

                      <div className="mt-auto flex items-center justify-between gap-1 pt-1 md:gap-3 md:pt-4">
                        <div className="flex flex-col">
                          {showDiscount ? (
                            <span className="mb-0.5 inline-flex self-start rounded-full border border-theme-accent/70 bg-theme-accent/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-theme-text md:mb-1 md:px-2 md:text-[10px]">
                              {Math.round(discountValue)}% Off
                            </span>
                          ) : null}
                          <span className="text-sm font-bold text-theme-text md:text-xl">
                            ₹ {item.product?.price ? parseInt(item.product.price).toLocaleString('en-IN') : '2,099'}.00
                          </span>
                        </div>
                        <button type="button" className="inline-flex items-center justify-center rounded-full border border-theme-text bg-theme-text px-4 py-1.5 text-[10px] font-medium text-white transition-all hover:border-theme-accent hover:bg-theme-accent md:px-6 md:py-2.5 md:text-xs uppercase tracking-widest">
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
