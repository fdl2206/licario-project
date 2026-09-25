"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ADMIN_PREFIX = "/admin";

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith(ADMIN_PREFIX)) return;

    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isMobile =
      /Mobi|Android|iPhone|iPod|iPad/i.test(ua) ||
      (typeof window !== "undefined" && window.innerWidth < 768);

    const channel = supabase.channel("online_visitors");

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ device: isMobile ? "Mobile" : "PC" });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pathname]);

  return null;
}