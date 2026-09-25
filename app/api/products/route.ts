import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function parseJson(value: unknown): unknown {
  if (Array.isArray(value) || (value !== null && typeof value === "object")) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return null;
}

function toArray(value: unknown): unknown[] {
  const parsed = parseJson(value);
  return Array.isArray(parsed) ? parsed : [];
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}

type ProductRow = Record<string, unknown>;

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;

    const products = (data || []).map((row: ProductRow) => ({
      ...row,
      images: toArray(row.images),
      sizes: toArray(row.sizes),
      variants: toArray(row.variants),
      image_gallery: (parseJson(row.image_gallery) as unknown[] | null) ?? null,
    }));

    return NextResponse.json(products);
  } catch (err) {
    console.error("Supabase Products Fetch error:", err);
    return NextResponse.json(
      { error: getErrorMessage(err) },
      { status: 500 }
    );
  }
}

interface CreateProductBody {
  name?: string;
  slug?: string;
  description?: string | null;
  price?: number;
  compare_at_price?: number | null;
  image_url?: string | null;
  images?: unknown;
  sizes?: unknown;
  variants?: unknown;
  image_gallery?: unknown;
  color?: string | null;
  material?: string | null;
  details?: string | null;
  care_instructions?: string | null;
  stock?: number;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateProductBody;
    const name = body?.name?.trim();
    const slug = body?.slug?.trim();

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        slug,
        description: body.description ?? null,
        price: Number(body.price) || 0,
        compare_at_price:
          body.compare_at_price != null ? Number(body.compare_at_price) : null,
        image_url: body.image_url ?? null,
        images: toArray(body.images),
        sizes: toArray(body.sizes),
        variants: toArray(body.variants),
        image_gallery:
          Array.isArray(body.image_gallery) && body.image_gallery.length > 0
            ? body.image_gallery
            : null,
        color: body.color ?? null,
        material: body.material ?? null,
        details: body.details ?? null,
        care_instructions: body.care_instructions ?? null,
        stock: Number(body.stock) || 0,
        is_sold_out: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Supabase Product Create error:", err);
    return NextResponse.json(
      { error: getErrorMessage(err) },
      { status: 500 }
    );
  }
}