"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ORDER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

interface OrderItemRow {
  id: number;
  product_id: number;
  product_name?: string;
  size?: string | null;
  quantity: number;
  price_at_time: number | string;
}

interface OrderRow {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number | string;
  status: string;
  order_items?: OrderItemRow[];
}

function formatRupiah(value: number | string): string {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "";

  const [order, setOrder] = useState<OrderRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [status, setStatus] = useState("pending");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      if (!id) {
        if (!cancelled) setNotFound(true);
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          if (!cancelled) setNotFound(true);
          return;
        }

        const rows = (data as unknown) as OrderRow;
        const items = Array.isArray(rows.order_items) ? rows.order_items : [];

        // Lengkapi nama produk untuk tiap item (jika tersedia)
        let productNames: Record<number, string> = {};
        const productIds = items
          .map((item) => Number(item.product_id))
          .filter((productId) => Number.isFinite(productId) && productId > 0);
        if (productIds.length > 0) {
          const { data: products, error: productError } = await supabase
            .from("products")
            .select("id, name")
            .in("id", productIds);
          if (!productError && Array.isArray(products)) {
            productNames = Object.fromEntries(
              products.map((p) => [Number(p.id), String(p.name || "")])
            );
          }
        }

        if (cancelled) return;
        setOrder({
          ...rows,
          order_items: items.map((item) => ({
            ...item,
            product_name: productNames[Number(item.product_id)],
          })),
        });
        setStatus(rows.status || "pending");
      } catch (err) {
        console.error("Error loading order:", err);
        if (!cancelled) toast.error("Failed to load order details");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOrder();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleStatusChange = async (nextStatus: string) => {
    if (!order || nextStatus === status) return;

    const orderId = order.id;
    const previousStatus = status;
    const newStatus = nextStatus.toLowerCase();

    setUpdating(true);
    setStatus(newStatus);

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      const label = ORDER_STATUSES.find((s) => s.value === newStatus)?.label || newStatus;
      toast.success(`Order status updated to ${label}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      setStatus(previousStatus);
      toast.error("Failed to update order status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-charcoal/40" />
          <span className="text-sm text-charcoal/50">Loading order...</span>
        </div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <span className="eyebrow text-pastel-pink font-semibold">Error</span>
        <h1 className="font-display text-2xl font-bold text-charcoal">Order not found</h1>
        <Link
          href="/admin/orders"
          className="mt-2 inline-flex h-12 items-center justify-center rounded-xl bg-pastel-peach px-10 font-body text-xs font-semibold uppercase tracking-wide text-charcoal shadow-sm transition-all duration-300 ease-luxe hover:bg-pastel-pink"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin/orders" className="text-xs text-charcoal/60 hover:text-charcoal flex items-center gap-1 mb-1">
            ← Back to Orders
          </Link>
          <h1 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
            Order {order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-charcoal/60">Placed on {formatDate(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="order-status" className="text-sm font-medium text-charcoal">
            Status:
          </label>
          <div className="relative">
            <select
              id="order-status"
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="rounded-xl border border-mist/60 bg-white px-3 py-2 text-sm font-medium text-charcoal disabled:cursor-not-allowed disabled:opacity-60 min-w-[150px]"
            >
              {ORDER_STATUSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {updating && (
              <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-charcoal/40" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="md:col-span-2 rounded-2xl border border-mist/40 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-charcoal">Order Items</h2>
          {order.order_items && order.order_items.length > 0 ? (
            <div className="divide-y divide-mist/30">
              {order.order_items.map((item) => (
                <div key={item.id} className="py-3">
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-charcoal">
                        {item.product_name || `Product #${item.product_id}`}
                      </p>
                      <p className="text-xs text-charcoal/50">
                        Size: {item.size || "Standard"} · Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-charcoal">
                      {formatRupiah((item.price_at_time || 0) as number)}
                    </p>
                  </div>
                  {item.size && /custom/i.test(item.size) && (
                    <p className="mt-1 text-xs text-pastel-pink">
                      Custom tailored measurements
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-charcoal/50">No items found.</p>
          )}
          <div className="border-t border-mist/30 pt-4 flex justify-between items-center">
            <span className="font-semibold text-charcoal">Total Amount</span>
            <span className="text-lg font-bold text-charcoal">{formatRupiah(order.total_amount)}</span>
          </div>
        </div>

        {/* Customer & Shipping */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-mist/40 bg-white p-6 shadow-sm space-y-3 text-sm">
            <h2 className="text-base font-semibold text-charcoal">Customer Details</h2>
            <div>
              <p className="font-medium text-charcoal">{order.customer_name || "—"}</p>
              <p className="text-charcoal/60">{order.customer_phone || "—"}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-mist/40 bg-white p-6 shadow-sm space-y-3 text-sm">
            <h2 className="text-base font-semibold text-charcoal">Shipping Address</h2>
            <p className="text-charcoal/70 whitespace-pre-wrap">{order.customer_address || "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}