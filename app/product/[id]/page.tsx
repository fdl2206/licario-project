"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import { useCartStore } from "@/store/useCartStore";
import { CustomSizeAccordion, type CustomMeasurements } from "@/components/CustomSizeAccordion";
import { QuickSizeSelector } from "@/components/QuickSizeSelector";
import { SizeGuideTable } from "@/components/SizeGuideTable";
import { SIZE_GUIDES } from "@/lib/sizeGuide";
import { isPreorderSize, type ProductCardData, type ProductSize, type ProductVariant, type ProductImage } from "@/lib/product";

const PLACEHOLDER_IMAGE = "/licario-placeholder.svg";

interface ApiProductData {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  images: ProductImage[] | null;
  sizes: string[] | null;
  variants: ProductVariant[] | null;
  image_gallery: string[] | null;
  color: string | null;
  material: string | null;
  details: string | null;
  care_instructions: string | null;
  is_sold_out?: boolean;
  is_preorder?: boolean;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const addItem = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState<ProductCardData | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [customMeasurements, setCustomMeasurements] = useState<CustomMeasurements | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeGuideId, setActiveGuideId] = useState(SIZE_GUIDES[0].id);
  const activeGuide =
    SIZE_GUIDES.find((guide) => guide.id === activeGuideId) ?? SIZE_GUIDES[0];
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  // Tutup modal size guide dengan tombol Escape.
  useEffect(() => {
    if (!showSizeGuide) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSizeGuide(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showSizeGuide]);

  const scrollThumbnails = (direction: "left" | "right") => {
    const container = thumbnailsRef.current;
    if (!container) return;
    const child = container.querySelector<HTMLElement>(":scope > button");
    const itemWidth = child?.getBoundingClientRect().width ?? 80;
    const gap = 12;
    const amount = itemWidth + gap;
    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;

      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Product not found");
          } else {
            throw new Error("Failed to load product details");
          }
          return;
        }
        const data = (await response.json()) as ApiProductData;

        if (data) {
          const mappedProduct: ProductCardData = {
            id: Number(data.id || 0),
            name: data.name || "",
            slug: data.slug || "",
            description: data.description || "",
            price: data.price || 0,
            compareAtPrice: data.compare_at_price || null,
            imageUrl: data.image_url || null,
            images: data.images || [],
            sizes: data.sizes || [],
            variants: data.variants || [],
            imageGallery: data.image_gallery || null,
            color: data.color || undefined,
            material: data.material || undefined,
            details: data.details || undefined,
            care_instructions: data.care_instructions || undefined,
            is_sold_out: data.is_sold_out === true,
            is_preorder: data.is_preorder === true,
          };
          setProduct(mappedProduct);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Unable to load product details");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-pastel-pink border-t-transparent" />
          <span className="font-body text-sm text-charcoal/40 animate-pulse">
            Fetching product details...
          </span>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-cream px-6 text-center">
        <span className="eyebrow text-pastel-pink font-semibold">Error</span>
        <h1 className="text-display-md font-medium text-charcoal">
          {error || "Product not found"}
        </h1>
        <p className="max-w-sm font-body text-sm leading-relaxed text-charcoal/60">
          The product you&apos;re looking for might have been moved or is no longer available.
        </p>
        <Link
          href="/shop"
          className="mt-4 inline-flex h-12 items-center justify-center rounded-xl bg-pastel-peach px-10 font-body text-xs font-semibold uppercase tracking-wide text-charcoal shadow-sm transition-all duration-300 ease-luxe hover:bg-pastel-pink hover:scale-105"
        >
          Return to Shop
        </Link>
      </main>
    );
  }

  const galleryImages =
    product?.imageGallery && product.imageGallery.length > 0
      ? product.imageGallery
      : product?.imageUrl
        ? [product.imageUrl]
        : [PLACEHOLDER_IMAGE];

  const displayImage = galleryImages[activeImageIndex] || PLACEHOLDER_IMAGE;
  const isSoldOut = product.is_sold_out === true;
  const isPreorder = product.is_preorder === true;
  const isUnavailable = isSoldOut && !isPreorder;

  // Sizes outside the product's in-stock `sizes` list are made to order.
  const isPreorderSelection =
    !!selectedSize && (isPreorder || isPreorderSize(product.sizes, selectedSize));

  const handleAddToBag = () => {
    if (!product || !selectedSize || isUnavailable) return;

    const hasCustom =
      !!customMeasurements &&
      Object.values(customMeasurements).some((v) => v.trim() !== "");

    // Synthetic variantId for consistency with catalog behavior
    const baseVariantId =
      product.variants?.find((v) => v.size === selectedSize)?.id ||
      `${product.id}-${selectedSize}`;

    const variantId = hasCustom
      ? `${baseVariantId}-custom-${Date.now()}`
      : baseVariantId;

    const asPreorder =
      isPreorder || isPreorderSize(product.sizes, selectedSize);

    addItem({
      productId: product.id,
      variantId,
      name: product.name,
      slug: product.slug,
      price: product.price,
      size: selectedSize,
      image: displayImage,
      customMeasurements: hasCustom ? customMeasurements : undefined,
      isPreorder: asPreorder,
    });

    const sizeLabel = customMeasurements
      ? `${selectedSize} (Custom Tailored)`
      : selectedSize;

    if (asPreorder) {
      toast.info(`${product.name} added as pre-order`, {
        description: `Size ${sizeLabel} · dibuat setelah pesanan masuk · ${formatCurrency(product.price)}`,
      });
    } else {
      toast.success(`${product.name} added to bag`, {
        description: hasCustom
          ? `Custom Tailored · Size ${sizeLabel} · ${formatCurrency(product.price)}`
          : `Size ${selectedSize} · ${formatCurrency(product.price)}`,
      });
    }
  };

  return (
    <main className="flex flex-1 bg-cream pb-32 md:pb-48">
      <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-8 sm:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">

          {/* Kolom Kiri — Images */}
          <div className="flex flex-col gap-4 w-full">
            {/* Main Image Viewport */}
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-3xl bg-white shadow-card border border-mist/20">
              <Image
                src={displayImage}
                alt={product.name}
                fill
                priority
                className="object-cover object-top transition-transform duration-1000 ease-luxe hover:scale-105"
                sizes="(min-width: 1024px) 50vw, 100vw"
                unoptimized
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                }}
              />

              {isPreorder ? (
                <span className="absolute right-4 top-4 z-10 rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow-lg ring-1 ring-white/30">
                  PRE-ORDER
                </span>
              ) : isUnavailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                  <span className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow-lg ring-1 ring-white/30">
                    SOLD OUT
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="group relative">
                <div
                  ref={thumbnailsRef}
                  className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
                >
                  {galleryImages.map((imgUrl, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative aspect-[3/4] w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 snap-start ${
                        activeImageIndex === index
                          ? "border-pastel-pink ring-2 ring-pastel-pink/20 scale-95"
                          : "border-mist/20 hover:border-pastel-pink/50"
                      }`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`${product.name} gallery image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                        }}
                      />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => scrollThumbnails("left")}
                  aria-label="Previous images"
                  className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-md transition-all duration-300 hover:bg-white hover:text-charcoal opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollThumbnails("right")}
                  aria-label="Next images"
                  className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-md transition-all duration-300 hover:bg-white hover:text-charcoal opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Kolom Kanan — Details */}
          <div className="flex flex-col justify-center gap-8 py-4 self-start">
            <div className="flex flex-col gap-4">
              <span className="eyebrow text-pastel-pink font-semibold">
                Licario Premium
              </span>
              <h1 className="text-display-lg font-medium text-charcoal leading-tight">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-4">
                <span className="font-display text-2xl font-semibold text-charcoal">
                  {formatCurrency(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="font-body text-lg text-charcoal/30 line-through decoration-pastel-pink">
                    {formatCurrency(product.compareAtPrice)}
                  </span>
                )}
              </div>
            </div>

            <div className="rule-olive w-full opacity-30" />

            {/* Deskripsi Produk — tepat di bawah harga */}
            <div className="flex flex-col gap-3">
              <p className="font-body text-base leading-relaxed text-charcoal/70 whitespace-pre-wrap">
                {product.description ||
                  "A carefully considered silhouette built from honest materials and Indonesian craftsmanship. Designed to be lived in, not simply worn."}
              </p>
            </div>

            <div className="flex flex-col gap-6 pt-4">
              {/* Size Standar (S, M, L, XL) */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs font-semibold uppercase tracking-wider text-charcoal/60">
                    Select Size
                  </span>
                </div>
                <QuickSizeSelector
                  availableSizes={product.sizes}
                  selectedSize={selectedSize}
                  onSelect={(size) => setSelectedSize(size)}
                  variant="default"
                />
                <p className="mt-1 font-body text-[10px] leading-relaxed text-charcoal/50">
                  Size dengan garis putus-putus belum tersedia di stok — bisa dipesan
                  sebagai <span className="font-semibold text-charcoal/70">pre-order</span>{" "}
                  (dibuat setelah pesanan masuk).
                </p>
              </div>

              {/* Custom Size */}
              <div className="flex flex-col gap-3 border-t border-mist/40 pt-4">
                <span className="font-body text-xs font-semibold uppercase tracking-wider text-charcoal/60">
                  Custom Size
                </span>
                <CustomSizeAccordion
                  productName={product.name}
                  onSelectSize={(size) => setSelectedSize(size)}
                  onSizeChange={setCustomMeasurements}
                />
              </div>

              {/* Size Guide */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(true)}
                  className="rounded-lg bg-pastel-peach/70 px-3 py-2 font-body text-[10px] font-semibold uppercase tracking-widest text-charcoal transition-colors hover:bg-pastel-pink cursor-pointer"
                >
                  Size Guide
                </button>
              </div>

              {/* CTA Button */}
              <button
                type="button"
                onClick={handleAddToBag}
                disabled={!selectedSize || isUnavailable}
                aria-disabled={!selectedSize || isUnavailable}
                className={`mt-2 flex h-14 w-full items-center justify-center rounded-2xl px-8 font-body text-sm font-semibold uppercase tracking-widest shadow-md transition-all duration-300 ease-luxe disabled:cursor-not-allowed disabled:opacity-50 ${
                  isUnavailable
                    ? "bg-charcoal/10 text-charcoal/40"
                    : "bg-pastel-peach text-charcoal hover:bg-pastel-pink hover:scale-[1.02]"
                }`}
              >
                {isUnavailable
                  ? "Sold Out"
                  : selectedSize
                    ? isPreorderSelection
                      ? "Pre-Order Now"
                      : "Add to Cart"
                    : "Select a size"}
              </button>
            </div>

            {/* Details Produk (Dinamis dari Supabase) */}
            <ul className="mt-8 flex flex-col gap-3 font-body text-sm text-charcoal/80">
              {product.color && (
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[70px]">Color</span>
                  <span>: {product.color}</span>
                </li>
              )}
              {product.material && (
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[70px]">Material</span>
                  <span>: {product.material}</span>
                </li>
              )}
              {product.details && (
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[70px]">Details</span>
                  <span>: {product.details}</span>
                </li>
              )}
              {product.care_instructions && (
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[70px]">Care</span>
                  <span>: {product.care_instructions}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Modal Size Guide - memakai tabel yang sama dengan halaman /size-guide */}
      {showSizeGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Licario Size Guide"
          onClick={() => setShowSizeGuide(false)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-mist/20 bg-cream/40 px-5 py-4 sm:px-8">
              <div>
                <span className="eyebrow text-pastel-pink font-semibold">Sizing &amp; Measurements</span>
                <h2 className="mt-1 font-display text-lg font-medium text-charcoal">Size Guide</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSizeGuide(false)}
                aria-label="Close size guide"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-charcoal shadow-sm ring-1 ring-black/10 transition-colors hover:bg-pastel-pink cursor-pointer"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-mist/20 px-5 py-3 sm:px-8">
              {SIZE_GUIDES.map((guide) => {
                const isActive = guide.id === activeGuideId;
                return (
                  <button
                    key={guide.id}
                    type="button"
                    onClick={() => setActiveGuideId(guide.id)}
                    aria-pressed={isActive}
                    className={`rounded-xl border px-3.5 py-2 text-left transition-all duration-300 ease-luxe cursor-pointer ${
                      isActive
                        ? "border-pastel-blue bg-white shadow-card"
                        : "border-mist/40 bg-transparent hover:bg-white/60"
                    }`}
                  >
                    <span
                      className={`block font-body text-[10px] font-semibold uppercase tracking-luxe ${
                        isActive ? "text-pastel-pink" : "text-charcoal/50"
                      }`}
                    >
                      {guide.label}
                    </span>
                    <span className="block font-display text-xs font-medium text-charcoal sm:text-sm">
                      {guide.title}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="overflow-y-auto p-4 sm:p-6">
              <SizeGuideTable
                title={activeGuide.tableTitle}
                caption={activeGuide.caption}
                rows={activeGuide.rows}
              />
            </div>

            <div className="flex justify-end border-t border-mist/20 px-5 py-3 sm:px-8">
              <Link
                href="/size-guide"
                onClick={() => setShowSizeGuide(false)}
                className="font-body text-[11px] font-semibold uppercase tracking-widest text-charcoal/70 underline underline-offset-4 transition-colors hover:text-charcoal"
              >
                View full size guide
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}