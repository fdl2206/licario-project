"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { VisitorsWidget } from "@/components/admin/VisitorsWidget";

interface Stats {
  totalProducts: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/stats");
        if (!response.ok) throw new Error("Failed to load statistics");
        const data = (await response.json()) as Stats;
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats:", err);
        toast.error("Failed to load live statistics from Supabase");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    { title: "Total Products", value: loading ? "..." : stats?.totalProducts ?? 0, href: "/admin/products" },
    { title: "Pending Orders", value: loading ? "..." : stats?.pendingOrders ?? 0, href: "/admin/orders" },
    { title: "Completed Orders", value: loading ? "..." : stats?.completedOrders ?? 0, href: "/admin/orders" },
    { title: "Total Revenue", value: loading ? "..." : `Rp ${(stats?.totalRevenue ?? 0).toLocaleString("id-ID")}`, href: "/admin/orders" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-charcoal/60">Overview of your store performance and pending operations from Supabase.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="block rounded-2xl border border-mist/40 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-mist"
          >
            <p className="text-sm font-medium text-charcoal/60">{stat.title}</p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-charcoal">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Live Visitors — realtime presence */}
      <VisitorsWidget />

      {/* Quick Actions & Recent Activity Sections */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="rounded-2xl border border-mist/40 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-charcoal">Quick Actions</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/products/new"
              className="inline-flex items-center justify-center rounded-xl bg-charcoal px-5 py-3 text-sm font-medium text-white transition hover:bg-charcoal/90"
            >
              Add New Product
            </Link>
            <Link
              href="/admin/orders"
              className="inline-flex items-center justify-center rounded-xl border border-mist bg-white px-5 py-3 text-sm font-medium text-charcoal transition hover:bg-mist/30"
            >
              Review Pending Orders
            </Link>
          </div>
        </div>

        {/* Placeholder System Info */}
        <div className="rounded-2xl border border-mist/40 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-charcoal">System Status</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-charcoal/60">Edge Runtime</span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-charcoal/60">Supabase Database</span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-charcoal/60">Supabase Storage</span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

