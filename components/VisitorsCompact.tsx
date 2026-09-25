"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface PresencePayload {
  device?: string;
}

type PresenceState = Record<string, PresencePayload[] | PresencePayload>;

function useLiveVisitors() {
  const [stats, setStats] = useState({ total: 0, pc: 0, mobile: 0 });
  const [live, setLive] = useState(false);

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
      setLive(true);
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

  return { stats, live };
}

export function VisitorsCompact() {
  const { stats, live } = useLiveVisitors();

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-body text-xs text-charcoal/60 sm:justify-start">
      <span className="inline-flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span
            className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 ${
              live ? "animate-ping" : ""
            } opacity-75`}
          />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Online now
      </span>
      <span className="font-semibold text-charcoal">{stats.total}</span>
      <span>·</span>
      <span>
        PC <span className="font-semibold text-charcoal">{stats.pc}</span>
      </span>
      <span>·</span>
      <span>
        Mobile <span className="font-semibold text-charcoal">{stats.mobile}</span>
      </span>
    </div>
  );
}