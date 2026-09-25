"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

interface D1Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<D1Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async (): Promise<D1Order[]> => {
    const res = await fetch("/api/orders");
    if (!res.ok) throw new Error("Failed to load orders");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  };

  useEffect(() => {
    let cancelled = false;
    loadOrders()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err) => {
        console.error("Failed to load orders:", err);
        if (!cancelled) toast.error("Failed to load orders from Supabase");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await loadOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
      toast.error("Failed to load orders from Supabase");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-50 text-emerald-700";
      case "pending":
        return "bg-amber-50 text-amber-700";
      case "shipped":
        return "bg-blue-50 text-blue-700";
      case "cancelled":
        return "bg-rose-50 text-rose-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">Orders</h1>
          <p className="mt-1 text-sm text-charcoal/60">View and manage customer purchases directly from Supabase.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center justify-center rounded-xl border border-mist/60 bg-white px-4 py-2 text-sm font-medium text-charcoal hover:bg-mist/30 transition"
        >
          Refresh Orders
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-mist/40 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-charcoal">
            <thead className="border-b border-mist/40 bg-cream/20 text-xs font-semibold uppercase tracking-wider text-charcoal/60">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist/30">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-charcoal/60">
                    Loading orders from Supabase...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-charcoal/50">
                    No orders found in database.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="transition hover:bg-mist/10">
                    <td className="px-6 py-4 font-mono font-medium">#ORD-{order.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-charcoal">{order.customer_name}</p>
                        <p className="text-xs text-charcoal/50 truncate max-w-[200px]">{order.customer_address}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-charcoal/70">{order.customer_phone || "-"}</td>
                    <td className="px-6 py-4 text-charcoal/60">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="px-6 py-4 font-medium">Rp {Number(order.total_amount || 0).toLocaleString("id-ID")}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusBadge(order.status)}`}>
                        {order.status || "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex rounded-lg px-3 py-1.5 text-xs font-medium text-charcoal bg-cream/50 hover:bg-mist/40 transition"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
