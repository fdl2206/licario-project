"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";
import type { ProductCardData } from "@/lib/product";

export default function ShopPage() {
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*");

        if (error) throw error;
        if (data) {
          const mappedProducts: ProductCardData[] = data.map((p: any) => ({
            id: Number(p.id),
            name: p.name,
            slug: p.slug,
            description: p.description,
            price: p.price,
            compareAtPrice: p.compare_at_price,
            imageUrl: p.image_url,
            images: p.images || [],
            sizes: p.sizes || [],
            variants: p.variants || [],
          }));
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error("Error fetching shop products:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <main className="flex flex-1 flex-col bg-cream">
      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="mb-12 flex flex-col items-center gap-3 text-center sm:mb-20">
          <span className="eyebrow text-pastel-pink font-semibold">The Full Catalogue</span>
          <h1 className="text-display-lg font-medium text-charcoal">Shop All</h1>
          <p className="mt-2 max-w-md font-body text-sm leading-relaxed text-charcoal/60">
            Every Licario piece, in one place — considered silhouettes built
            to be worn for years, not seasons.
          </p>
          <div className="rule-olive mt-6 w-16" />
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <span className="font-body text-sm text-charcoal/40 animate-pulse">Opening the vault...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
