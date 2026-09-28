"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, GripVertical } from "lucide-react";
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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/lib/supabase";
import type { ProductSize } from "@/lib/product";

const AVAILABLE_SIZES: ProductSize[] = ["S", "M", "L", "XL", "XXL"];

const PLACEHOLDER_IMAGE = "/licario-placeholder.svg";

function formatRupiahInput(value: string): string {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("id-ID");
}

function parsePrice(value: string): number {
  return Number(value.replace(/[^\d]/g, "")) || 0;
}

interface ProductFormInitialData {
  id?: number;
  name?: string;
  description?: string | null;
  price?: number;
  image_url?: string | null;
  images?: { id: string; url: string; altText: string | null; sortOrder: number }[] | string | null;
  sizes?: string[] | string | null;
  variants?: { id: string; size: string; stock: number }[] | string | null;
  image_gallery?: string[] | string | null;
  color?: string | null;
  material?: string | null;
  details?: string | null;
  care_instructions?: string | null;
  is_sold_out?: boolean;
  is_hidden?: boolean;
  is_preorder?: boolean;
}

interface ProductFormProps {
  isEdit: boolean;
  initialData?: ProductFormInitialData;
  productId?: number;
}

function parseJsonArray<T>(value: T[] | string | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.length > 0) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

interface GalleryItem {
  id: string;
  url: string;
}

