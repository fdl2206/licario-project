"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { ProductSize } from "@/lib/product";

const SIZE_ORDER: ProductSize[] = ["S", "M", "L", "XL"];

type SizeChartRow = {
  size: ProductSize;
  shoulder: number;
  bust: number;
  waist: number;
  hips: number;
  armLength: number;
  armHole: number;
};

type NumericMeasurementKey = Exclude<keyof SizeChartRow, "size">;

export type MeasurementKey =
  | "shoulder"
  | "armLength"
  | "armHole"
  | "upperArm"
  | "wrist"
  | "bust"
  | "waist"
  | "hips"
  | "bodyLength"
  | "topLength"
  | "neck"
  | "backWidth"
  | "upperBustWidth"
  | "upperBust"
  | "underbust";

export interface MeasurementField {
  key: MeasurementKey;
  label: string;
  placeholder: string;
  optional?: boolean;
}

export type CustomMeasurements = Record<MeasurementKey, string>;

const SIZE_CHART: SizeChartRow[] = [
  { size: "S", shoulder: 38, bust: 92, waist: 72, hips: 98, armLength: 57, armHole: 46.5 },
  { size: "M", shoulder: 39, bust: 96, waist: 76, hips: 102, armLength: 58, armHole: 48 },
  { size: "L", shoulder: 40, bust: 100, waist: 80, hips: 106, armLength: 59, armHole: 49.5 },
  { size: "XL", shoulder: 41, bust: 104, waist: 84, hips: 110, armLength: 60, armHole: 51 },
];

export const MEASUREMENT_FIELDS: MeasurementField[] = [
  { key: "shoulder", label: "Panjang bahu (shoulder)", placeholder: "Contoh: 39 cm" },
  { key: "armLength", label: "Panjang tangan (arm length)", placeholder: "Contoh: 58 cm" },
  { key: "armHole", label: "Lingkar ketiak (armhole)", placeholder: "Contoh: 48 cm" },
  { key: "upperArm", label: "Lingkar lengan atas (upper arm)", placeholder: "Contoh: 28 cm" },
  { key: "wrist", label: "Lingkar pergelangan tangan (wrist)", placeholder: "Contoh: 16 cm" },
  { key: "bust", label: "Lingkar dada (bust)", placeholder: "Contoh: 96 cm" },
  { key: "waist", label: "Lingkar pinggang (waist)", placeholder: "Contoh: 76 cm" },
  { key: "hips", label: "Lingkar panggul (hips)", placeholder: "Contoh: 102 cm" },
  { key: "bodyLength", label: "Panjang badan (body length)", placeholder: "Contoh: 40 cm" },
  { key: "topLength", label: "Panjang baju (top / dress length)", placeholder: "Contoh: 135 cm" },
  { key: "neck", label: "Lingkar leher (neck)", placeholder: "Contoh: 36 cm" },
  { key: "backWidth", label: "Lebar punggung (back width)", placeholder: "Contoh: 38 cm" },
  { key: "upperBustWidth", label: "Lebar dada bagian atas (upper bust width)", placeholder: "Contoh: 34 cm" },
  { key: "upperBust", label: "Lingkar dada bagian atas (upper bust)", placeholder: "Contoh: 90 cm", optional: true },
  { key: "underbust", label: "Lingkar dada bagian bawah (underbust)", placeholder: "Contoh: 80 cm", optional: true },
];

const EMPTY_MEASUREMENTS: CustomMeasurements = {
  shoulder: "",
  armLength: "",
  armHole: "",
  upperArm: "",
  wrist: "",
  bust: "",
  waist: "",
  hips: "",
  bodyLength: "",
  topLength: "",
  neck: "",
  backWidth: "",
  upperBustWidth: "",
  upperBust: "",
  underbust: "",
};

function nearestSize(key: NumericMeasurementKey, value: number): ProductSize {
  let best = SIZE_CHART[0].size;
  let bestDiff = Infinity;
  for (const row of SIZE_CHART) {
    const diff = Math.abs(row[key] - value);
    const isTieFavoringLarger =
      diff === bestDiff && SIZE_ORDER.indexOf(row.size) > SIZE_ORDER.indexOf(best);
    if (diff < bestDiff || isTieFavoringLarger) {
      best = row.size;
      bestDiff = diff;
    }
  }
  return best;
}

