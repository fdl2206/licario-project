"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface Banner {
  id: number;
  image_url: string;
  link?: string | null;
  is_active: number;
}

const FALLBACK_HERO = "/hero.jpg";

function isVideo(url: string) {
  return /\.(mp4|webm)(\?.*)?$/i.test(url);
}

export function PromoBannerStrip() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const [fallbackFailed, setFallbackFailed] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/banners");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) {
          const active = data.filter((b: Banner) => b.is_active === 1);
          setBanners(active);
        }
      } catch (err) {
        console.error("PromoBannerStrip fetch error:", err);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const count = banners.length;

  // Auto-rotation every 5s when multiple banners
  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, 5000);
    return () => clearInterval(id);
  }, [count, paused]);

  const goTo = useCallback((idx: number) => setActiveIndex(idx), []);

  if (count === 0) return null;

  return (
    <section
      aria-label="Promotional banners"
      className="w-full bg-cream"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto w-full max-w-[1920px]">
        <div className="relative w-full overflow-hidden bg-mist/20">
          {/* Panoramic aspect — 1920x400 recommendation: 21/9 mobile, 16/5 tablet, 1920/400 desktop */}
          <div className="relative aspect-[21/9] w-full sm:aspect-[16/5] lg:aspect-[1920/400]">
            {banners.map((banner, idx) => {
              const isActive = idx === activeIndex;
              const isFailed = !!failed[banner.id] || !banner.image_url;
              const isFallbackFailed = !!fallbackFailed[banner.id];
              const src = banner.image_url;
              const video = !isFailed && src ? isVideo(src) : false;

              let content: React.ReactNode | null = null;
              if (isFailed) {
                // Rock-solid fallback: local hero image — if that also fails, render colored div so layout never collapses
                content = isFallbackFailed ? (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-[#FAF0F4] via-[#FDFBF9] to-[#EEE8F0]">
                    <span className="font-body text-[11px] uppercase tracking-[0.28em] text-charcoal/40">
                      Licario — Curated Banner
                    </span>
                  </div>
                ) : (
                  <Image
                    src={FALLBACK_HERO}
                    alt={`Promotional banner ${idx + 1} fallback`}
                    fill
                    priority={idx === 0}
                    unoptimized
                    className="object-cover"
                    sizes="100vw"
                    onError={() =>
                      setFallbackFailed((prev) => ({ ...prev, [banner.id]: true }))
                    }
                  />
                );
                // Final absolute safety: if hero also missing, inline SVG fallback will not be hit because hero is local;
                // but keep /file.svg as last resort via CSS background if needed
              } else if (video) {
                content = (
                  <video
                    src={src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover"
                    onError={() =>
                      setFailed((prev) => ({ ...prev, [banner.id]: true }))
                    }
                  />
                );
              } else {
                content = (
                  <Image
                    src={src!}
                    alt={`Promotional banner ${idx + 1}`}
                    fill
                    priority={idx === 0}
                    unoptimized
                    className="object-cover"
                    sizes="100vw"
                    onError={() =>
                      setFailed((prev) => ({ ...prev, [banner.id]: true }))
                    }
                  />
                );
              }

              return (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-luxe ${
                    isActive ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                  aria-hidden={!isActive}
                >
                  {banner.link ? (
                    <Link
                      href={banner.link}
                      className="relative block h-full w-full overflow-hidden"
                      aria-label={`Banner ${idx + 1} link`}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className="relative h-full w-full overflow-hidden">{content}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Rotation dots — only when multiple banners */}
          {count > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 sm:bottom-4">
              {banners.map((b, idx) => (
                <button
                  key={b.id}
                  type="button"
                  aria-label={`Go to banner ${idx + 1}`}
                  aria-current={idx === activeIndex}
                  onClick={() => goTo(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeIndex
                      ? "w-6 bg-charcoal"
                      : "w-1.5 bg-charcoal/30 hover:bg-charcoal/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
