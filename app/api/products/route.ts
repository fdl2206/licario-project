import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type ProductRow = Record<string, unknown>;

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

function toTextList(value: unknown): string[] {
  return parseStoredArray(value).map(String);
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = (url.searchParams.get("search") || "").trim();
    const hasPage = url.searchParams.has("page");
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(48, Math.max(1, Number(url.searchParams.get("pageSize")) || 12));

    let query = supabase.from("products").select("*", { count: "exact" });

    if (search) {
      const escaped = search.replace(/'/g, "''");
      query = query.or(`name.ilike.%${escaped}%,description.ilike.%${escaped}%`);
    }

    query = query
      .order("is_sold_out", { ascending: true })
      .order("id", { ascending: false });

    if (hasPage) {
      const from = (page - 1) * pageSize;
      query = query.range(from, from + pageSize - 1);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    const products = (data || []).map((row: ProductRow) => ({
      id: Number(row.id),
      name: String(row.name ?? ""),
      slug: String(row.slug ?? ""),
      description: row.description != null ? String(row.description) : null,
      price: Number(row.price) || 0,
      compare_at_price: row.compare_at_price != null ? Number(row.compare_at_price) : null,
      image_url: row.image_url != null && String(row.image_url).length > 0 ? String(row.image_url) : null,
      images: parseStoredArray(row.images) as Record<string, unknown>[],
      sizes: toTextList(row.sizes),
      variants: parseStoredArray(row.variants) as Record<string, unknown>[],
      image_gallery: parseStoredArray(row.image_gallery).map(String),
      color: row.color != null ? String(row.color) : null,
      material: row.material != null ? String(row.material) : null,
      details: row.details != null ? String(row.details) : null,
      care_instructions: row.care_instructions != null ? String(row.care_instructions) : null,
      is_sold_out: row.is_sold_out === true,
    }));

    if (hasPage) {
      return NextResponse.json({ products, total: count ?? 0, page, pageSize });
    }

    return NextResponse.json(products);
  } catch (err) {
    console.error("Supabase Products Fetch error:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

interface CreateProductBody {
  name?: string;
  price?: number;
  description?: string | null;
  image_url?: string | null;
  image_gallery?: unknown;
  sizes?: string[];
  color?: string | null;
  material?: string | null;
  details?: string | null;
  care_instructions?: string | null;
  is_sold_out?: boolean;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateProductBody;
    const name = body?.name?.trim();

    if (!name) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    const gallery = parseStoredArray(body.image_gallery).map(String);

    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        price: Number(body.price) || 0,
        description: body.description ?? null,
        image_url: body.image_url ?? null,
        image_gallery: gallery.length > 0 ? gallery : null,
        sizes: Array.isArray(body.sizes) ? body.sizes.map(String) : [],
        color: body.color ?? null,
        material: body.material ?? null,
        details: body.details ?? null,
        care_instructions: body.care_instructions ?? null,
        is_sold_out: body.is_sold_out === true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Supabase Product Create error:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}