export function recommendSize(values: Record<NumericMeasurementKey, string>): ProductSize | null {
  const votes = new Map<ProductSize, number>();
  for (const key of Object.keys(values) as NumericMeasurementKey[]) {
    const value = Number(values[key]);
    if (!Number.isFinite(value) || value <= 0) continue;
    const size = nearestSize(key, Number(value));
    votes.set(size, (votes.get(size) || 0) + 1);
  }
  if (votes.size === 0) return null;

  let best: ProductSize = SIZE_CHART[0].size;
  let bestCount = 0;
  for (const [size, count] of votes) {
    const isHigherCount = count > bestCount;
    const isTieFavoringLarger =
      count === bestCount &&
      SIZE_ORDER.indexOf(size) > SIZE_ORDER.indexOf(best);
    if (isHigherCount || isTieFavoringLarger) {
      best = size;
      bestCount = count;
    }
  }
  return best;
}

interface CustomSizeAccordionProps {
  productName: string;
  onSelectSize: (size: ProductSize) => void;
  onSizeChange?: (measurements: CustomMeasurements) => void;
}

export function CustomSizeAccordion({
  productName,
  onSelectSize,
  onSizeChange,
}: CustomSizeAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [measures, setMeasures] = useState<CustomMeasurements>(EMPTY_MEASUREMENTS);
  const [showRecommendation, setShowRecommendation] = useState(false);

  const recommended = recommendSize(measures);

  const handleInputChange = (key: MeasurementKey, value: string) => {
    setMeasures((prev) => {
      const next = { ...prev, [key]: value };
      onSizeChange?.(next);
      return next;
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-mist/40 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="custom-size-panel"
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="flex flex-col gap-1">
          <span className="font-body text-xs font-semibold uppercase tracking-wider text-charcoal">
            Custom Size &amp; Recommendation
          </span>
          <span className="font-body text-[11px] leading-snug text-charcoal/50">
            Masukkan ukuran tubuh atau dapatkan rekomendasi otomatis
          </span>
        </span>
        <span
          className={cn(
            "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border font-display text-sm font-semibold transition-all duration-300",
            isOpen
              ? "rotate-45 border-pastel-pink bg-pastel-pink text-charcoal"
              : "border-mist/60 text-charcoal/70"
          )}
        >
          +
        </span>
      </button>

      {isOpen && (
        <div id="custom-size-panel" className="border-t border-mist/30">
          <div className="flex flex-col gap-4 px-5 py-5">
            <p className="font-body text-[11px] leading-relaxed text-charcoal/50">
              {productName} — ukuran custom dijahit untukmu. Measurements tersimpan
              dan disertakan saat checkout.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {MEASUREMENT_FIELDS.map((field) => (
                <label key={field.key} className="flex flex-col gap-1.5">
                  <span className="font-body text-[10px] font-semibold uppercase tracking-wider text-charcoal/50">
                    {field.label}
                    {field.optional ? " (Opsional)" : ""}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    placeholder={field.placeholder}
                    value={measures[field.key]}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className="w-full rounded-xl border border-mist/60 bg-white p-2.5 font-body text-sm text-charcoal outline-none transition-colors placeholder:text-charcoal/30 focus:border-pastel-pink focus:ring-2 focus:ring-pastel-pink/20"
                  />
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowRecommendation(true)}
              className="w-full rounded-xl border border-pastel-pink/50 bg-pastel-pink/10 px-4 py-2.5 font-body text-[11px] font-semibold uppercase tracking-widest text-charcoal transition-all duration-300 hover:border-pastel-pink hover:bg-pastel-pink/20"
            >
              Cari Rekomendasi Ukuran
            </button>

            {showRecommendation && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-mist/40 bg-cream/60 px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-body text-[10px] font-semibold uppercase tracking-wider text-charcoal/50">
                    Rekomendasi ukuran untukmu
                  </span>
                  <span className="font-display text-lg font-semibold text-charcoal">
                    {recommended ? `Size ${recommended}` : "Lengkapi ukuran tubuh dulu"}
                  </span>
                </div>
                {recommended && (
                  <button
                    type="button"
                    onClick={() => onSelectSize(recommended)}
                    className="rounded-lg bg-pastel-peach px-3 py-2 font-body text-[10px] font-semibold uppercase tracking-widest text-charcoal transition-colors hover:bg-pastel-pink"
                  >
                    Pilih Size {recommended}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}