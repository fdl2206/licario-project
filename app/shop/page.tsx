"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { PromoBannerStrip } from "@/components/PromoBannerStrip";
import type { ProductCardData } from "@/lib/product";

interface ProductRow {
  id: number | string;
  name: string;
  slug: string;
  description: string | null;
  price: number | string;
  compare_at_price: number | string | null;
  image_url: string | null;
  images?: unknown;
  sizes?: unknown;
  variants?: unknown;
  is_sold_out?: boolean;
}

function ShopContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = (await response.json()) as ProductRow[];

        if (Array.isArray(data)) {
          let mappedProducts: ProductCardData[] = data.map((p: ProductRow) => ({
            id: Number(p.id),
            name: p.name,
            slug: p.slug,
            description: p.description,
            price: Number(p.price),
            compareAtPrice: p.compare_at_price != null ? Number(p.compare_at_price) : null,
            imageUrl: p.image_url,
            images: Array.isArray(p.images) ? p.images : [],
            sizes: Array.isArray(p.sizes) ? p.sizes.map(String) : [],
            variants: Array.isArray(p.variants) ? p.variants : [],
            is_sold_out: p.is_sold_out ?? false,
          }));

          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            mappedProducts = mappedProducts.filter(
              (p) =>
                (p.name || "").toLowerCase().includes(q) ||
                (p.description && p.description.toLowerCase().includes(q))
            );
          }

          mappedProducts.sort((a, b) => Number(a.is_sold_out) - Number(b.is_sold_out));

          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [searchQuery]);

  return (
    <>
      <PromoBannerStrip />

      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="mb-12 flex flex-col items-center gap-3 text-center sm:mb-20">
          <span className="eyebrow text-pastel-pink font-semibold">The Full Catalogue</span>
          <h1 className="text-display-lg font-medium text-charcoal">
            {searchQuery ? `Search: "${searchQuery}"` : "Shop All"}
          </h1>
          <p className="mt-2 max-w-md font-body text-sm leading-relaxed text-charcoal/60">
            {searchQuery
              ? "Showing results matching your search criteria."
              : "Every Licario piece, in one place — considered silhouettes built to be worn for years, not seasons."}
          </p>
          <div className="rule-olive mt-6 w-16" />
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <span className="font-body text-sm text-charcoal/40 animate-pulse">Opening the vault...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <p className="font-body text-base text-charcoal/70">No products found matching your search.</p>
            <a href="/shop" className="mt-4 text-xs font-semibold uppercase tracking-widest text-pastel-pink underline">
              View all products
            </a>
          </div>
        ) : (
          <div className="grid w-full grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function ShopPage() {
  return (
    <main className="flex-1 bg-cream pb-32 md:pb-48">
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <span className="font-body text-sm text-charcoal/40 animate-pulse">Loading catalogue...</span>
          </div>
        }
      >
        <ShopContent />
      </Suspense>
    </main>
  );
}