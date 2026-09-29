import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
}

/**
 * Client Supabase tanpa autentikasi.
 *
 * Hanya untuk operasi baca yang memang harus publik (mis. daftar produk,
 * banner aktif, client journal). Penulisan TIDAK boleh lewat client ini.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Client Supabase ter-autentikasi, untuk operasi tulis yang berasal dari
 * request pengguna.
 *
 * Sengaja TIDAK menerima `null`/`undefined`: versi sebelumnya mengganti
 * token kosong dengan anon key secara diam-diam, sehingga request tanpa sesi
 * tetap berjalan sebagai anonymous (fail-open) dan sepenuhnya bergantung pada
 * RLS. Sekarang fungsi ini melempar error, sehingga:
 *
 * 1. Compiler menandai pemanggil yang lupa memeriksa token, dan
 * 2. Route handler menolak request dengan 401 sebelum memanggil fungsi ini.
 */
export function createAuthedSupabase(token: string) {
  if (!token) {
    throw new Error(
      "createAuthedSupabase requires a Supabase access token. Return a 401 response before calling it."
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}
