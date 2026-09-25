"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Memory {
  id: number;
  image_url: string;
  customer_name: string;
  description?: string;
  created_at?: string;
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

async function fetchMemoriesApi(): Promise<Memory[]> {
  const res = await fetch("/api/memories");
  if (!res.ok) throw new Error();
  return res.json();
}

export default function AdminMemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [description, setDescription] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchMemoriesApi();
        if (!cancelled) {
          setMemories(Array.isArray(data) ? data : []);
          setFetchFailed(false);
        }
      } catch (err) {
        console.warn("Failed to load memories:", err);
        if (!cancelled) {
          setMemories([]);
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
    const fileName = `memories/${crypto.randomUUID()}-${cleanName}`;

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
      toast.success("Media uploaded");
    } catch (err) {
      console.error("Memory media upload error:", err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl || !customerName) {
      toast.error("Please upload media and fill in customer name");
      return;
    }

    try {
      const { error } = await supabase
        .from("memories")
        .insert({
          image_url: imageUrl,
          customer_name: customerName,
          description: description || null,
        });
      if (error) throw error;

      toast.success("Customer memory added successfully!");
      setImageUrl("");
      setCustomerName("");
      setDescription("");

      setLoading(true);
      const data = await fetchMemoriesApi();
      setMemories(Array.isArray(data) ? data : []);
      setFetchFailed(false);
      setLoading(false);
    } catch (err) {
      console.error("Failed to save memory:", err);
      setLoading(false);
      toast.error("Failed to save memory");
    }
  };

  const handleDeleteMemory = async (memory: Memory) => {
    setDeletingId(memory.id);
    try {
      const storagePath = getStoragePath(memory.image_url);
      if (storagePath) {
        const { error: storageError } = await supabase.storage
          .from("product_images")
          .remove([storagePath]);
        if (storageError) console.warn("Storage remove failed:", storageError);
      }

      const { error } = await supabase.from("memories").delete().eq("id", memory.id);
      if (error) throw error;

      toast.success("Memory deleted");
      setMemories((prev) => prev.filter((m) => m.id !== memory.id));
    } catch (err) {
      console.error("Failed to delete memory:", err);
      toast.error("Failed to delete memory");
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (memory: Memory) => {
    setEditingMemory(memory);
    setEditName(memory.customer_name);
    setEditDescription(memory.description || "");
  };

  const handleUpdateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMemory) return;

    const nextName = editName.trim();
    const nextDescription = editDescription.trim() || null;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("memories")
        .update({ customer_name: nextName, description: nextDescription })
        .eq("id", editingMemory.id);
      if (error) throw error;

      toast.success("Memory updated");
      setMemories((prev) =>
        prev.map((m) =>
          m.id === editingMemory.id
            ? { ...m, customer_name: nextName, description: nextDescription || undefined }
            : m
        )
      );
      setEditingMemory(null);
    } catch (err) {
      console.error("Failed to update memory:", err);
      toast.error("Failed to update memory");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">Customer Memories (Gallery)</h1>
        <p className="mt-1 text-sm text-charcoal/60">Share customer photos wearing Licario Studio pieces.</p>
      </div>

      <form onSubmit={handleCreateMemory} className="rounded-2xl border border-mist/40 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-charcoal">Add New Customer Memory</h2>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Photo / Video</label>
          <input
            type="file"
            accept="image/*,video/mp4,video/webm"
            onChange={handleMediaUpload}
            disabled={uploading}
            className="w-full text-xs text-charcoal/60 cursor-pointer"
          />
          {uploading && <p className="text-xs text-charcoal/50 mt-1">Uploading...</p>}
          {imageUrl && (
            <div className="mt-3 relative h-48 w-40 overflow-hidden rounded-xl border border-mist/30 bg-mist/20">
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
          <label className="block text-sm font-medium text-charcoal mb-1">Customer Name / Handle</label>
          <input
            type="text"
            placeholder="e.g. Sarah J. (@sarahj)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full rounded-xl border border-mist/60 p-2.5 text-sm text-charcoal"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Testimonial / Caption</label>
          <textarea
            rows={2}
            placeholder="e.g. Loved wearing this dress for my anniversary dinner!"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-mist/60 p-2.5 text-sm text-charcoal"
          />
        </div>
        <button
          type="submit"
          disabled={uploading || !imageUrl || !customerName}
          className="rounded-xl bg-charcoal px-5 py-2.5 text-sm font-medium text-white hover:bg-charcoal/90 disabled:opacity-50 cursor-pointer transition-colors"
        >
          Publish Memory
        </button>
      </form>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-charcoal">Gallery ({memories.length})</h2>
        {fetchFailed && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-700">
            Could not load memories — the database table may not be initialized yet.
          </p>
        )}
        {loading ? (
          <p className="text-sm text-charcoal/60">Loading memories...</p>
        ) : memories.length === 0 ? (
          <p className="text-sm text-charcoal/50">No memories added yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {memories.map((m) => (
              <div key={m.id} className="rounded-2xl border border-mist/40 bg-white p-3 shadow-sm space-y-2">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-mist/20">
                  {isVideo(m.image_url) ? (
                    <video src={m.image_url} autoPlay muted loop playsInline className="h-full w-full object-cover" />
                  ) : (
                    <Image
                      src={m.image_url}
                      alt={m.customer_name}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-xs text-charcoal truncate">{m.customer_name}</p>
                  {m.description && <p className="text-[11px] text-charcoal/60 line-clamp-2 mt-0.5">{m.description}</p>}
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-mist/30 pt-2">
                  <button
                    type="button"
                    onClick={() => openEdit(m)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-charcoal/70 transition-colors hover:bg-mist/40 cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMemory(m)}
                    disabled={deletingId === m.id}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50 cursor-pointer"
                  >
                    {deletingId === m.id ? (
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

      {editingMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 p-4">
          <form
            onSubmit={handleUpdateMemory}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4"
          >
            <h3 className="text-base font-semibold text-charcoal">Edit Customer Memory</h3>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Customer Name / Handle</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-xl border border-mist/60 p-2.5 text-sm text-charcoal"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Testimonial / Caption</label>
              <textarea
                rows={2}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full rounded-xl border border-mist/60 p-2.5 text-sm text-charcoal"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingMemory(null)}
                disabled={saving}
                className="rounded-xl border border-mist/60 px-4 py-2 text-sm font-medium text-charcoal/70 hover:bg-mist/30 disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-charcoal px-4 py-2 text-sm font-medium text-white hover:bg-charcoal/90 disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}