/** Stable ids keep dnd-kit from remounting tiles while reordering. */
function toGalleryItems(urls: string[]): GalleryItem[] {
  return urls.map((url) => ({
    id:
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `img-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    url,
  }));
}

function SortableGalleryItem({
  item,
  index,
  onRemove,
}: {
  item: GalleryItem;
  index: number;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative aspect-[3/4] overflow-hidden rounded-xl bg-mist/20 ${
        isDragging
          ? "z-10 border-2 border-pastel-pink shadow-card"
          : "border border-mist/30"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.url}
        alt={`Gallery image ${index + 1}`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
        }}
        className="h-full w-full object-cover"
      />

      {/* Drag handle — pointer events isolated to this button so the tile
          itself stays clickable and the remove button unaffected. */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Reorder gallery image ${index + 1}`}
        className="absolute left-1.5 top-1.5 flex h-6 w-6 cursor-grab items-center justify-center rounded-full bg-charcoal/70 text-white backdrop-blur transition-colors hover:bg-charcoal active:cursor-grabbing"
        style={{ touchAction: "none" }}
      >
        <GripVertical className="h-3.5 w-3.5" strokeWidth={2} />
      </button>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove gallery image ${index + 1}`}
        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-charcoal/70 text-[10px] font-semibold text-white backdrop-blur transition-colors hover:bg-rose-600 cursor-pointer"
      >
        ×
      </button>

      <span className="absolute bottom-1.5 left-1.5 rounded-full bg-charcoal/70 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur">
        {index + 1}
      </span>
    </div>
  );
}

export default function ProductForm({ isEdit, initialData, productId }: ProductFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(!!isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [material, setMaterial] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [color, setColor] = useState("");
  const [details, setDetails] = useState("");
  const [stock, setStock] = useState("");
  const [isHidden, setIsHidden] = useState(initialData?.is_hidden ?? false);
  const [isPreorder, setIsPreorder] = useState(initialData?.is_preorder ?? false);

  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    const parsedGallery = parseJsonArray<string>(initialData?.image_gallery);
    const thumb = initialData?.image_url || "";
    const urls = parsedGallery.includes(thumb)
      ? parsedGallery
      : thumb
      ? [thumb, ...parsedGallery]
      : parsedGallery;
    return toGalleryItems(urls);
  });
  const gallery = galleryItems.map((item) => item.url);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleGalleryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setGalleryItems((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === active.id);
      const newIndex = prev.findIndex((item) => item.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);
      return next;
    });
  };

  const handleRemoveGalleryItem = (id: string) => {
    setGalleryItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleSize = (size: ProductSize) => {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      if (!isEdit || !productId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/products/${productId}?includeHidden=1`);
        if (res.status === 404) {
          toast.error("Product not found");
          router.push("/admin/products");
          return;
        }
        if (!res.ok) throw new Error("Failed to load product");
        const data: ProductFormInitialData = await res.json();

        if (cancelled) return;

        setName(data.name || "");
        setPrice(data.price ? String(data.price) : "");
        setDescription(data.description || "");
        setMaterial(data.material || "");
        setCareInstructions(data.care_instructions || "");
        setColor(data.color || "");
        setDetails(data.details || "");
        setStock(data.is_sold_out ? "0" : "1");
        setIsHidden(data.is_hidden ?? false);
        setIsPreorder(data.is_preorder ?? false);

        const parsedImages = parseJsonArray(data.images);
        const thumb = data.image_url || parsedImages[0]?.url || "";
        setImageUrl(thumb);

        const parsedGallery = parseJsonArray<string>(data.image_gallery);
        const parsedVariants = parseJsonArray<{ size: string }>(data.variants);
        const parsedSizes = parseJsonArray<string>(data.sizes);

        let resolvedSizes: string[] = [];
        if (parsedSizes.length > 0) {
          resolvedSizes = parsedSizes;
        } else if (parsedVariants.length > 0) {
          resolvedSizes = parsedVariants.map((v) => v.size);
        }
        const validSizes = resolvedSizes.filter((s): s is ProductSize =>
          AVAILABLE_SIZES.includes(s as ProductSize)
        );
        setSizes(validSizes);

        const existingGallery = parsedGallery.length > 0 ? parsedGallery : [];
        const combinedGallery = existingGallery.includes(thumb)
          ? existingGallery
          : thumb
          ? [thumb, ...existingGallery]
          : existingGallery;
        setGalleryItems(toGalleryItems(combinedGallery));
      } catch (err) {
        console.error("Error loading product:", err);
        toast.error("Failed to load product");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [isEdit, productId, router]);

  const uploadToStorage = async (file: File): Promise<string> => {
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `products/${crypto.randomUUID()}-${cleanName}`;

    const { error: uploadError } = await supabase.storage
      .from("product_images")
      .upload(fileName, file, { upsert: false });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("product_images")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadToStorage(file);
      setImageUrl(url);
      toast.success("Main thumbnail uploaded");
    } catch (err) {
      console.error("Thumbnail upload error:", err);
      toast.error("Thumbnail upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const uploaded: string[] = [];
    try {
      setUploading(true);
      for (const file of files) {
        const url = await uploadToStorage(file);
        uploaded.push(url);
      }
      setGalleryItems((prev) => [...prev, ...toGalleryItems(uploaded)]);
      toast.success(`Uploaded ${uploaded.length} gallery image${uploaded.length > 1 ? "s" : ""}`);
    } catch (err) {
      console.error("Gallery upload error:", err);
      toast.error("Gallery upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Product name is required");
      return;
    }
    const numericPrice = parsePrice(price);
    if (numericPrice <= 0) {
      toast.error("Price must be greater than zero");
      return;
    }
    if (sizes.length === 0) {
      toast.error("Select at least one available size");
      return;
    }

    const numericStock = Number(stock) || 0;

    const payload = {
      name: trimmedName,
      price: numericPrice,
      description,
      image_url: imageUrl || null,
      image_gallery: gallery.length > 0 ? gallery : null,
      sizes,
      color: color || null,
      material: material || null,
      details: details || null,
      care_instructions: careInstructions || null,
      is_sold_out: numericStock <= 0,
      is_hidden: isHidden,
      is_preorder: isPreorder,
    };

    try {
      setSubmitting(true);
      const url = isEdit && productId ? `/api/products/${productId}` : "/api/products";
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = res.status === 404 ? "Product not found" : "Failed to save product";
        try {
          const errorData = (await res.json()) as { error?: string };
          if (errorData?.error) message = errorData.error;
        } catch {
          // Keep fallback message if the response body is not JSON.
        }
        throw new Error(message);
      }

      toast.success(
        isEdit ? "Product updated successfully!" : "Product created successfully!"
      );
      router.push("/admin/products");
    } catch (err) {
      console.error("Error saving product:", err);
      toast.error(
        err instanceof Error && err.message ? err.message : "Failed to save product"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-charcoal/40" />
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-mist/60 p-2.5 text-sm text-charcoal outline-none transition-colors placeholder:text-charcoal/30 focus:border-pastel-pink focus:ring-2 focus:ring-pastel-pink/20";
  const labelClass = "block text-sm font-medium text-charcoal mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="mt-1 text-sm text-charcoal/60">
            {isEdit
              ? "Update the product details below. The slug regenerates from the name."
              : "Create a new bespoke piece. The slug auto-generates from the name."}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {isEdit && (
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-mist px-6 py-2.5 text-sm font-medium text-charcoal/70 transition-colors hover:border-charcoal/30 hover:bg-mist/30 hover:text-charcoal disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting || uploading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal px-6 py-2.5 text-sm font-medium text-white hover:bg-charcoal/90 disabled:opacity-50 cursor-pointer transition-colors"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-mist/40 bg-white p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aria Tailored Blazer"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Price (IDR) *</label>
            <input
              type="text"
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(formatRupiahInput(e.target.value))}
              placeholder="e.g. 1.890.000"
              className={inputClass}
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the silhouette, fit, and story of the piece."
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>In-Stock Sizes *</label>
          <p className="mb-2 font-body text-[11px] leading-relaxed text-charcoal/50">
            Pilih size yang benar-benar ready di stok. Size yang tidak dicentang
            tetap bisa dipesan pelanggan sebagai <strong>pre-order</strong> (dibuat
            setelah pesanan masuk) dan akan ditandai garis putus-putus di storefront.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {AVAILABLE_SIZES.map((size) => {
              const checked = sizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  aria-pressed={checked}
                  className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                    checked
                      ? "border-pastel-pink bg-pastel-pink/15 text-charcoal ring-2 ring-pastel-pink/20"
                      : "border-mist/60 bg-white text-charcoal/70 hover:border-pastel-pink/50"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Material(s)</label>
            <textarea
              rows={4}
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="e.g. 70% Wool, 30% Polyester"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Care Instructions</label>
            <textarea
              rows={4}
              value={careInstructions}
              onChange={(e) => setCareInstructions(e.target.value)}
              placeholder="e.g. Dry clean only."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Color</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Jet Black"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Details</label>
            <textarea
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. Fully lined, structured shoulders."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Stock</label>
            <input
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="e.g. 10"
              className={inputClass}
            />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-mist/60 p-3.5 sm:col-span-2">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-0.5">
                Pre-Order Status
              </label>
              <p className="text-xs text-charcoal/50">
                Marks the product as a pre-order. It stays purchasable even when the stock shows 0, and shows a &quot;PRE-ORDER&quot; badge on the storefront.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isPreorder}
              aria-label="Toggle pre-order status"
              onClick={() => setIsPreorder((v) => !v)}
              className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors duration-300 cursor-pointer ${
                isPreorder ? "bg-charcoal" : "bg-pastel-peach"
              }`}
            >
              <span
                className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${
                  isPreorder ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-mist/60 p-3.5 sm:col-span-2">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-0.5">
                Hide from storefront
              </label>
              <p className="text-xs text-charcoal/50">
                Hidden products won&apos;t appear on the shop or homepage, but remain editable here.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isHidden}
              aria-label="Hide product from storefront"
              onClick={() => setIsHidden((v) => !v)}
              className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors duration-300 cursor-pointer ${
                isHidden ? "bg-charcoal" : "bg-pastel-peach"
              }`}
            >
              <span
                className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${
                  isHidden ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-mist/40 bg-white p-6 shadow-sm space-y-6">
        <div>
          <label className={labelClass}>Main Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailUpload}
            disabled={uploading}
            className="w-full text-xs text-charcoal/60 cursor-pointer"
          />
          {uploading && <p className="text-xs text-charcoal/50 mt-1">Uploading image...</p>}
          {imageUrl && (
            <div className="mt-3 relative h-56 w-full max-w-xs overflow-hidden rounded-xl border border-mist/30 bg-mist/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Main thumbnail preview"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                }}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>Gallery (multiple images)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryUpload}
            disabled={uploading}
            className="w-full text-xs text-charcoal/60 cursor-pointer"
          />
          {uploading && <p className="text-xs text-charcoal/50 mt-1">Uploading image...</p>}
          {galleryItems.length > 0 && (
            <>
              <p className="text-xs text-charcoal/50 mt-2">
                Drag the handle to reorder. Image 1 is shown first on the product page.
              </p>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleGalleryDragEnd}
              >
                <SortableContext
                  items={galleryItems.map((item) => item.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                    {galleryItems.map((item, index) => (
                      <SortableGalleryItem
                        key={item.id}
                        item={item}
                        index={index}
                        onRemove={() => handleRemoveGalleryItem(item.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
