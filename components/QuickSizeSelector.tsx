"use client";

import { cn } from "@/lib/cn";
import type { ProductSize } from "@/lib/product";


interface QuickSizeSelectorProps {
  availableSizes: string[];
  selectedSize: ProductSize | null;
  onSelect: (size: ProductSize) => void;
  /** compact = small pills for product card; default = larger pills for PDP */
  variant?: "compact" | "default";
}

const ALL_SIZES: ProductSize[] = ["S", "M", "L", "XL"];

export function QuickSizeSelector({
  availableSizes,
  selectedSize,
  onSelect,
  variant = "compact",
}: QuickSizeSelectorProps) {
  return (
    <div
      className="flex items-center gap-1.5"
      role="group"
      aria-label="Select size"
    >
      {ALL_SIZES.map((size) => {
        const isAvailable = availableSizes.includes(size);
        const isSelected = selectedSize === size;

        return (
          <button
            key={size}
            type="button"
            disabled={!isAvailable}
            aria-pressed={isSelected}
            aria-label={`Size ${size}${!isAvailable ? " — out of stock" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isAvailable) onSelect(size as ProductSize);
            }}
            className={cn(
              "flex items-center justify-center border font-body rounded-full transition-all duration-300",
              variant === "compact"
                ? "h-7 w-7 text-[11px]"
                : "h-11 w-11 text-sm",
              !isAvailable &&
                "cursor-not-allowed border-mist/50 bg-mist/25 text-charcoal/20 line-through",
              isAvailable &&
                !isSelected &&
                "border-mist bg-white text-charcoal hover:border-pastel-pink hover:bg-pastel-pink/30 hover:scale-105",
              isAvailable &&
                isSelected &&
                "border-pastel-pink bg-pastel-pink text-charcoal font-semibold shadow-sm scale-105"
            )}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}
