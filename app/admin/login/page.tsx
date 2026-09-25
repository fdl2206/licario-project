"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Welcome back, Admin!");
      router.push("/admin/products");
    } catch (err) {
      toast.error("Login failed", {
        description:
          err instanceof Error ? err.message : "Invalid email or password.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-cream px-6">
      <div className="w-full max-w-md rounded-3xl border border-mist/30 bg-white p-8 shadow-card sm:p-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="eyebrow text-pastel-pink font-semibold">Licario Studio</span>
          <h1 className="text-display-xs font-semibold text-charcoal">Admin Portal</h1>
          <p className="font-body text-xs text-charcoal/40">
            Please log in with your administrative credentials.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-charcoal/60">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="hairline h-12 w-full rounded-xl border border-mist/50 bg-white px-5 font-body text-sm text-charcoal focus:ring-2 focus:ring-pastel-peach/50 focus:outline-none transition-all"
              placeholder="admin@licario.co.id"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-charcoal/60">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="hairline h-12 w-full rounded-xl border border-mist/50 bg-white px-5 font-body text-sm text-charcoal focus:ring-2 focus:ring-pastel-peach/50 focus:outline-none transition-all"
              placeholder="••••••••"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-pastel-peach px-8 font-body text-xs font-semibold uppercase tracking-wide text-charcoal shadow-md transition-all duration-300 ease-luxe hover:bg-pastel-pink hover:scale-[1.01] disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}