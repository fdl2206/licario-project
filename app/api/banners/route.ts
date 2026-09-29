import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

/**
 * Endpoint READ-ONLY.
 *
 * Penulisan data (create / toggle / delete) dilakukan langsung dari browser
 *_admin_ melalui sesi Supabase, sehingga RLS yang menjadi satu-satunya
 * batas keamanan. Handler POST/PUT/DELETE yang dulu ada di sini dihapus
 * karena tidak pernah dipanggil dan memakai anon client - jalur tulis
 * tanpa autentikasi yang tidak perlu.
 *
 * Pengurutan manual tetap melalui `PUT /api/banners/reorder`, yang mewajibkan
 * bearer token dan tetap subjecting setiap update ke RLS.
 */
export async function GET() {
  try {
    // `display_order` = urutan manual dari admin (drag-and-drop).
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("display_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err) {
    console.error("GET banners error:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}
