"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { resolveImageSrc } from '@/utils/cloudinaryImage';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function HeroCarousel({ slides }) {
  if (!Array.isArray(slides) || slides.length === 0) return null;

  return (
    <Swiper
      modules={[Pagination, Autoplay, EffectFade]}
      effect="fade"
      speed={1500}
      autoplay={{ delay: 6000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      className="w-full h-full luxury-swiper"
    >
      {slides.map((slide, index) => {
        const imageSrc = slide?.image ? resolveImageSrc(slide.image, { width: 1200 }) : null;
        const isCloudinaryImage = typeof imageSrc === 'string' && imageSrc.includes('res.cloudinary.com');

        return (
        <SwiperSlide key={index} className="relative w-full h-full">
          <div className="absolute inset-0 w-full h-full">
            {(slide?.mediaType === 'video' && slide?.video && !(index === 0 && slide?.image)) ? (
              <video
                key={`video-${index}-${slide.video}`}
                className="absolute inset-0 h-full w-full object-cover"
                src={slide.video}
                poster={slide?.image ? resolveImageSrc(slide.image, { width: 1200 }) : undefined}
                autoPlay
                muted
                loop
                playsInline
                preload={index === 0 ? 'metadata' : 'none'}
              />
            ) : imageSrc ? (
              <Image
                src={imageSrc}
                alt={slide.title ? `${slide.title} - AM Crochet Bags` : 'AM Crochet Bags hero image'}
                fill
                priority={index === 0}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding={index === 0 ? 'sync' : 'async'}
                unoptimized={isCloudinaryImage}
                quality={index === 0 ? 68 : 64}
                sizes="100vw"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
          </div>

          <div className="absolute bottom-0 left-0 w-full p-6 pb-28 md:p-16 md:pb-24 z-10 flex flex-col items-start">
            {slide.subtitle && (
              <span className="text-white/80 text-[10px] md:text-xs font-light tracking-[0.3em] mb-4 uppercase">
                {slide.subtitle}
              </span>
            )}

            {slide.title && (
              <h2 className="text-white text-5xl md:text-7xl lg:text-8xl font-sans md:font-serif tracking-widest uppercase leading-tight mb-5">
                {slide.title}
              </h2>
            )}

            {slide.description && (
              <p className="text-white/90 font-light text-sm md:text-base mb-10 max-w-md tracking-wide">
                {slide.description}
              </p>
            )}

            {slide.link && (
              <div>
                <Link
                  href={slide.link}
                  className="group inline-flex items-center justify-center px-10 py-4 bg-white text-black text-xs font-medium tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-colors duration-500"
                >
                  DISCOVER NOW
                </Link>
              </div>
            )}
          </div>
        </SwiperSlide>
        );
      })}
    </Swiper>
  );
}