"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Cormorant_Garamond } from "next/font/google";
import { PromoBannerStrip } from "@/components/PromoBannerStrip";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

interface Memory {
  id: number;
  image_url: string;
  customer_name: string;
  description?: string;
  created_at?: string;
}

const FALLBACK_IMAGE = "/file.svg";

function isVideo(url: string) {
  return /\.(mp4|webm)(\?.*)?$/i.test(url);
}

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMemories() {
      try {
        const res = await fetch("/api/memories");
        if (!res.ok) throw new Error("Failed to fetch memories");
        const data = await res.json();
        setMemories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading memories:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMemories();
  }, []);

  return (
    <main className="flex flex-1 flex-col bg-cream">
      {/* High-end editorial header — dark luxury, matching landing/craftsmanship */}
      <section className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden bg-navy">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        <div className="absolute inset-0 bg-navy/40" />
        <div className="relative z-10 flex flex-col items-center gap-5 px-6 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-pastel-pink">
            Community &amp; Stories
          </span>
          <h1
            className={`${cormorant.className} max-w-3xl text-5xl font-medium uppercase tracking-[0.18em] text-cream md:text-7xl`}
          >
            Memories
          </h1>
          <p className="max-w-lg font-body text-sm leading-relaxed text-cream/70">
            Licario pieces living in the wild — moments, celebrations, and everyday quiet luxury shared by our
            clients.
          </p>
        </div>
      </section>

      {/* Dynamic auto-rotating promo banner slider — same component as Landing & Shop All */}
      <PromoBannerStrip />

      {/* Dynamic zig-zag memories content — seamless flow, no dead placeholders */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="font-body text-xs uppercase tracking-[0.2em] text-charcoal/40 animate-pulse">
            Loading stories...
          </span>
        </div>
      ) : (
        memories.map((memory, index) => {
          const isImageLeft = index % 2 === 0;
          return (
            <section
              key={memory.id}
              className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-6 py-24 sm:py-32 md:grid-cols-2 md:items-center"
            >
              {/* Media */}
              <div
                className={`w-full overflow-hidden rounded-2xl border border-mist/20 bg-mist/20 shadow-card ${
                  isImageLeft ? "" : "order-1 md:order-2"
                }`}
              >
                <div className="relative aspect-[3/4] w-full">
                  {isVideo(memory.image_url) ? (
                    <video
                      src={memory.image_url}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      src={memory.image_url}
                      alt={memory.customer_name}
                      fill
                      priority={index === 0}
                      unoptimized
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Text */}
              <div className={`flex flex-col gap-5 ${isImageLeft ? "" : "order-2 md:order-1"}`}>
                <span className="eyebrow text-pastel-pink font-semibold">
                  Client Archive · Memory {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="text-display-md font-medium text-charcoal md:text-display-lg">
                  {memory.customer_name}
                </h2>
                <div className="rule-olive w-16" />
                <p className="font-body text-base leading-relaxed text-charcoal/70">
                  {memory.description ||
                    "Wearing Licario — considered silhouettes designed to be lived in, not simply worn."}
                </p>
              </div>
            </section>
          );
        })
      )}
    </main>
  );
}
