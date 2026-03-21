"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import Container from "./Container";
import Button from "./Button";

export default function Hero({
  title = "Minimalism. Perfected.",
  subtitle = "Premium handcrafted bags designed for everyday elegance. Experience the seamless blend of luxury materials and modern utility.",
  buttonText = "Explore Collection",
  buttonLink = "/products",
  bannerImage = "/bag.png",
}) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const descRef = useRef(null);
  const btnRef = useRef(null);
  const imageRef = useRef(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Text stagger reveal
      tl.fromTo(
        textRef.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power4.out" }
      )
      .fromTo(
        descRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.7"
      )
      .fromTo(
        btnRef.current,
        { y: 20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" },
        "-=0.6"
      );

      // Image slide and scale
      gsap.fromTo(
        imageRef.current,
        { x: 100, scale: 0.9, opacity: 0 },
        { x: 0, scale: 1, opacity: 1, duration: 1.5, ease: "power4.out", delay: 0.2 }
      );

      // Subtle continuous floating/parallax animation
      gsap.to(imageRef.current, {
        y: -15,
        duration: 2.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1.5
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="pt-24 pb-20 md:pt-40 md:pb-28 overflow-hidden min-h-screen md:min-h-[90vh] flex items-center bg-gradient-to-r from-[#FDF6EC] via-[#F7EFE5] to-[#F3E8D9]">
      <Container>
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-12 lg:gap-24">
          
          {/* LEFT SIDE: Text Content */}
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left z-10">
            <h1 
              ref={textRef}
              className="text-5xl md:text-7xl lg:text-[5rem] font-serif font-bold tracking-tight text-theme-text mb-6 leading-[1.05]"
            >
              {title}
            </h1>
            <p 
              ref={descRef}
              className="text-lg md:text-xl text-theme-muted mb-10 max-w-lg leading-relaxed font-normal"
            >
              {subtitle}
            </p>
            <div ref={btnRef}>
              <Link href={buttonLink || "/products"}>
                <Button variant="primary" className="text-lg px-8 py-4 rounded-full">
                  {buttonText}
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE: Large bag product image */}
          <div className="w-full md:w-1/2 relative flex justify-center md:mt-0 pb-4 md:pb-0">
            {/* Premium blur overlay behind the image */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-theme-bg/60 rounded-full blur-[80px] opacity-70 z-0 pointer-events-none"></div>
            
            <div ref={imageRef} className="relative z-10 w-full max-w-[350px] md:max-w-lg aspect-square">
              <div className="w-full h-full relative object-contain will-change-transform">
                {!imageError ? (
                  <Image
                    src={bannerImage || "/bag.png"}
                    alt="Premium Stylish Bag"
                    fill
                    className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                    priority
                    sizes="(max-width: 768px) 90vw, 50vw"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="absolute inset-0 border border-theme-border rounded-[2rem] flex items-center justify-center text-theme-muted bg-theme-bg/50 backdrop-blur-xl">
                    <span className="text-sm px-4 text-center">Image unavailable</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
