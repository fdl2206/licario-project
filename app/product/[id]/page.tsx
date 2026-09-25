"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/formatCurrency";
import { useCartStore } from "@/store/useCartStore";
import { CustomSizeAccordion, type CustomMeasurements } from "@/components/CustomSizeAccordion";
import type { ProductCardData, ProductSize, ProductVariant, ProductImage } from "@/lib/product";

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

  const galleryImages = product?.imageGallery && product.imageGallery.length > 0
    ? product.imageGallery
    : (product?.imageUrl ? [product.imageUrl] : ["/file.svg"]);

  const displayImage = galleryImages[activeImageIndex] || "/file.svg";

  const handleAddToBag = () => {
    if (!product || !selectedSize) return;

    const hasCustom =
      !!customMeasurements &&
      Object.values(customMeasurements).some((v) => v.trim() !== "");

    // Synthetic variantId for consistency with catalog behavior
    const baseVariantId = product.variants?.find((v) => v.size === selectedSize)?.id
      || `${product.id}-${selectedSize}`;

    const variantId = hasCustom
      ? `${baseVariantId}-custom-${Date.now()}`
      : baseVariantId;

    addItem({
      productId: product.id,
      variantId,
      name: product.name,
      slug: product.slug,
      price: product.price,
      size: selectedSize,
      image: displayImage,
      customMeasurements: hasCustom ? customMeasurements : undefined,
    });

    const measurementDetails = Object.entries(customMeasurements || {})
      .filter(([_, v]) => v && v.trim() !== "")
      .map(([label, value]) => `• ${label}: ${value} cm`)
      .join("\n");

    const sizeLabel = customMeasurements ? `${selectedSize} (Custom Tailored)` : selectedSize;

    toast.success(`${product.name} added to bag`, {
      description: hasCustom
        ? `Custom Tailored · Size ${sizeLabel} · ${formatCurrency(product.price)}`
        : `Size ${selectedSize} · ${formatCurrency(product.price)}`,
    });
  };

  return (
    <main className="flex flex-1 bg-cream pb-32 md:pb-48">
      <Suspense fallback={
        <div className="flex h-64 items-center justify-center">
          <span className="font-body text-sm text-charcoal/40 animate-pulse">Loading catalogue...</span>
        </div>
      }>
        <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-8 sm:py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
            
            {/* Kolom Kiri — Images */}
            <div className="flex flex-col gap-4 w-full">
              {/* Main Image Viewport */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-white shadow-card border border-mist/20">
                <Image
                  src={displayImage}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover object-top transition-transform duration-1000 ease-luxe hover:scale-105"
                  unoptimized
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/file.svg";
                  }}
                />
              </div>

              {/* Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
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
                          (e.target as HTMLImageElement).src = "/file.svg";
                        }}
                      />
                    </button>
                  ))}
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

              <div className="flex flex-col gap-6 pt-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-xs font-semibold uppercase tracking-wider text-charcoal/60">
                      Select Size
                    </span>
                  </div>
                  <CustomSizeAccordion
                    productName={product.name}
                    onSelectSize={(size) => setSelectedSize(size)}
                    onSizeChange={setCustomMeasurements}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(true)}
                    className="rounded-lg bg-pastel-peach/70 px-3 py-2 font-body text-[10px] font-semibold uppercase tracking-widest text-charcoal transition-colors hover:bg-pastel-pink cursor-pointer"
                  >
                    Size Guide
                  </button>
                </div>

                <div className="mt-6">
                  {showSizeGuide ? (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                      <Image
                        src="/size-guide.jpg"
                        alt="Size Guide Licario"
                        fill
                        unoptimized
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/size-guide.pdf";
                        }}
                      />
                      <button
                        onClick={() => setShowSizeGuide(false)}
                        className="absolute top-6 right-6 rounded-lg bg-white p-2 hover:bg-mist/50 transition-colors"
                        aria-label="Close size guide"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

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
      </Suspense>
    </main>
  );
}