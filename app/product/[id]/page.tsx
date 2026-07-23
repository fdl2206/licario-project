"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/formatCurrency";
import { useCartStore } from "@/store/useCartStore";
import { QuickSizeSelector } from "@/components/QuickSizeSelector";
import type { ProductCardData, ProductSize } from "@/lib/product";

export default function ProductDetailPage() {
  const { id } = useParams();
  const addItem = useCartStore((state) => state.addItem);
  
  const [product, setProduct] = useState<ProductCardData | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (data) {
          const mappedProduct: ProductCardData = {
            id: Number(data.id),
            name: data.name,
            slug: data.slug,
            description: data.description,
            price: data.price,
            compareAtPrice: data.compare_at_price,
            imageUrl: data.image_url,
            images: data.images || [],
            sizes: data.sizes || [],
            variants: data.variants || [],
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
          The product you're looking for might have been moved or is no longer available.
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

  const displayImage = product.imageUrl || "/file.svg";

  const handleAddToBag = () => {
    if (!product || !selectedSize) return;

    // Synthetic variantId for consistency with catalog behavior
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
  };

  return (
    <main className="flex flex-1 flex-col bg-cream">
      <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
          
          {/* Kolom Kiri — Image */}
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-white shadow-card border border-mist/20">
            <Image
              src={displayImage}
              alt={product.name}
              fill
              priority
              className="object-cover transition-transform duration-1000 ease-luxe hover:scale-105"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>

          {/* Kolom Kanan — Details */}
          <div className="flex flex-col justify-center gap-8 py-4">
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

            <div className="flex flex-col gap-3">
              <p className="font-body text-base leading-relaxed text-charcoal/70">
                {product.description || "A carefully considered silhouette built from honest materials and Indonesian craftsmanship. Designed to be lived in, not simply worn."}
              </p>
            </div>

            <div className="flex flex-col gap-6 pt-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs font-semibold uppercase tracking-wider text-charcoal/60">
                    Select Size
                  </span>
                  <button className="text-[10px] uppercase tracking-widest text-pastel-pink underline underline-offset-4 hover:text-charcoal transition-colors">
                    Size Guide
                  </button>
                </div>
                <QuickSizeSelector
                  availableSizes={product.sizes}
                  selectedSize={selectedSize}
                  onSelect={(size) => setSelectedSize(size)}
                  variant="default"
                />
              </div>

              <button
                type="button"
                onClick={handleAddToBag}
                disabled={!selectedSize}
                className="mt-4 flex h-14 w-full items-center justify-center rounded-2xl bg-pastel-peach px-8 font-body text-sm font-semibold uppercase tracking-widest text-charcoal shadow-md transition-all duration-300 ease-luxe hover:bg-pastel-pink hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {selectedSize ? "Add to Bag" : "Select a size"}
              </button>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-success" />
                <span className="font-body text-[11px] uppercase tracking-wide text-charcoal/50">
                  Ethically crafted in Indonesia
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-success" />
                <span className="font-body text-[11px] uppercase tracking-wide text-charcoal/50">
                  Natural, long-lasting fibers
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
