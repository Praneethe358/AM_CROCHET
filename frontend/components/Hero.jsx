"use client";

import { useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const defaultSlides = [];

export default function Hero({ slides }) {
  const activeSlides = useMemo(() => {
    if (Array.isArray(slides) && slides.length > 0) {
      return slides;
    }
    return defaultSlides;
  }, [slides]);

  if (!activeSlides || activeSlides.length === 0) return null;

  return (
    <section className="relative w-full h-[100dvh] bg-black overflow-hidden">
      <Swiper
        modules={[Pagination, Autoplay, EffectFade]}
        effect="fade"
        speed={1500}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className="w-full h-full luxury-swiper"
      >
        {activeSlides.map((slide, index) => (
          <SwiperSlide key={index} className="relative w-full h-full">
            <motion.div
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 7, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(' + slide.image + ')' }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
            </motion.div>

            <div className="absolute bottom-0 left-0 w-full p-6 pb-28 md:p-16 md:pb-24 z-10 flex flex-col items-start">
              {slide.subtitle && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/80 text-[10px] md:text-xs font-light tracking-[0.3em] mb-4 uppercase"
                >
                  {slide.subtitle}
                </motion.span>
              )}

              {slide.title && (
                <motion.h2
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-white text-5xl md:text-7xl lg:text-8xl font-serif tracking-widest uppercase leading-tight mb-5"
                >
                  {slide.title}
                </motion.h2>
              )}

              {slide.description && (
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-white/90 font-light text-sm md:text-base mb-10 max-w-md tracking-wide"
                >
                  {slide.description}
                </motion.p>
              )}

              {slide.link && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <Link
                    href={slide.link}
                    className="group inline-flex items-center justify-center px-10 py-4 bg-white text-black text-xs font-medium tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-colors duration-500"
                  >
                    DISCOVER NOW
                  </Link>
                </motion.div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
