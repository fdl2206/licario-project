"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { QuickSizeSelector } from "./QuickSizeSelector";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/lib/formatCurrency";
import type { ProductCardData, ProductSize } from "@/lib/product";



interface ProductCardProps {
  product: ProductCardData;
}

const EASE_LUXE = [0.22, 1, 0.36, 1] as const;

export function ProductCard({ product }: ProductCardProps) {
  const [isActive, setIsActive] = useState(false); // hover (desktop) or focus (keyboard)
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const primaryImage = product.images[0];
  const secondaryImage = product.images[1];
  const isOnSale =
    product.compareAtPrice !== null && product.compareAtPrice > product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedSize) return;

    const variant = product.variants.find((v) => v.size === selectedSize);
    if (!variant) return;

    addItem({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      size: selectedSize,
      image: primaryImage?.url ?? "",
    });

    toast.success(`${product.name} added to bag`, {
      description: `Size ${selectedSize} · ${formatCurrency(product.price)}`,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };


  return (
    <div
      className="group relative flex flex-col"
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onFocus={() => setIsActive(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsActive(false);
        }
      }}
    >
      {/* Image — clicking anywhere here goes to the PDP */}
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[3/4] w-full overflow-hidden bg-white"
        aria-label={`View ${product.name}`}
      >
        {primaryImage && (
          <Image
            src={primaryImage.url}
            alt={primaryImage.altText ?? product.name}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
            className={`object-cover transition-opacity duration-700 ease-luxe ${
              secondaryImage && isActive ? "opacity-0" : "opacity-100"
            }`}
            priority={false}
          />
        )}
        {secondaryImage && (
          <Image
            src={secondaryImage.url}
            alt={secondaryImage.altText ?? product.name}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
            className={`object-cover transition-opacity duration-700 ease-luxe ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {isOnSale && (
          <span className="absolute left-3 top-3 bg-navy px-2.5 py-1 text-[10px] uppercase tracking-luxe text-cream">
            Sale
          </span>
        )}

        {/* Hover / focus reveal panel — quick size select + add to cart.
            Lives inside the Link visually, but every control inside stops
            propagation so it never triggers navigation. */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE_LUXE }}
              className="absolute inset-x-0 bottom-0 hidden flex-col gap-2.5 bg-white/95 p-3 backdrop-blur-sm sm:flex"
            >
              <QuickSizeSelector
                variants={product.variants}
                selectedSize={selectedSize}
                onSelect={setSelectedSize}
                variant="compact"
              />

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className="flex h-9 w-full items-center justify-center bg-charcoal text-[11px] uppercase tracking-wide text-cream transition-colors duration-200 hover:bg-navy disabled:cursor-not-allowed disabled:bg-charcoal/30"
              >
                {justAdded ? "Added" : selectedSize ? "Add to Cart" : "Select a size"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Persistent info — always visible below the image */}
      <div className="mt-3 flex flex-col gap-1">
        <Link href={`/product/${product.slug}`} className="w-fit">
          <h3 className="font-display text-base text-charcoal transition-colors duration-200 group-hover:text-navy">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="font-body text-sm text-charcoal">
            {formatCurrency(product.price)}
          </span>
          {isOnSale && product.compareAtPrice && (
            <span className="font-body text-xs text-charcoal/40 line-through">
              {formatCurrency(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>

      {/* Mobile fallback — hover states don't exist on touch, so the size
          selector sits persistently below the price instead of on-image. */}
      <div className="mt-2.5 flex flex-col gap-2 sm:hidden">
        <QuickSizeSelector
          variants={product.variants}
          selectedSize={selectedSize}
          onSelect={setSelectedSize}
          variant="compact"
        />
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!selectedSize}
          className="flex h-9 w-full items-center justify-center border border-charcoal text-[11px] uppercase tracking-wide text-charcoal transition-colors duration-200 disabled:cursor-not-allowed disabled:border-charcoal/30 disabled:text-charcoal/30"
        >
          {justAdded ? "Added" : selectedSize ? "Add to Cart" : "Select a size"}
        </button>
      </div>
    </div>
  );
}
