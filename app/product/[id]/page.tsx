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
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Custom Measurements & Recommendation State
  const [customMeasurements, setCustomMeasurements] = useState<{
    height: string;
    weight: string;
    sleeveLength: string;
    dressLength: string;
  }>({
    height: "",
    weight: "",
    sleeveLength: "",
    dressLength: "",
  });
  const [recommendedSize, setRecommendedSize] = useState<ProductSize | null>(null);
  const [isCustomSizeOpen, setIsCustomSizeOpen] = useState(false);

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
            imageGallery: data.image_gallery || null,
            color: data.color,
            material: data.material,
            details: data.details,
            care_instructions: data.care_instructions,
            is_sold_out: data.is_sold_out ?? false,
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

  const galleryImages = product?.imageGallery && product.imageGallery.length > 0
    ? product.imageGallery
    : (product?.imageUrl ? [product.imageUrl] : ["/file.svg"]);

  const displayImage = galleryImages[activeImageIndex] || "/file.svg";

  const handleAddToBag = () => {
    if (!product || product.is_sold_out || !selectedSize) return;

    // Synthetic variantId for consistency with catalog behavior
    const variantId = product.variants?.find((v) => v.size === selectedSize)?.id 
      || `${product.id}-${selectedSize}`;

    const hasAnyMeasurement = Boolean(
      customMeasurements.height.trim() ||
      customMeasurements.weight.trim() ||
      customMeasurements.sleeveLength.trim() ||
      customMeasurements.dressLength.trim()
    );

    addItem({
      productId: product.id,
      variantId: variantId,
      name: product.name,
      slug: product.slug,
      price: product.price,
      size: selectedSize,
      image: displayImage,
      customMeasurements: hasAnyMeasurement ? { ...customMeasurements } : undefined,
    });

    toast.success(`${product.name} added to bag`, {
      description: `Size ${selectedSize} · ${formatCurrency(product.price)}`,
    });
  };

  const handleGetRecommendation = () => {
    const weightNum = parseFloat(customMeasurements.weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      toast.error("Silakan masukkan berat badan (kg) yang valid.");
      return;
    }

    let recSize: ProductSize = "M";
    if (weightNum < 50) {
      recSize = "S";
    } else if (weightNum <= 60) {
      recSize = "M";
    } else if (weightNum <= 75) {
      recSize = "L";
    } else {
      recSize = "XL";
    }

    setRecommendedSize(recSize);
    setSelectedSize(recSize);
    toast.success(`Ukuran rekomendasi: ${recSize}`, {
      description: `Ukuran ${recSize} telah dipilih secara otomatis untuk Anda.`,
    });
  };

  return (
    <main className="flex flex-1 flex-col bg-cream">
      <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
          
          {/* Kolom Kiri — Images */}
          <div className="flex flex-col gap-4 w-full">
            {/* Main Image Viewport */}
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-3xl bg-white shadow-card border border-mist/20">
              <Image
                src={displayImage}
                alt={product.name}
                fill
                priority
                className="object-cover object-top transition-transform duration-1000 ease-luxe hover:scale-105"
                sizes="(min-width: 1024px) 50vw, 100vw"
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
                    />
                  </button>
                ))}
              </div>
            )}
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
              <p className="font-body text-base leading-relaxed text-charcoal/70 whitespace-pre-wrap">
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

              {/* Custom Size & Recommendation Section */}
              <div className="rounded-2xl border border-mist/30 bg-white/60 p-4 transition-all">
                <button
                  type="button"
                  onClick={() => setIsCustomSizeOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <div className="flex flex-col">
                    <span className="font-display text-sm font-medium text-charcoal">
                      Custom Size & Recommendation
                    </span>
                    <span className="font-body text-[11px] text-charcoal/60">
                      Masukkan ukuran tubuh atau dapatkan rekomendasi otomatis
                    </span>
                  </div>
                  <span className="ml-2 font-display text-lg text-charcoal/50">
                    {isCustomSizeOpen ? "−" : "+"}
                  </span>
                </button>

                {isCustomSizeOpen && (
  <div className="mt-4 flex flex-col gap-4 border-t border-mist/20 pt-4">
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block font-body text-[11px] font-semibold text-charcoal/70 mb-1">
          Height (cm)
        </label>
        <input
          type="number"
          placeholder="e.g. 165"
          value={customMeasurements.height}
          onChange={(e) =>
            setCustomMeasurements((prev) => ({
              ...prev,
              height: e.target.value,
            }))
          }
          className="w-full rounded-xl border border-mist/40 bg-white px-3 py-2 text-xs font-body text-charcoal"
        />
      </div>
      <div>
        <label className="block font-body text-[11px] font-semibold text-charcoal/70 mb-1">
          Weight (kg)
        </label>
        <input
          type="number"
          placeholder="e.g. 52"
          value={customMeasurements.weight}
          onChange={(e) =>
            setCustomMeasurements((prev) => ({
              ...prev,
              weight: e.target.value,
            }))
          }
          className="w-full rounded-xl border border-mist/40 bg-white px-3 py-2 text-xs font-body text-charcoal"
        />
      </div>
      <div>
        <label className="block font-body text-[11px] font-semibold text-charcoal/70 mb-1">
          Panjang Lengan (cm)
        </label>
        <input
          type="number"
          placeholder="e.g. 55"
          value={customMeasurements.sleeveLength}
          onChange={(e) =>
            setCustomMeasurements((prev) => ({
              ...prev,
              sleeveLength: e.target.value,
            }))
          }
          className="w-full rounded-xl border border-mist/40 bg-white px-3 py-2 text-xs font-body text-charcoal"
        />
      </div>
      <div>
        <label className="block font-body text-[11px] font-semibold text-charcoal/70 mb-1">
          Panjang Baju (cm)
        </label>
        <input
          type="number"
          placeholder="e.g. 135"
          value={customMeasurements.dressLength}
          onChange={(e) =>
            setCustomMeasurements((prev) => ({
              ...prev,
              dressLength: e.target.value,
            }))
          }
          className="w-full rounded-xl border border-mist/40 bg-white px-3 py-2 text-xs font-body text-charcoal"
        />
      </div>
    </div>
    
    <button
      type="button"
      onClick={handleGetRecommendation}
      className="flex h-10 w-full items-center justify-center rounded-xl bg-charcoal text-[11px] font-semibold uppercase tracking-wider text-white transition-all hover:bg-charcoal/80"
    >
      Dapatkan Rekomendasi Sekarang
    </button>

    {recommendedSize && (
      <div className="flex items-center justify-between rounded-xl bg-pastel-pink/20 px-3.5 py-2.5">
        <span className="font-body text-xs text-charcoal/80">
          Rekomendasi ukuran: <b>{recommendedSize}</b>
        </span>
      </div>
    )}
  </div>
)}

  {/* --- Tombol Utama --- */}
<button
  type="button"
  onClick={handleAddToBag}
  disabled={Boolean(product.is_sold_out) || !selectedSize}
  className={`mt-4 flex h-14 w-full items-center justify-center rounded-2xl px-8 font-body text-sm font-semibold uppercase tracking-widest shadow-md transition-all duration-300 ease-luxe ${
    product.is_sold_out
      ? "bg-mist/40 text-charcoal/40 cursor-not-allowed shadow-none"
      : "bg-pastel-peach text-charcoal hover:bg-pastel-pink hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
  }`}
>
  {product.is_sold_out
    ? "SOLD OUT"
    : selectedSize
    ? "Add to Bag"
    : "Select a size"}
</button>

            {/* ============================================================
            PRODUCT DETAILS (Dynamic from Supabase)
            ============================================================ */}
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
        </div>
      </div> 
    </main>
  );
}
