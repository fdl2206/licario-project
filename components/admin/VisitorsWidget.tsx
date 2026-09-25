"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface PresencePayload {
  device?: string;
}

type PresenceState = Record<string, PresencePayload[] | PresencePayload>;

interface VisitorStats {
  total: number;
  pc: number;
  mobile: number;
}

export function VisitorsWidget() {
  const [stats, setStats] = useState<VisitorStats>({ total: 0, pc: 0, mobile: 0 });

  useEffect(() => {
    const channel = supabase.channel("online_visitors");

    const updateStats = () => {
      const state = channel.presenceState() as PresenceState;
      let total = 0;
      let pc = 0;
      let mobile = 0;

      for (const key of Object.keys(state)) {
        const list = state[key];
        const entry = Array.isArray(list) ? list[list.length - 1] : list;
        if (!entry || typeof entry.device !== "string") continue;
        total += 1;
        if (entry.device === "Mobile") mobile += 1;
        else if (entry.device === "PC") pc += 1;
      }

      setStats({ total, pc, mobile });
    };

    channel
      .on("presence", { event: "sync" }, updateStats)
      .on("presence", { event: "join" }, updateStats)
      .on("presence", { event: "leave" }, updateStats)
      .subscribe(() => {
        updateStats();
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const cards = [
    { title: "Visitors Online", value: stats.total, accent: "text-emerald-600" },
    { title: "Desktop (PC)", value: stats.pc, accent: "text-charcoal" },
    { title: "Mobile", value: stats.mobile, accent: "text-charcoal" },
  ];

  return (
    <div className="rounded-2xl border border-mist/40 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-charcoal">Live Visitors</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Realtime
        </span>
      </div>
      <p className="mt-1 text-xs text-charcoal/50">
        Active visitors detected via Supabase Realtime Presence on the storefront.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.title} className="rounded-xl border border-mist/40 bg-cream/50 p-4">
            <p className="text-xs font-medium text-charcoal/60">{card.title}</p>
            <p className={`mt-1 text-3xl font-bold tracking-tight ${card.accent}`}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}