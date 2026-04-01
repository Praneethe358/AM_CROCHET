"use client";

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { resolveImageSrc } from '@/utils/cloudinaryImage';

const HeroCarousel = dynamic(() => import('@/components/HeroCarousel'), {
  ssr: false,
});

function HeroSlideContent({ slide }) {
  return (
    <div className="absolute bottom-0 left-0 w-full p-6 pb-28 md:p-16 md:pb-24 z-10 flex flex-col items-start">
      {slide?.subtitle && (
        <span className="text-white/80 text-[10px] md:text-xs font-light tracking-[0.3em] mb-4 uppercase">
          {slide.subtitle}
        </span>
      )}

      {slide?.title && (
        <h2 className="text-white text-5xl md:text-7xl lg:text-8xl font-sans md:font-serif tracking-widest uppercase leading-tight mb-5">
          {slide.title}
        </h2>
      )}

      {slide?.description && (
        <p className="text-white/90 font-light text-sm md:text-base mb-10 max-w-md tracking-wide">
          {slide.description}
        </p>
      )}

      {slide?.link && (
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
  );
}

function HeroStaticFrame({ slide }) {
  const imageSrc = slide?.image ? resolveImageSrc(slide.image, { width: 1100 }) : null;
  const isCloudinaryImage = typeof imageSrc === 'string' && imageSrc.includes('res.cloudinary.com');
  const staticImageSrc = isCloudinaryImage ? '/bag.webp' : imageSrc;

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 w-full h-full">
        {staticImageSrc ? (
          <Image
            src={staticImageSrc}
            alt={slide.title ? `${slide.title} - AM Crochet Bags` : 'AM Crochet Bags hero image'}
            fill
            priority
            fetchPriority="high"
            loading="eager"
            decoding="sync"
            unoptimized
            quality={68}
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#241a13] via-[#1a1713] to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>
      <HeroSlideContent slide={slide} />
    </div>
  );
}

export default function Hero({ slides }) {
  const activeSlides = useMemo(() => {
    if (Array.isArray(slides) && slides.length > 0) {
      return slides;
    }
    return [];
  }, [slides]);

  const [enableCarousel, setEnableCarousel] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || activeSlides.length <= 1) return undefined;

    const enable = () => setEnableCarousel(true);

    const onFirstInput = () => {
      enable();
    };

    window.addEventListener('pointerdown', onFirstInput, { once: true, passive: true });
    window.addEventListener('touchstart', onFirstInput, { once: true, passive: true });
    window.addEventListener('keydown', onFirstInput, { once: true });
    window.addEventListener('scroll', onFirstInput, { once: true, passive: true });

    return () => {
      window.removeEventListener('pointerdown', onFirstInput);
      window.removeEventListener('touchstart', onFirstInput);
      window.removeEventListener('keydown', onFirstInput);
      window.removeEventListener('scroll', onFirstInput);
    };
  }, [activeSlides.length]);

  if (!activeSlides || activeSlides.length === 0) return null;

  const firstSlide = activeSlides[0];

  return (
    <section className="relative w-full h-[100dvh] bg-black overflow-hidden">
      {enableCarousel ? (
        <HeroCarousel slides={activeSlides} />
      ) : (
        <HeroStaticFrame slide={firstSlide} />
      )}
    </section>
  );
}
