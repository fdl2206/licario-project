import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Kolom yang benar-benar ada pada tabel `products` di Supabase.
const PRODUCT_COLUMNS = [
  "name",
  "price",
  "description",
  "image_url",
  "image_gallery",
  "sizes",
  "color",
  "material",
  "details",
  "care_instructions",
  "is_sold_out",
] as const;

type Row = Record<string, unknown>;

function parseStoredArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}

async function getProductById(id: string) {
  return supabase.from("products").select("*").eq("id", Number(id)).maybeSingle();
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const { data, error } = await getProductById(id);

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: Number(data.id),
      name: String(data.name ?? ""),
      slug: String(data.slug ?? ""),
      description: data.description != null ? String(data.description) : "",
      price: Number(data.price) || 0,
      compare_at_price: data.compare_at_price != null ? Number(data.compare_at_price) : null,
      image_url: data.image_url != null && String(data.image_url).length > 0 ? String(data.image_url) : null,
      images: parseStoredArray(data.images) as Record<string, unknown>[],
      sizes: parseStoredArray(data.sizes).map(String),
      variants: parseStoredArray(data.variants) as Record<string, unknown>[],
      image_gallery: parseStoredArray(data.image_gallery).map(String),
      color: data.color != null ? String(data.color) : null,
      material: data.material != null ? String(data.material) : null,
      details: data.details != null ? String(data.details) : null,
      care_instructions: data.care_instructions != null ? String(data.care_instructions) : null,
      is_sold_out: data.is_sold_out === true,
    });
  } catch (err) {
    console.error("Supabase Product Fetch error:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as Row;

    const payload: Row = {};
    let hasFields = false;
    for (const column of PRODUCT_COLUMNS) {
      if (!(column in body)) continue;
      hasFields = true;

      switch (column) {
        case "price":
          payload[column] = Number(body[column]) || 0;
          break;
        case "image_gallery": {
          const gallery = parseStoredArray(body[column]).map(String);
          payload[column] = gallery.length > 0 ? gallery : null;
          break;
        }
        case "sizes":
          payload[column] = parseStoredArray(body[column]).map(String);
          break;
        case "is_sold_out":
          payload[column] = body[column] === true;
          break;
        case "image_url":
          payload[column] =
            body[column] != null && String(body[column]).length > 0
              ? String(body[column])
              : null;
          break;
        default:
          payload[column] = body[column] ?? null;
      }
    }

    if (!hasFields) {
      return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", Number(id))
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ ...data });
  } catch (err) {
    console.error("Supabase Product Update error:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const { error } = await supabase.from("products").delete().eq("id", Number(id));

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Supabase Product Delete error:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}