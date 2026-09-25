import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface LoginBody {
  email?: string;
  password?: string;
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Internal server error";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const email = body?.email;
    const password = body?.password;

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, user: data.user });

    // Keep a session cookie for SSR-friendly helpers and API consumers.
    response.cookies.set("sb-access-token", data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: data.session.expires_in,
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    console.error("Admin Login Error:", err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}