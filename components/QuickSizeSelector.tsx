"use client";

import { cn } from "@/lib/cn";
import type { ProductSize, ProductVariant } from "@/lib/product";


interface QuickSizeSelectorProps {
  variants: ProductVariant[];
  selectedSize: ProductSize | null;
  onSelect: (size: ProductSize) => void;
  /** compact = small pills for product card; default = larger pills for PDP */
  variant?: "compact" | "default";
}

const ALL_SIZES: ProductSize[] = ["S", "M", "L", "XL"];

export function QuickSizeSelector({
  variants,
  selectedSize,
  onSelect,
  variant = "compact",
}: QuickSizeSelectorProps) {
  const stockBySize = new Map(variants.map((v) => [v.size, v.stock]));

  return (
    <div
      className="flex items-center gap-1.5"
      role="group"
      aria-label="Select size"
    >
      {ALL_SIZES.map((size) => {
        const stock = stockBySize.get(size) ?? 0;
        const isAvailable = stock > 0;
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
              if (isAvailable) onSelect(size);
            }}
            className={cn(
              "flex items-center justify-center border font-body transition-colors duration-200",
              variant === "compact"
                ? "h-7 w-7 text-[11px]"
                : "h-11 w-11 text-sm",
              !isAvailable &&
                "cursor-not-allowed border-mist text-charcoal/25 line-through",
              isAvailable &&
                !isSelected &&
                "border-charcoal/30 text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-cream",
              isAvailable &&
                isSelected &&
                "border-charcoal bg-charcoal text-cream"
            )}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}
