"use client";

import { cn } from "@/lib/cn";
import { ALL_PRODUCT_SIZES, isPreorderSize, type ProductSize } from "@/lib/product";


interface QuickSizeSelectorProps {
  availableSizes: string[];
  selectedSize: ProductSize | null;
  onSelect: (size: ProductSize) => void;
  /** compact = small pills for product card; default = larger pills for PDP */
  variant?: "compact" | "default";
}

export function QuickSizeSelector({
  availableSizes,
  selectedSize,
  onSelect,
  variant = "compact",
}: QuickSizeSelectorProps) {
  const sizes = ALL_PRODUCT_SIZES;

  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      role="group"
      aria-label="Select size"
    >
      {sizes.map((size) => {
        const isSelected = selectedSize === size;
        // Not in the product's `sizes` list = made to order, but still orderable.
        const isPreorder = isPreorderSize(availableSizes, size);

        return (
          <button
            key={size}
            type="button"
            aria-pressed={isSelected}
            aria-label={`Size ${size}${isPreorder ? " — pre-order" : ""}`}
            title={isPreorder ? `${size} — Pre-Order (made to order)` : `Size ${size}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(size);
            }}
            className={cn(
              "relative flex items-center justify-center border font-body rounded-full transition-all duration-300",
              variant === "compact"
                ? "h-7 w-7 text-[11px]"
                : "h-11 w-11 text-sm",
              isPreorder &&
                !isSelected &&
                "border-dashed border-charcoal/30 bg-white/60 text-charcoal/60 hover:border-pastel-pink hover:bg-pastel-pink/30 hover:text-charcoal hover:scale-105",
              !isPreorder &&
                !isSelected &&
                "border-mist bg-white text-charcoal hover:border-pastel-pink hover:bg-pastel-pink/30 hover:scale-105",
              isSelected &&
                "border-pastel-pink bg-pastel-pink text-charcoal font-semibold shadow-sm scale-105"
            )}
          >
            {size}
            {isPreorder && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute rounded-full bg-pastel-purple",
                  variant === "compact" ? "-right-0.5 -top-0.5 h-1.5 w-1.5" : "-right-0.5 -top-0.5 h-2 w-2"
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
