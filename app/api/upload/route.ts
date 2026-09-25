import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Failed to upload image";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Only images and videos (mp4/webm) are allowed." },
        { status: 400 }
      );
    }

    const extension = file.name.split(".").pop() || "bin";
    const uniqueFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("licario-media")
      .upload(uniqueFilename, file, {
        cacheControl: "3600",
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from("licario-media").getPublicUrl(uniqueFilename);

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err) {
    console.error("Supabase Upload error:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}