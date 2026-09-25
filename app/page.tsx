"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "@/components/ProductCard";
import { PromoBannerStrip } from "@/components/PromoBannerStrip";
import type { ProductCardData } from "@/lib/product";
import { Cormorant_Garamond } from 'next/font/google';

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

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
  image_gallery?: unknown;
  color?: string | null;
  material?: string | null;
  details?: string | null;
  care_instructions?: string | null;
  is_sold_out?: boolean;
}

function normalizeProduct(p: ProductRow): ProductCardData {
  return {
    id: Number(p.id),
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.price) || 0,
    compareAtPrice: p.compare_at_price != null ? Number(p.compare_at_price) : null,
    imageUrl: p.image_url != null && String(p.image_url).length > 0 ? String(p.image_url) : null,
    images: Array.isArray(p.images) ? p.images : [],
    sizes: Array.isArray(p.sizes) ? p.sizes.map(String) : [],
    variants: Array.isArray(p.variants) ? p.variants : [],
    imageGallery: Array.isArray(p.image_gallery) ? p.image_gallery.map(String) : null,
    color: p.color ?? undefined,
    material: p.material ?? undefined,
    details: p.details ?? undefined,
    care_instructions: p.care_instructions ?? undefined,
    is_sold_out: p.is_sold_out === true,
  };
}

export default function Home() {
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = (await response.json()) as ProductRow[];

        if (Array.isArray(data)) {
          const featured = data
            .map(normalizeProduct)
            .filter((p) => !p.is_sold_out)
            .slice(0, 6);
          setProducts(featured);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#FAF0F4] via-[#FDFBF9] to-[#FDFBF9] text-slate-900 pb-20 overflow-hidden">

      {/* ============================================================
          HERO (Gaya Lovable)
          ============================================================ */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-6 py-16 md:grid-cols-2 md:gap-16 md:px-10 md:py-24">
          <div className="order-2 md:order-1 z-10">
            {/* Teks kecil di atas (Eyebrow) */}
            <p className="text-[10px] font-semibold tracking-[0.25em] text-slate-500 uppercase">
              Indonesian Premium Apparel
            </p>
            
            {/* Judul utama */}
            <h1 className={`mt-6 ${cormorantGaramond.className} text-5xl text-slate-900 md:text-7xl lg:text-8xl uppercase tracking-[0.35em] font-medium`}>
              LICARIO
            </h1>
            
            {/* Deskripsi */}
            <p className="mt-8 max-w-md text-sm sm:text-base leading-relaxed text-slate-500">
              Luxury expressed through restraint — considered silhouettes, honest materials, and craftsmanship built to outlast trends.
            </p>
            
            <div className="mt-10 flex items-center gap-6">
              {/* Tombol kotak */}
              <Link
                href="/shop"
                className="inline-flex h-12 items-center justify-center bg-slate-900 px-8 text-[10px] font-semibold uppercase tracking-[0.28em] text-white transition-colors hover:bg-slate-800"
              >
                Shop the Collection
              </Link>
            </div>
          </div>

          <div className="relative order-1 md:order-2">
            {/* glow background effect */}
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-rose-200/40 opacity-70 blur-3xl" />
            
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md shadow-2xl">
              <Image
                src="/hero.jpg" 
                alt="Licario Spring Atelier Gown"
                fill
                priority
                className="object-cover"
              />
            </div>
            
            {/* "Look 07 The Aurore Gown" */}
          </div>
        </div>
      </section>

      {/* ============================================================
          MARQUEE
          ============================================================ */}
      <div className="border-y border-rose-900/10 bg-white/40 py-5 mt-10 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 text-[11px] uppercase tracking-[0.28em] text-gray-500">
          {[
            "Complimentary global shipping",
            "Hand-finished in Como",
            "Made-to-measure available",
            "Lifetime repairs",
            "Certified traceable silks",
          ].map((i) => (
            <span key={i}>{i}</span>
          ))}
        </div>
      </div>

      {/* ============================================================
          BANNER STRIP — di bawah Hero, di atas Featured Pieces
          ============================================================ */}
      <PromoBannerStrip />

      {/* ============================================================
          PRODUCT GRID
          ============================================================ */}
      <section className="mx-auto w-full max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.25em] text-gray-500 uppercase">New Arrivals</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight md:text-6xl text-gray-900">
              Featured Pieces
            </h2>
          </div>
          
        </div>

        {isLoading ? (
          <div className="flex h-64 w-full items-center justify-center">
            <span className="text-xs uppercase tracking-[0.2em] text-gray-400 animate-pulse">Loading collection...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="flex h-64 w-full items-center justify-center">
            <span className="text-xs uppercase tracking-[0.2em] text-gray-400">No products available right now.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        <div className="mt-16 flex justify-center">
          <Link
            href="/shop"
            className="inline-flex h-12 items-center justify-center border border-gray-300 bg-transparent px-10 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600 transition-colors hover:border-gray-900 hover:text-gray-900"
          >
            View All Products
          </Link>
        </div>
      </section>

      {/* ============================================================
          STORY / BRAND STATEMENT
          ============================================================ */}
      <section className="bg-[#FDFBF9]">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-24">
          <p className="text-[10px] font-semibold tracking-[0.25em] text-gray-400 uppercase">Our Philosophy</p>
          <p className="mt-8 font-serif text-3xl leading-snug text-gray-900 md:text-5xl">
            Luxury in simplicity, integrity, and craftsmanship.
          </p>
          <div className="rule-olive mx-auto mt-8 w-16" />
          <p className="mt-10 text-[10px] tracking-[0.25em] text-gray-500 uppercase">Every Licario piece is designed to be worn for years, not seasons — a quiet rebellion against excess, built from fabrics and forms that speak for themselves.</p>
        </div>
      </section>

      {/* ============================================================
          CONTACT US SECTION
          ============================================================ */}
      <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-6 py-24 text-center border-t border-slate-200/60 mt-10">
        <span className="text-[10px] font-semibold tracking-[0.25em] text-purple-400 uppercase">
          Client Care
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-slate-700">
          We&apos;re Here to Help
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-slate-500 mb-6">
          Have questions about sizing, materials, or our made-to-measure services? Our atelier team is ready to assist you.
        </p>
        <Link
          href="/contact-us"
          className="inline-flex h-14 w-full sm:w-auto items-center justify-center bg-slate-900 px-12 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-slate-800 hover:shadow-lg"
        >
          Contact Us
        </Link>
      </section>

    </main>
  );
}