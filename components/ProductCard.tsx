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

  const displayImage = product.imageUrl || "/file.svg"; // Fallback to a placeholder
  const isSoldOut = Boolean(product.is_sold_out);
  const isOnSale =
    !isSoldOut && product.compareAtPrice !== null && product.compareAtPrice > product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedSize) return;

    // Since we now use a simple 'sizes' array from Supabase, 
    // we use a synthetic variantId if real variants aren't provided.
    const variantId = product.variants?.find((v) => v.size === selectedSize)?.id 
      || `${product.id}-${selectedSize}`;

    addItem({
      productId: product.id,
      variantId: variantId,
      name: product.name,
      slug: product.slug,
      price: product.price,
      size: selectedSize,
      image: displayImage,
    });

    toast.success(`${product.name} added to bag`, {
      description: `Size ${selectedSize} · ${formatCurrency(product.price)}`,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };


  return (
    <div
      className="group relative flex flex-col rounded-3xl bg-white/70 p-4 border border-mist/20 shadow-card hover:shadow-card-hover transition-all duration-500 ease-luxe"
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
        href={`/product/${product.id}`}
        className="relative block aspect-[3/4] w-full overflow-hidden rounded-2xl bg-white"
        aria-label={`View ${product.name}`}
      >
        <Image
          src={displayImage}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
          className={`object-cover transition-transform duration-700 ease-luxe group-hover:scale-105 ${isSoldOut ? "opacity-70 grayscale-[30%]" : ""}`}
          priority={false}
        />

        {isSoldOut ? (
          <div className="absolute inset-0 flex items-center justify-center bg-charcoal/30 backdrop-blur-[2px]">
            <span className="rounded-full border border-white/60 bg-charcoal/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white shadow-lg">
              SOLD OUT
            </span>
          </div>
        ) : isOnSale && (
          <span className="absolute left-4 top-4 bg-pastel-pink px-3 py-1 text-[10px] font-semibold uppercase tracking-luxe text-charcoal rounded-full shadow-sm">
            Sale
          </span>
        )}

        {/* Hover / focus reveal panel — quick size select + add to cart.
            Lives inside the Link visually, but every control inside stops
            propagation so it never triggers navigation. */}
        <AnimatePresence>
          {isActive && !isSoldOut && (
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE_LUXE }}
              className="absolute inset-x-2 bottom-2 hidden flex-col gap-3 bg-white/95 p-4 rounded-xl shadow-lg backdrop-blur-sm sm:flex"
            >
              <QuickSizeSelector
                availableSizes={product.sizes}
                selectedSize={selectedSize}
                onSelect={setSelectedSize}
                variant="compact"
              />

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className="flex h-10 w-full items-center justify-center rounded-lg bg-pastel-peach text-[11px] font-semibold uppercase tracking-wide text-charcoal shadow-sm transition-all duration-300 ease-luxe hover:bg-pastel-pink disabled:cursor-not-allowed disabled:bg-pastel-peach/30 disabled:text-charcoal/40"
              >
                {justAdded ? "Added" : selectedSize ? "Add to Cart" : "Select a size"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Persistent info — always visible below the image */}
      <div className="mt-4 flex flex-col gap-1 px-1">
        <Link href={`/product/${product.id}`} className="w-fit">
          <h3 className="font-display text-base font-medium text-charcoal transition-colors duration-200 hover:text-pastel-pink">
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
      {!isSoldOut ? (
        <div className="mt-3.5 flex flex-col gap-2 px-1 sm:hidden">
          <QuickSizeSelector
            availableSizes={product.sizes}
            selectedSize={selectedSize}
            onSelect={setSelectedSize}
            variant="compact"
          />
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!selectedSize}
            className="flex h-10 w-full items-center justify-center rounded-lg bg-pastel-peach text-[11px] font-semibold uppercase tracking-wide text-charcoal shadow-sm transition-all duration-300 ease-luxe hover:bg-pastel-pink disabled:cursor-not-allowed disabled:bg-pastel-peach/30 disabled:text-charcoal/40"
          >
            {justAdded ? "Added" : selectedSize ? "Add to Cart" : "Select a size"}
          </button>
        </div>
      ) : (
        <div className="mt-3.5 flex items-center justify-center rounded-lg bg-mist/20 py-2 sm:hidden">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal/50">
            Sold Out
          </span>
        </div>
      )}
    </div>
  );
}
