"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Banner {
  id: number;
  image_url: string;
  link?: string;
  is_active: number;
}

const PLACEHOLDER_IMAGE = "/file.svg";

function isVideo(url: string) {
  return /\.(mp4|webm)(\?.*)?$/i.test(url);
}

function getStoragePath(publicUrl: string): string {
  const marker = "/product_images/";
  const idx = publicUrl.indexOf(marker);
  return idx === -1 ? "" : publicUrl.slice(idx + marker.length);
}

async function fetchBannersApi(): Promise<Banner[]> {
  const res = await fetch("/api/banners");
  if (!res.ok) throw new Error();
  return res.json();
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [link, setLink] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchBannersApi();
        if (!cancelled) {
          setBanners(Array.isArray(data) ? data : []);
          setFetchFailed(false);
        }
      } catch (err) {
        console.warn("Failed to load banners:", err);
        if (!cancelled) {
          setBanners([]);
          setFetchFailed(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `banners/${crypto.randomUUID()}-${cleanName}`;

    try {
      setUploading(true);
      const { error: uploadError } = await supabase.storage
        .from("product_images")
        .upload(fileName, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("product_images")
        .getPublicUrl(fileName);

      setImageUrl(urlData.publicUrl);
      toast.success("Banner media uploaded");
    } catch (err) {
      console.error("Banner media upload error:", err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      toast.error("Please upload a banner image first");
      return;
    }

    try {
      const { error } = await supabase
        .from("banners")
        .insert({
          image_url: imageUrl,
          link: link || null,
          is_active: 1,
        });
      if (error) throw error;
      toast.success("Banner published successfully!");
      setImageUrl("");
      setLink("");

      setLoading(true);
      const data = await fetchBannersApi();
      setBanners(Array.isArray(data) ? data : []);
      setFetchFailed(false);
      setLoading(false);
    } catch (err) {
      console.error("Failed to save banner:", err);
      setLoading(false);
      toast.error("Failed to save banner");
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      const { error } = await supabase
        .from("banners")
        .update({ is_active: banner.is_active ? 0 : 1 })
        .eq("id", banner.id);
      if (error) throw error;
      toast.success(banner.is_active ? "Banner deactivated" : "Banner activated");
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, is_active: b.is_active ? 0 : 1 } : b))
      );
    } catch (err) {
      console.error("Failed to update banner:", err);
      toast.error("Failed to update banner");
    }
  };

  const handleDeleteBanner = async (banner: Banner) => {
    setDeletingId(banner.id);
    try {
      const storagePath = getStoragePath(banner.image_url);
      if (storagePath) {
        const { error: storageError } = await supabase.storage
          .from("product_images")
          .remove([storagePath]);
        if (storageError) console.warn("Storage remove failed:", storageError);
      }

      const { error } = await supabase.from("banners").delete().eq("id", banner.id);
      if (error) throw error;

      toast.success("Banner deleted");
      setBanners((prev) => prev.filter((b) => b.id !== banner.id));
    } catch (err) {
      console.error("Failed to delete banner:", err);
      toast.error("Failed to delete banner");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">Homepage Banners</h1>
        <p className="mt-1 text-sm text-charcoal/60">Manage promotional hero banners shown across the storefront.</p>
      </div>

      <form onSubmit={handleCreateBanner} className="rounded-2xl border border-mist/40 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-charcoal">Add New Banner</h2>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Banner Media</label>
          <p className="mb-1.5 font-body text-[11px] leading-relaxed text-charcoal/50">
            Recommended: <span className="font-semibold text-charcoal/70">1920 × 400px</span> (panoramic 21:9 / 16:5 — JPG, PNG, WebP, MP4, WebM). Displayed as a rotating strip right below the hero on <span className="font-mono text-charcoal/70">/</span>, <span className="font-mono text-charcoal/70">/shop</span>, and <span className="font-mono text-charcoal/70">/memories</span>. Supports multiple banners with auto-rotation every 5s.
          </p>
          <input
            type="file"
            accept="image/*,video/mp4,video/webm"
            onChange={handleMediaUpload}
            disabled={uploading}
            className="w-full text-xs text-charcoal/60 cursor-pointer"
          />
          {uploading && <p className="text-xs text-charcoal/50 mt-1">Uploading media...</p>}
          {imageUrl && (
            <div className="mt-3 relative h-40 w-full overflow-hidden rounded-xl border border-mist/30 bg-mist/20">
              {isVideo(imageUrl) ? (
                <video src={imageUrl} autoPlay muted loop playsInline className="h-full w-full object-cover" />
              ) : (
                <Image
                  src={imageUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                  }}
                />
              )}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Target Link (Optional)</label>
          <input
            type="text"
            placeholder="/shop"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full rounded-xl border border-mist/60 p-2.5 text-sm text-charcoal"
          />
        </div>
        <button
          type="submit"
          disabled={uploading || !imageUrl}
          className="rounded-xl bg-charcoal px-5 py-2.5 text-sm font-medium text-white hover:bg-charcoal/90 disabled:opacity-50 cursor-pointer transition-colors"
        >
          Publish Banner
        </button>
      </form>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-charcoal">Active Banners ({banners.length})</h2>
        {fetchFailed && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-700">
            Could not load banners — the database table may not be initialized yet.
          </p>
        )}
        {loading ? (
          <p className="text-sm text-charcoal/60">Loading banners...</p>
        ) : banners.length === 0 ? (
          <p className="text-sm text-charcoal/50">No banners created yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {banners.map((b) => (
              <div key={b.id} className="rounded-2xl border border-mist/40 bg-white p-4 shadow-sm space-y-3">
                <div className="relative h-36 w-full overflow-hidden rounded-xl bg-mist/20">
                  {isVideo(b.image_url) ? (
                    <video src={b.image_url} autoPlay muted loop playsInline className="h-full w-full object-cover" />
                  ) : (
                    <Image
                      src={b.image_url}
                      alt="Banner"
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  )}
                </div>
                <div className="text-xs text-charcoal/70 space-y-1">
                  <p className="truncate"><span className="font-semibold">Link:</span> {b.link || "None"}</p>
                  <p><span className="font-semibold">Status:</span> {b.is_active ? "Active" : "Inactive"}</p>
                </div>
                <div className="flex items-center justify-between border-t border-mist/30 pt-3">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(b)}
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                      b.is_active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "border-mist/60 bg-mist/10 text-charcoal/60 hover:bg-mist/20"
                    }`}
                  >
                    {b.is_active ? "● Active" : "○ Inactive"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBanner(b)}
                    disabled={deletingId === b.id}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50 cursor-pointer"
                  >
                    {deletingId === b.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}