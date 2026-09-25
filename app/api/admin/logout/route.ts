import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Logout failed";
}

export async function POST() {
  try {
    await supabase.auth.signOut();

    const response = NextResponse.json({ success: true });
    response.cookies.set("sb-access-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
      sameSite: "lax",
    });
    return response;
  } catch (err) {
    console.error("Admin Logout error:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}