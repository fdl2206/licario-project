import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const PRODUCT_COLUMNS = [
  "name",
  "slug",
  "description",
  "price",
  "compare_at_price",
  "image_url",
  "images",
  "sizes",
  "variants",
  "image_gallery",
  "color",
  "material",
  "details",
  "care_instructions",
  "stock",
  "is_sold_out",
] as const;

type Row = Record<string, unknown>;

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

    return NextResponse.json(data);
  } catch (err) {
    console.error("Supabase Product Fetch error:", err);
    return NextResponse.json(
      { error: getErrorMessage(err) },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as Row;

    const payload: Row = {};
    for (const column of PRODUCT_COLUMNS) {
      if (column in body) {
        if (column === "price") {
          payload[column] = Number(body[column]) || 0;
        } else if (column === "compare_at_price") {
          payload[column] = body[column] != null ? Number(body[column]) : null;
        } else if (column === "stock") {
          payload[column] = Number(body[column]) || 0;
        } else if (column === "image_gallery") {
          payload[column] =
            Array.isArray(body[column]) && body[column].length > 0
              ? body[column]
              : null;
        } else {
          payload[column] = body[column];
        }
      }
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

    return NextResponse.json(data);
  } catch (err) {
    console.error("Supabase Product Update error:", err);
    return NextResponse.json(
      { error: getErrorMessage(err) },
      { status: 500 }
    );
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
    return NextResponse.json(
      { error: getErrorMessage(err) },
      { status: 500 }
    );
  }
}