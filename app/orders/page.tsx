"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useOrderStore, type OrderStatus } from "@/store/useOrderStore";
import { formatCurrency } from "@/lib/formatCurrency";

const STATUS_STYLES: Record<OrderStatus, string> = {
  Success: "bg-success/15 text-success rounded-full",
  Pending: "bg-pastel-peach text-charcoal/80 rounded-full",
  Failed: "bg-error/10 text-error rounded-full",
};

export default function OrdersPage() {
  const orders = useOrderStore((state) => state.orders);

  const handleCompletePayment = (snapToken?: string) => {
    if (!snapToken) {
      toast.error("Payment link unavailable", {
        description: "Please contact our team to complete payment.",
      });
      return;
    }
    if (!window.snap) {
      toast.error("Payment popup unavailable", {
        description: "Please refresh the page and try again.",
      });
      return;
    }
    window.snap.pay(snapToken, {
      onSuccess: () => {
        toast.success("Payment successful!", {
          description: "Thank you for shopping with Licario.",
        });
      },
      onPending: () => {
        toast.info("Payment still pending", {
          description: "Please complete your payment to confirm the order.",
        });
      },
      onError: () => {
        toast.error("Payment failed", {
          description: "Something went wrong. Please try again.",
        });
      },
    });
  };

  if (orders.length === 0) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-cream px-6 text-center">
        <span className="eyebrow text-pastel-pink font-semibold">Order History</span>
        <h1 className="text-display-md font-medium text-charcoal">No orders yet</h1>
        <p className="max-w-sm font-body text-sm leading-relaxed text-charcoal/60">
          Your past orders will appear here once you complete a purchase.
        </p>
        <Link
          href="/shop"
          className="mt-4 inline-flex h-12 items-center justify-center rounded-xl bg-pastel-peach px-10 font-body text-xs font-semibold uppercase tracking-wide text-charcoal shadow-sm transition-all duration-300 ease-luxe hover:bg-pastel-pink hover:scale-105"
        >
          Start Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-16 sm:px-8 sm:py-20">
      <div className="mb-12 flex flex-col items-center gap-3 text-center sm:mb-20">
        <span className="eyebrow text-pastel-pink font-semibold">Your Orders</span>
        <h1 className="text-display-md font-medium text-charcoal md:text-display-lg">
          Order History
        </h1>
        <div className="rule-olive mt-4 w-16" />
      </div>

      <div className="flex flex-col gap-8">
        {orders.map((order) => (
          <div key={order.orderId} className="rounded-3xl border border-mist/30 bg-white p-6 shadow-card transition-all hover:shadow-card-hover sm:p-10">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <span className="font-body text-[11px] uppercase tracking-luxe text-charcoal/40">
                  Order ID
                </span>
                <p className="font-display text-lg font-medium text-charcoal">
                  {order.orderId}
                </p>
                <p className="mt-1 font-body text-xs text-charcoal/40 italic">
                  {new Date(order.createdAt).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-4 py-1.5 font-body text-[10px] font-semibold uppercase tracking-widest shadow-sm ${STATUS_STYLES[order.status]}`}
              >
                {order.status}
              </span>
            </div>

            <div className="rule-olive my-8 w-full opacity-60" />

            <ul className="flex flex-col gap-3">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between font-body text-sm text-charcoal/80"
                >
                  <span>
                    {item.name}{" "}
                    <span className="text-charcoal/50">× {item.quantity}</span>
                  </span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="rule-olive my-5 w-full" />

            <div className="flex items-center justify-between">
              <span className="font-body text-sm font-medium text-charcoal/60">
                Total Amount
              </span>
              <span className="font-display text-2xl font-semibold text-charcoal">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>

            {order.status === "Pending" && (
              <button
                type="button"
                onClick={() => handleCompletePayment(order.snapToken)}
                className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-pastel-peach px-8 font-body text-xs font-semibold uppercase tracking-wide text-charcoal shadow-md transition-all duration-300 ease-luxe hover:bg-pastel-pink hover:scale-[1.02]"
              >
                Complete Payment
              </button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
