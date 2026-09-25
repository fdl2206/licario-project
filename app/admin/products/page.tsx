"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  image_url?: string;
  images?: string[];
  stock?: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadProducts = async (): Promise<Product[]> => {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error("Failed to load products");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  };

  useEffect(() => {
    let cancelled = false;
    loadProducts()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
        if (!cancelled) toast.error("Failed to load products from Supabase");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await loadProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
      toast.error("Failed to load products from Supabase");
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">Products</h1>
          <p className="mt-1 text-sm text-charcoal/60">Manage your catalog directly from Supabase.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center rounded-xl bg-charcoal px-5 py-2.5 text-sm font-medium text-white hover:bg-charcoal/90"
        >
          Add Product
        </Link>
      </div>

      <div className="rounded-2xl border border-mist/40 bg-white p-4 shadow-sm flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-mist/60 bg-cream/30 px-4 py-2 text-sm text-charcoal placeholder-charcoal/40 focus:border-charcoal focus:outline-none"
        />
        <button
          onClick={handleRefresh}
          className="rounded-xl border border-mist/60 px-3 py-2 text-xs font-medium text-charcoal hover:bg-mist/30 flex-shrink-0"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-mist/40 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-charcoal">
            <thead className="border-b border-mist/40 bg-cream/20 text-xs font-semibold uppercase tracking-wider text-charcoal/60">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist/30">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-sm text-charcoal/60">
                    Loading products from Supabase...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-charcoal/50">
                    No products found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const imageSrc = p.image_url || (Array.isArray(p.images) && p.images[0]) || "";
                  return (
                    <tr key={p.id} className="transition hover:bg-mist/10">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-cream border border-mist/30">
                            {imageSrc ? (
                              <Image
                                src={imageSrc}
                                alt={p.name}
                                fill
                                className="object-cover"
                                unoptimized
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/file.svg";
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-charcoal/40">No Img</div>
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-charcoal block">{p.name}</span>
                            <span className="text-xs text-charcoal/40 font-mono">/{p.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">Rp {Number(p.price || 0).toLocaleString("id-ID")}</td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/products/${p.id}/edit`} className="rounded-lg p-1.5 text-charcoal/60 hover:bg-mist/40">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
