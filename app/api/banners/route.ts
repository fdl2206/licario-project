import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}

interface BannerBody {
  imageUrl?: string;
  link?: string | null;
  isActive?: number;
  id?: number;
}

export async function GET() {
  try {
    const { data, error } = await supabase.from("banners").select("*").order("id", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err) {
    console.error("GET banners error:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { imageUrl, link, isActive } = (await request.json()) as BannerBody;
    if (!imageUrl) {
      return NextResponse.json({ error: "Missing banner image URL" }, { status: 400 });
    }

    const { data, error } = await supabase.from("banners").insert([{ image_url: imageUrl, link: link || null, is_active: isActive ? 1 : 0 }]).select();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("POST banners error:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, isActive } = (await request.json()) as BannerBody;
    if (!id) {
      return NextResponse.json({ error: "Missing banner id" }, { status: 400 });
    }

    const { data, error } = await supabase.from("banners").update({ is_active: isActive ? 1 : 0 }).eq("id", Number(id)).select();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("PUT banners error:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as BannerBody;
    const id = body?.id;
    if (!id) {
      return NextResponse.json({ error: "Missing banner id" }, { status: 400 });
    }

    const { error } = await supabase.from("banners").delete().eq("id", Number(id));

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE banners error:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}