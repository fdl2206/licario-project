"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { GripVertical, Loader2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/lib/supabase";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  image_url?: string;
  images?: string[];
  stock?: number;
  is_hidden?: boolean;
  display_order?: number;
}

function SortableProductRow({
  product,
  disabled,
}: {
  product: Product;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: product.id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const imageSrc =
    product.image_url || (Array.isArray(product.images) && product.images[0]) || "";

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`transition ${isDragging ? "z-10 bg-mist/30" : "hover:bg-mist/10"}`}
    >
      <td className="w-10 py-4 pl-2 pr-0">
        <button
          type="button"
          {...attributes}
          {...listeners}
          disabled={disabled}
          aria-label={`Reorder ${product.name}`}
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            disabled
              ? "cursor-not-allowed text-charcoal/15"
              : "cursor-grab text-charcoal/40 hover:bg-mist/40 hover:text-charcoal/70 active:cursor-grabbing"
          }`}
          style={{ touchAction: "none" }}
        >
          <GripVertical className="h-4 w-4" strokeWidth={2} />
        </button>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-cream border border-mist/30">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/file.svg";
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-charcoal/40">
                No Img
              </div>
            )}
          </div>
          <div>
            <span className="font-medium text-charcoal block">
              {product.name}
              {product.is_hidden && (
                <span className="ml-2 inline-flex rounded-full bg-charcoal/10 px-2 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wider text-charcoal/60">
                  Hidden
                </span>
              )}
            </span>
            <span className="text-xs text-charcoal/40 font-mono">/{product.slug}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 font-medium">
        Rp {Number(product.price || 0).toLocaleString("id-ID")}
      </td>
      <td className="px-6 py-4 text-right">
        <Link
          href={`/hq-portal/products/${product.id}/edit`}
          className="rounded-lg p-1.5 text-charcoal/60 hover:bg-mist/40"
        >
          Edit
        </Link>
      </td>
    </tr>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const loadProducts = async (): Promise<Product[]> => {
    const res = await fetch("/api/products?includeHidden=1");
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

  const isSearching = search.trim().length > 0;

  const filtered = isSearching
    ? products.filter((p) => (p.name || "").toLowerCase().includes(search.toLowerCase()))
    : products;

  const persistOrder = async (ordered: Product[], previous: Product[]) => {
    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch("/api/products/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          items: ordered.map((p, index) => ({ id: p.id, display_order: index })),
        }),
      });

      if (!res.ok) {
        let message = "Failed to save product order";
        try {
          const errorData = (await res.json()) as { error?: string };
          if (errorData?.error) message = errorData.error;
        } catch {
          // Pertahankan pesan fallback bila body bukan JSON.
        }
        throw new Error(message);
      }

      toast.success("Product order saved");
    } catch (err) {
      console.error("Failed to save product order:", err);
      setProducts(previous);
      toast.error(err instanceof Error ? err.message : "Failed to save product order");
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const previous = products;
    const oldIndex = products.findIndex((p) => p.id === active.id);
    const newIndex = products.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const next = [...products];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);

    setProducts(next);
    void persistOrder(next, previous);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">Products</h1>
          <p className="mt-1 text-sm text-charcoal/60">Manage your catalog directly from Supabase.</p>
        </div>
        <Link
          href="/hq-portal/products/new"
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

      <div className="flex items-center justify-between gap-4 text-xs text-charcoal/50">
        <p>
          Drag the handle to set the display order. This order shows on the homepage and /shop.
        </p>
        {isSearching && (
          <p className="rounded-full bg-mist/40 px-3 py-1 font-medium text-charcoal/60">
            Clear search to reorder
          </p>
        )}
        {saving && !isSearching && (
          <p className="flex items-center gap-1.5 font-medium text-charcoal/60">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving order...
          </p>
        )}
      </div>

      {/* DndContext merender elemen <div> tersembunyi untuk aria-live, jadi
          harus berada DI LUAR <table> agar <tbody> hanya berisi <tr>. */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-hidden rounded-2xl border border-mist/40 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-charcoal">
              <thead className="border-b border-mist/40 bg-cream/20 text-xs font-semibold uppercase tracking-wider text-charcoal/60">
                <tr>
                  <th className="w-10 py-4 pl-2 pr-0">
                    <span className="sr-only">Order</span>
                  </th>
                  <th className="px-4 py-4">Product</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist/30">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-charcoal/60">
                      Loading products from Supabase...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-charcoal/50">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  <SortableContext
                    items={filtered.map((p) => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filtered.map((p) => (
                      <SortableProductRow key={p.id} product={p} disabled={isSearching} />
                    ))}
                  </SortableContext>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DndContext>
    </div>
  );
}
