import { NextResponse } from "next/server";
import { createAuthedSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

interface ReorderItem {
  id: number;
  display_order: number;
}

const MAX_ITEMS = 200;

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}

function getAuthToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" && token ? token : null;
}

/** Validasi payload: array berisi { id, display_order } dengan nilai yang masuk akal. */
function parseItems(value: unknown): ReorderItem[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  if (value.length > MAX_ITEMS) return null;

  const items: ReorderItem[] = [];
  const seen = new Set<number>();

  for (const raw of value) {
    if (typeof raw !== "object" || raw === null) return null;
    const record = raw as Record<string, unknown>;

    const id = Number(record.id);
    const displayOrder = Number(record.display_order);

    if (!Number.isInteger(id) || id <= 0) return null;
    if (!Number.isInteger(displayOrder) || displayOrder < 0) return null;
    if (seen.has(id)) return null;

    seen.add(id);
    items.push({ id, display_order: displayOrder });
  }

  return items;
}

export async function PUT(request: Request) {
  const token = getAuthToken(request);

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = createAuthedSupabase(token);

  try {
    const body = (await request.json()) as { items?: unknown };
    const items = parseItems(body?.items);

    if (!items) {
      return NextResponse.json(
        { error: "Invalid payload: expected { items: [{ id, display_order }] }" },
        { status: 400 }
      );
    }

    // Jumlah entri sedikit, jadi update per baris sudah cukup cepat.
    // `Promise.all` menjaga RLS tetap berlaku di tiap permintaan.
    const results = await Promise.all(
      items.map((item) =>
        client
          .from("client_journal")
          .update({ display_order: item.display_order })
          .eq("id", item.id)
          .select("id")
      )
    );

    const failed = results.filter((result) => result.error);

    if (failed.length > 0) {
      return NextResponse.json(
        {
          error: "Failed to update client journal order",
          details: failed.map((result) => result.error?.message),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ updated: items.length });
  } catch (err) {
    console.error("Supabase Client Journal Reorder error:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}
