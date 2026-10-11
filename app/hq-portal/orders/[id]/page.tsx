"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MEASUREMENT_FIELDS } from "@/components/CustomSizeAccordion";

const ORDER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

interface ProductSummary {
  id: number;
  name: string | null;
  image_url: string | null;
  price: number | null;
}

interface OrderItemRow {
  id: number;
  product_id: number;
  size?: string | null;
  quantity: number;
  price_at_time: number | string;
  custom_measurements?: Record<string, string> | null;
  product?: ProductSummary | null;
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

const ORDER_ITEM_SELECT =
  "*, product:products(id, name, image_url, price)";

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

function measurementLabel(key: string): string {
  return MEASUREMENT_FIELDS.find((field) => field.key === key)?.label ?? key;
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
          .select("*, order_items(*, product:products(id, name, image_url, price))")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          if (!cancelled) setNotFound(true);
          return;
        }

        const rows = (data as unknown) as OrderRow;
        let items = Array.isArray(rows.order_items) ? rows.order_items : [];

        // Fallback: if the embedded join came back empty (e.g. RLS or schema
        // cache quirks), query order_items directly by order_id.
        if (items.length === 0) {
          const { data: directItems, error: directError } = await supabase
            .from("order_items")
            .select(ORDER_ITEM_SELECT)
            .eq("order_id", id);
          if (!directError && Array.isArray(directItems)) {
            items = directItems as unknown as OrderItemRow[];
          }
        }

        // Fallback: resolve any products the join did not populate.
        const missingProductIds = Array.from(
          new Set(
            items
              .filter((item) => !item.product && item.product_id)
              .map((item) => Number(item.product_id))
              .filter((productId) => Number.isFinite(productId) && productId > 0)
          )
        );
        if (missingProductIds.length > 0) {
          const { data: products, error: productError } = await supabase
            .from("products")
            .select("id, name, image_url, price")
            .in("id", missingProductIds);
          if (!productError && Array.isArray(products)) {
            const byId = new Map(
              products.map((p) => [
                Number(p.id),
                {
                  id: Number(p.id),
                  name: p.name != null ? String(p.name) : null,
                  image_url: p.image_url != null ? String(p.image_url) : null,
                  price: p.price != null ? Number(p.price) : null,
                } satisfies ProductSummary,
              ])
            );
            items = items.map((item) =>
              item.product
                ? item
                : { ...item, product: byId.get(Number(item.product_id)) ?? null }
            );
          }
        }

        if (cancelled) return;
        setOrder({
          ...rows,
          order_items: items,
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
          href="/hq-portal/orders"
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
          <Link href="/hq-portal/orders" className="text-xs text-charcoal/60 hover:text-charcoal flex items-center gap-1 mb-1">
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
              {order.order_items.map((item) => {
                const unitPrice = Number(item.price_at_time) || 0;
                const quantity = Number(item.quantity) || 1;
                const lineTotal = unitPrice * quantity;
                const productName =
                  item.product?.name || `Product #${item.product_id}`;
                const measurements = item.custom_measurements
                  ? Object.entries(item.custom_measurements).filter(
                      ([, value]) => value && String(value).trim() !== ""
                    )
                  : [];

                return (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex gap-4">
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-mist/30 bg-cream">
                        {item.product?.image_url ? (
                          <Image
                            src={item.product.image_url}
                            alt={productName}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] leading-tight text-charcoal/30">
                            No image
                          </span>
                        )}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-medium text-charcoal">
                              {productName}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-charcoal/50">
                              <span>Size: {item.size || "Standard"}</span>
                              <span aria-hidden>·</span>
                              <span>Qty: {quantity}</span>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="font-semibold text-charcoal">
                              {formatRupiah(lineTotal)}
                            </p>
                            {quantity > 1 && (
                              <p className="text-xs text-charcoal/50">
                                {quantity} × {formatRupiah(unitPrice)}
                              </p>
                            )}
                          </div>
                        </div>

                        {measurements.length > 0 && (
                          <ul className="space-y-0.5 rounded-lg bg-pastel-pink/5 p-3 text-xs text-charcoal/60">
                            <li className="mb-1 font-semibold uppercase tracking-wide text-charcoal/50">
                              Custom measurements
                            </li>
                            {measurements.map(([key, value]) => (
                              <li key={key} className="flex justify-between gap-4">
                                <span>{measurementLabel(key)}</span>
                                <span className="font-medium text-charcoal/80">
                                  {value} cm
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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