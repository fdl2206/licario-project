import { NextResponse, type NextRequest } from "next/server";

/**
 * Admin portal dipindahkan dari `/admin` ke `/hq-portal` untuk mengurangi
 * penemuan otomatis oleh bot. Path lama `/admin` sengaja TIDAK di-redirect
 * (redirect justru memberi tahu bot bahwa ada path baru), melainkan langsung
 * mengembalikan HTTP 404.
 *
 * Catatan keamanan: rename route ini hanya "security through obscurity" dan
 * BUKAN batas keamanan sesungguhnya. Proteksi sesungguhnya tetap berasal dari
 * (1) auth guard di `app/hq-portal/layout.tsx`, dan
 * (2) Row Level Security pada tabel Supabase.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
