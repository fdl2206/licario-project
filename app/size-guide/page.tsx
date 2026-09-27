"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, ArrowRight, Ruler } from "lucide-react";

interface SizeGuideVariation {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  image: string;
  description: string;
}

const PLACEHOLDER_IMAGE = "/licario-placeholder.svg";

const SIZE_GUIDES: SizeGuideVariation[] = [
  {
    id: "standard",
    label: "Standard Apparel",
    title: "Standard Apparel Size Guide",
    subtitle: "Tops, Outerwear & Bottoms",
    image: "/size-guide.jpg",
    description:
      "Bust, waist, hip, and length measurements in centimeters for Licario's everyday silhouettes. Take your body measurements over light clothing with a soft tape measure.",
  },
  {
    id: "dress",
    label: "Dress Collection",
    title: "Dress Collection Size Guide",
    subtitle: "Maxi, Midi & Shifting Silhouettes",
    // TODO: swap with /size-guide-dress.jpg when the image is ready
    image: "/licario-placeholder.svg",
    description:
      "Tailored guidance for Licario draped dresses and structured evening silhouettes — designed to cinch the waist and fall effortlessly. Swap in /size-guide-dress.jpg here.",
  },
  {
    id: "kebaya",
    label: "Kebaya & Traditional",
    title: "Kebaya & Traditional Size Guide",
    subtitle: "Modern Cut & Bespoke Heritage",
    // TODO: swap with /size-guide-kebaya.jpg when the image is ready
    image: "/licario-placeholder.svg",
    description:
      "Precise bust, shoulder, and torso measurements for our fitted heritage garments. Swap in /size-guide-kebaya.jpg here.",
  },
];

const MEASURE_POINTS = [
  {
    label: "Bust",
    text: "Measure around the fullest part of your chest, keeping the tape level across your shoulder blades.",
  },
  {
    label: "Waist",
    text: "Measure the narrowest part of your torso, just above the navel, without pulling tight.",
  },
  {
    label: "Hips",
    text: "Measure around the fullest part of your hips and glutes, keeping your feet together.",
  },
  {
    label: "Length",
    text: "For garment length, measure from the top of the shoulder down to your desired hem.",
  },
];

export default function SizeGuidePage() {
  const [activeId, setActiveId] = useState(SIZE_GUIDES[0].id);
  const active = SIZE_GUIDES.find((guide) => guide.id === activeId) ?? SIZE_GUIDES[0];

  return (
    <main className="flex flex-1 flex-col bg-cream">
      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-20 sm:py-28">
        {/* Editorial header */}
        <div className="mb-14 flex flex-col items-center gap-3 text-center sm:mb-16">
          <span className="eyebrow text-pastel-pink font-semibold">Sizing &amp; Measurements</span>
          <h1 className="text-display-lg font-medium text-charcoal">Size Guide</h1>
          <p className="mt-2 max-w-md font-body text-sm leading-relaxed text-charcoal/60">
            Find your perfect silhouette with our considered sizing references — comfortable, elegant, and effortless.
          </p>
          <div className="rule-olive mt-6 w-16" />
        </div>

        {/* Variation selector + image viewer */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
          <div className="flex flex-col gap-3">
            {SIZE_GUIDES.map((guide) => {
              const isActive = guide.id === activeId;
              return (
                <button
                  key={guide.id}
                  type="button"
                  onClick={() => setActiveId(guide.id)}
                  aria-pressed={isActive}
                  className={`flex flex-col gap-1 rounded-2xl border p-5 text-left transition-all duration-300 ease-luxe cursor-pointer ${
                    isActive
                      ? "border-pastel-blue bg-white shadow-card"
                      : "border-mist/40 bg-transparent hover:bg-white/60"
                  }`}
                >
                  <span
                    className={`font-body text-[11px] font-semibold uppercase tracking-luxe ${
                      isActive ? "text-pastel-pink" : "text-charcoal/50"
                    }`}
                  >
                    {guide.label}
                  </span>
                  <span className="font-display text-sm font-medium text-charcoal">{guide.title}</span>
                  <span className="font-body text-xs text-charcoal/50">{guide.subtitle}</span>
                </button>
              );
            })}
            <p className="mt-2 font-body text-xs leading-relaxed text-charcoal/50">{active.description}</p>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-mist/20 bg-white shadow-card sm:aspect-[16/10]">
            <Image
              src={active.image}
              alt={`${active.title} — Licario`}
              fill
              unoptimized
              priority
              className="object-contain p-6 sm:p-10"
              onError={(e) => {
                (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
              }}
            />
          </div>
        </div>

        {/* How to measure */}
        <section className="mt-20 sm:mt-24">
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <Ruler className="h-6 w-6 text-pastel-pink" strokeWidth={1.5} />
            <h2 className="text-display-md font-medium text-charcoal">How to Measure</h2>
            <p className="max-w-md font-body text-sm leading-relaxed text-charcoal/60">
              Take measurements over light clothing with a soft tape measure, keeping it snug but not tight.
            </p>
            <div className="rule-olive mt-4 w-12" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MEASURE_POINTS.map((point) => (
              <div
                key={point.label}
                className="flex flex-col gap-2 rounded-2xl border border-mist/30 bg-white/70 p-6 shadow-card"
              >
                <span className="font-body text-[11px] font-semibold uppercase tracking-luxe text-pastel-pink">
                  {point.label}
                </span>
                <p className="font-body text-sm leading-relaxed text-charcoal/70">{point.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Made-to-measure CTA */}
        <section className="mt-20 sm:mt-24">
          <div className="flex flex-col items-center gap-6 rounded-3xl border border-mist/30 bg-white px-8 py-12 text-center shadow-card">
            <h2 className="text-display-md font-medium text-charcoal">Can&apos;t find your size?</h2>
            <p className="max-w-md font-body text-sm leading-relaxed text-charcoal/60">
              Every Licario piece can be tailored to your exact measurements. Message our atelier for bespoke sizing
              and made-to-measure orders.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Link
                href="https://wa.me/6281231740217"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-pastel-peach px-8 font-body text-xs font-semibold uppercase tracking-wide text-charcoal shadow-sm transition-all duration-300 ease-luxe hover:bg-pastel-pink hover:scale-105"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
                Message on WhatsApp
              </Link>
              <Link
                href="/contact-us"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-mist/60 px-8 font-body text-xs font-semibold uppercase tracking-wide text-charcoal/80 transition-all duration-300 ease-luxe hover:bg-mist/40"
              >
                Contact Us
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}