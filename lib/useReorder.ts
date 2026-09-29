"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { DragEndEvent } from "@dnd-kit/core";

/**
 * State + persist helper untuk daftar yang bisa diurutkan manual.
 *
 * Menjalankan update optimistis lalu memanggil `PUT {endpoint}` dengan
 * `{ items: [{ id, display_order }] }`. Otentikasi memakai bearer token dari
 * sesi Supabase; endpoint di server juga memverifikasi token tersebut
 * (lihat route `reorder` di folder `app/api`).
 */
export function useReorder<T extends { id: number }>({
  endpoint,
  label,
}: {
  endpoint: string;
  label: string;
}) {
  const [items, setItems] = useState<T[]>([]);
  const [saving, setSaving] = useState(false);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const previous = items;
      const oldIndex = previous.findIndex((item) => item.id === active.id);
      const newIndex = previous.findIndex((item) => item.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const next = [...previous];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);
      setItems(next);
      setSaving(true);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const res = await fetch(endpoint, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {}),
          },
          body: JSON.stringify({
            items: next.map((item, index) => ({ id: item.id, display_order: index })),
          }),
        });

        if (!res.ok) {
          let message = `Failed to save ${label.toLowerCase()} order`;
          try {
            const errorData = (await res.json()) as { error?: string };
            if (errorData?.error) message = errorData.error;
          } catch {
            // Body bukan JSON - pakai pesan default.
          }
          throw new Error(message);
        }

        toast.success(`${label} order saved`);
      } catch (err) {
        console.error(`Failed to save ${label} order:`, err);
        setItems(previous);
        toast.error(err instanceof Error ? err.message : "Failed to save order");
      } finally {
        setSaving(false);
      }
    },
    [endpoint, items, label]
  );

  return { items, setItems, saving, handleDragEnd };
}
