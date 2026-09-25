"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

interface PaginatedResponse {
  products: ProductRow[];
  total: number;
  page: number;
  pageSize: number;
}

const PAGE_SIZE = 12;

function getPageNumbers(current: number, total: number): number[] {
  const start = Math.max(1, Math.min(current - 2, total - 4));
  const end = Math.min(total, start + 4);
  const pages: number[] = [];
  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }
  return pages;
}

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get("search") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
        if (searchQuery) params.set("search", searchQuery);

        const response = await fetch(`/api/products?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = (await response.json()) as PaginatedResponse;

        if (cancelled) return;

        if (Array.isArray(data.products)) {
          const mappedProducts: ProductCardData[] = data.products.map((p: ProductRow) => ({
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

          mappedProducts.sort((a, b) => Number(a.is_sold_out) - Number(b.is_sold_out));

          setProducts(mappedProducts);
          setTotalPages(Math.max(1, Math.ceil((data.total || 0) / PAGE_SIZE)));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [page, searchQuery]);

  const pageNumbers = getPageNumbers(page, totalPages);

  function goToPage(next: number) {
    if (next < 1 || next > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(next));
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  }

  return (
    <>
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

        <PromoBannerStrip />

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

        {!isLoading && products.length > 0 && totalPages > 1 && (
          <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Pagination">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="rounded-full border border-mist bg-white px-4 py-2 font-body text-xs font-medium uppercase tracking-widest text-charcoal transition hover:border-charcoal/30 hover:bg-mist/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            {pageNumbers.map((number) => (
              <button
                key={number}
                type="button"
                onClick={() => goToPage(number)}
                aria-current={number === page ? "page" : undefined}
                className={`flex h-9 w-9 items-center justify-center rounded-full font-body text-sm transition ${
                  number === page
                    ? "bg-charcoal text-white"
                    : "border border-mist bg-white text-charcoal/70 hover:border-charcoal/30 hover:bg-mist/30"
                }`}
              >
                {number}
              </button>
            ))}

            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="rounded-full border border-mist bg-white px-4 py-2 font-body text-xs font-medium uppercase tracking-widest text-charcoal transition hover:border-charcoal/30 hover:bg-mist/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </nav>
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