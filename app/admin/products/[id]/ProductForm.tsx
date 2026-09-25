"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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

  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [gallery, setGallery] = useState<string[]>(() => {
    const parsedGallery = parseJsonArray<string>(initialData?.image_gallery);
    const thumb = initialData?.image_url || "";
    return parsedGallery.includes(thumb)
      ? parsedGallery
      : thumb
      ? [thumb, ...parsedGallery]
      : parsedGallery;
  });

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
        const res = await fetch(`/api/products/${productId}`);
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
        setGallery(combinedGallery);
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

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);

    try {
      setUploading(true);
      const res = await fetch("/api/upload", { method: "POST", body: data });
      if (!res.ok) throw new Error();
      const result = (await res.json()) as { url: string };
      setImageUrl(result.url);
      toast.success("Main thumbnail uploaded");
    } catch {
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
        const data = new FormData();
        data.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: data });
        if (!res.ok) throw new Error();
        const result = (await res.json()) as { url: string };
        uploaded.push(result.url);
      }
      setGallery((prev) => [...prev, ...uploaded]);
      toast.success(`Uploaded ${uploaded.length} gallery image${uploaded.length > 1 ? "s" : ""}`);
    } catch {
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
    };

    try {
      setSubmitting(true);
      const url = isEdit && productId ? `/api/products/${productId}` : "/api/products";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();

      toast.success(
        isEdit ? "Product updated successfully!" : "Product created successfully!"
      );
      router.push("/admin/products");
    } catch (err) {
      console.error("Error saving product:", err);
      toast.error("Failed to save product");
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
        <button
          type="submit"
          disabled={submitting || uploading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal px-6 py-2.5 text-sm font-medium text-white hover:bg-charcoal/90 disabled:opacity-50 cursor-pointer transition-colors"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Save Changes" : "Create Product"}
        </button>
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
          <label className={labelClass}>Available Sizes *</label>
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
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="e.g. 70% Wool, 30% Polyester"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Care Instructions</label>
            <input
              type="text"
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
            <input
              type="text"
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
          {gallery.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {gallery.map((url, index) => (
                <div key={`${url}-${index}`} className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-mist/30 bg-mist/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Gallery image ${index + 1}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                    }}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setGallery((prev) => prev.filter((_, i) => i !== index))}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-charcoal/70 text-[10px] font-semibold text-white backdrop-blur transition-colors hover:bg-rose-600 cursor-pointer"
                    aria-label={`Remove gallery image ${index + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
