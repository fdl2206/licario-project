"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, ArrowRight, Ruler } from "lucide-react";

interface SizeRow {
  label: string;
  values: string[];
}

interface SizeGuideVariation {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  caption: string;
  tableTitle: string;
  rows: SizeRow[];
}

const GUIDE_SIZES = ["S", "M", "L", "XL", "XXL"] as const;

const MEASUREMENT_NOTE = "All measurements in centimeters. Between sizes? Choose the larger size.";

const SIZE_GUIDES: SizeGuideVariation[] = [
  {
    id: "standard",
    label: "Standard Apparel",
    title: "Standard Apparel Size Guide",
    subtitle: "Tops, Outerwear & Bottoms",
    caption: "Standard apparel size guide, sizes S through XXL",
    tableTitle: "Standard Apparel Measurements",
    rows: [
      { label: "Shoulder", values: ["38", "39", "40", "41", "42"] },
      { label: "Bust", values: ["92", "96", "100", "104", "108"] },
      { label: "Waist", values: ["72", "76", "80", "84", "88"] },
      { label: "Hips", values: ["98", "102", "106", "110", "114"] },
      { label: "Arm Length", values: ["57", "58", "59", "60", "61"] },
      { label: "Arm Hole", values: ["46.5", "48", "49.5", "51", "52.5"] },
    ],
  },
  {
    id: "dress",
    label: "Dress Collection",
    title: "Dress Collection Size Guide",
    subtitle: "Maxi, Midi & Shifting Silhouettes",
    caption: "Dress collection modest fit size guide, sizes S through XXL",
    tableTitle: "Dress (Modest Fit) Measurements",
    rows: [
      { label: "Lingkar Dada (Bust)", values: ["88 - 92", "92 - 96", "96 - 100", "100 - 106", "106 - 112"] },
      { label: "Lingkar Pinggang (Waist)", values: ["72 - 76", "76 - 80", "80 - 84", "84 - 90", "90 - 96"] },
      { label: "Lingkar Panggul (Hips)", values: ["96 - 100", "100 - 104", "104 - 108", "108 - 114", "114 - 120"] },
      { label: "Panjang Bahu (Shoulder)", values: ["37", "38", "39", "40", "41 - 42"] },
      { label: "Lingkar Ketiak (Armhole)", values: ["44 - 46", "46 - 48", "48 - 50", "50 - 52", "52 - 55"] },
      { label: "Lingkar Lengan Atas (Upper Arm)", values: ["30 - 32", "32 - 34", "34 - 36", "36 - 38", "38 - 42"] },
      { label: "Panjang Tangan (Arm Length)", values: ["55", "56", "57", "58", "59"] },
      { label: "Panjang Baju (Dress Length)", values: ["138", "140", "140", "142", "142 - 145"] },
    ],
  },
  {
    id: "kebaya",
    label: "Kebaya & Traditional",
    title: "Kebaya & Traditional Size Guide",
    subtitle: "Modern Cut & Bespoke Heritage",
    caption: "Kebaya slim fit size guide, sizes S through XXL",
    tableTitle: "Kebaya (Slim Fit) Measurements",
    rows: [
      { label: "Lingkar Dada Utama (Bust)", values: ["84 - 86", "88 - 90", "92 - 94", "96 - 100", "102 - 106"] },
      { label: "Lingkar Dada Atas (Upper Bust)", values: ["80 - 82", "84 - 86", "88 - 90", "92 - 96", "98 - 102"] },
      { label: "Lingkar Dada Bawah (Underbust)", values: ["68 - 72", "72 - 76", "76 - 80", "80 - 86", "86 - 92"] },
      { label: "Lingkar Pinggang (Waist)", values: ["66 - 68", "70 - 72", "74 - 76", "78 - 82", "84 - 88"] },
      { label: "Lingkar Panggul (Hips)", values: ["88 - 92", "92 - 96", "96 - 100", "100 - 106", "106 - 112"] },
      { label: "Panjang Bahu (Shoulder)", values: ["36", "37", "38", "39", "40 - 41"] },
      { label: "Lebar Punggung (Back Width)", values: ["33 - 34", "34 - 35", "35 - 36", "36 - 38", "38 - 40"] },
      { label: "Lebar Dada Atas (Upper Bust Width)", values: ["31 - 32", "32 - 33", "33 - 34", "34 - 36", "36 - 38"] },
      { label: "Lingkar Ketiak (Armhole)", values: ["42", "44", "46", "48 - 50", "50 - 52"] },
      { label: "Lingkar Lengan Atas (Upper Arm)", values: ["28", "30", "32", "34 - 36", "36 - 38"] },
      { label: "Panjang Tangan (Arm Length)", values: ["54", "55", "56", "57", "58"] },
      { label: "Lingkar Pergelangan (Wrist)", values: ["16", "17", "18", "19", "20"] },
      { label: "Lingkar Leher (Neck)", values: ["34 - 35", "35 - 36", "36 - 37", "37 - 38", "39 - 40"] },
      { label: "Panjang Badan (Body Length)", values: ["37 - 38", "38 - 39", "39 - 40", "40 - 41", "41 - 42"] },
      { label: "Panjang Baju Kebaya (Kebaya Length)", values: ["85 - 90", "90 - 95", "95 - 100", "100", "100"] },
    ],
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

function SizeGuideTable({ title, caption, rows }: { title: string; caption: string; rows: SizeRow[] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-mist/20 bg-white shadow-card">
      <div className="border-b border-mist/20 bg-cream/40 px-6 py-5 sm:px-8">
        <h2 className="font-display text-lg font-medium text-charcoal">{title}</h2>
        <p className="mt-1 font-body text-xs text-charcoal/50">{MEASUREMENT_NOTE}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-mist/20">
              <th
                scope="col"
                className="px-6 py-4 font-body text-[11px] font-semibold uppercase tracking-luxe text-charcoal/50 sm:px-8"
              >
                Measurement
              </th>
              {GUIDE_SIZES.map((size) => (
                <th
                  key={size}
                  scope="col"
                  className="px-4 py-4 text-center font-body text-[11px] font-semibold uppercase tracking-luxe text-charcoal/50"
                >
                  {size}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-mist/20">
            {rows.map((row, rowIndex) => (
              <tr key={row.label} className={rowIndex % 2 === 1 ? "bg-cream/20" : undefined}>
                <th
                  scope="row"
                  className="whitespace-nowrap px-6 py-4 font-body text-sm font-medium text-charcoal sm:px-8"
                >
                  {row.label}
                </th>
                {row.values.map((value, valueIndex) => (
                  <td
                    key={`${row.label}-${GUIDE_SIZES[valueIndex]}`}
                    className="whitespace-nowrap px-4 py-4 text-center font-body text-sm tabular-nums text-charcoal/70"
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
          </div>

          <SizeGuideTable title={active.tableTitle} caption={active.caption} rows={active.rows} />
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