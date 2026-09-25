import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}

interface MemoryBody {
  imageUrl?: string;
  customerName?: string;
  description?: string | null;
  id?: number;
}

export async function GET() {
  try {
    const { data, error } = await supabase.from("memories").select("*").order("id", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err) {
    console.error("GET memories error:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { imageUrl, customerName, description } = (await request.json()) as MemoryBody;
    if (!imageUrl || !customerName) {
      return NextResponse.json({ error: "Missing required fields (image, customer name)" }, { status: 400 });
    }

    const { data, error } = await supabase.from("memories").insert([{ image_url: imageUrl, customer_name: customerName, description: description || null }]).select();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("POST memories error:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as MemoryBody;
    const id = body?.id;
    if (!id) {
      return NextResponse.json({ error: "Missing memory id" }, { status: 400 });
    }

    const { error } = await supabase.from("memories").delete().eq("id", Number(id));

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE memories error:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}