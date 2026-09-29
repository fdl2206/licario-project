"use client";

import type { ReactNode } from "react";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/**
 * Baris list yang bisa di-drag. Dipakai untuk daftar berurutan (banners,
 * client journal) di mana transform CSS lebih presisi dibanding grid.
 *
 * `DndContext` harus membungkus elemen `<ul>` ini, BUKAN diletakkan di
 * dalam — `DndContext` merender `<div>` tersembunyi untuk aria-live.
 */
export function SortableRow({
  id,
  disabled = false,
  label,
  children,
}: {
  id: number;
  disabled?: boolean;
  label: string;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 rounded-2xl border border-mist/40 bg-white p-4 shadow-sm transition-colors ${
        isDragging ? "z-10 border-pastel-pink shadow-card" : "hover:bg-mist/10"
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        disabled={disabled}
        aria-label={`Reorder ${label}`}
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
          disabled
            ? "cursor-not-allowed text-charcoal/15"
            : "cursor-grab text-charcoal/40 hover:bg-mist/40 hover:text-charcoal/70 active:cursor-grabbing"
        }`}
        style={{ touchAction: "none" }}
      >
        <GripVertical className="h-4 w-4" strokeWidth={2} />
      </button>
      {children}
    </li>
  );
}
