"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 menit

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "wheel",
] as const;

export function SessionTimeout({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const onTimeout = async () => {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Auto logout signOut error:", err);
      }
      toast.info("Sesi Anda telah berakhir karena tidak ada aktivitas.");
      router.replace("/admin/login");
    };

    const resetTimer = () => {
      clearTimer();
      timerRef.current = setTimeout(onTimeout, INACTIVITY_LIMIT);
    };

    const handleActivity = () => resetTimer();

    resetTimer();
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true })
    );

    return () => {
      clearTimer();
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [enabled, router]);

  return null;
}