"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useOrderStore, type OrderStatus } from "@/store/useOrderStore";
import { formatCurrency } from "@/lib/formatCurrency";

const STATUS_STYLES: Record<OrderStatus, string> = {
  Success: "bg-olive/15 text-olive",
  Pending: "bg-pastel-peach text-charcoal/80",
  Failed: "bg-error/10 text-error",
};

export default function OrdersPage() {
  const orders = useOrderStore((state) => state.orders);

  const handleCompletePayment = (snapToken: string) => {
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
        <span className="eyebrow text-charcoal/60">Order History</span>
        <h1 className="text-display-md text-charcoal">No orders yet</h1>
        <p className="max-w-sm font-body text-sm leading-relaxed text-charcoal/70">
          Your past orders will appear here once you complete a purchase.
        </p>
        <Link
          href="/shop"
          className="mt-2 inline-flex h-12 items-center justify-center border border-charcoal px-8 font-body text-xs uppercase tracking-wide text-charcoal transition-colors duration-300 ease-luxe hover:bg-charcoal hover:text-cream"
        >
          Start Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-16 sm:px-8 sm:py-20">
      <div className="mb-12 flex flex-col items-center gap-2 text-center sm:mb-16">
        <span className="eyebrow text-charcoal/60">Your Orders</span>
        <h1 className="text-display-md text-charcoal md:text-display-lg">
          Order History
        </h1>
      </div>

      <div className="flex flex-col gap-6">
        {orders.map((order) => (
          <div key={order.orderId} className="hairline bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="font-body text-[11px] uppercase tracking-luxe text-charcoal/50">
                  Order ID
                </span>
                <p className="font-display text-base text-charcoal">
                  {order.orderId}
                </p>
                <p className="mt-1 font-body text-xs text-charcoal/50">
                  {new Date(order.createdAt).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 font-body text-xs uppercase tracking-wide ${STATUS_STYLES[order.status]}`}
              >
                {order.status}
              </span>
            </div>

            <div className="rule-olive my-5 w-full" />

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
              <span className="font-body text-sm text-charcoal/70">
                Total
              </span>
              <span className="font-display text-lg text-charcoal">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>

            {order.status === "Pending" && (
              <button
                type="button"
                onClick={() => handleCompletePayment(order.snapToken)}
                className="mt-6 flex h-12 w-full items-center justify-center bg-charcoal font-body text-xs uppercase tracking-wide text-cream transition-colors duration-300 ease-luxe hover:bg-navy"
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
