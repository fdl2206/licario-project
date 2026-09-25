"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/lib/formatCurrency";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const subtotal = useCartStore((state) => state.subtotal());

  if (items.length === 0) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-cream px-6 text-center">
        <span className="eyebrow text-pastel-pink font-semibold">Your Bag</span>
        <h1 className="text-display-md font-medium text-charcoal">Your bag is empty</h1>
        <p className="max-w-sm font-body text-sm leading-relaxed text-charcoal/60">
          Discover pieces designed to be worn for years, not seasons.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex h-12 items-center justify-center rounded-xl bg-pastel-peach px-10 font-body text-xs font-semibold uppercase tracking-wide text-charcoal shadow-sm transition-all duration-300 ease-luxe hover:bg-pastel-pink hover:scale-105"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-16 sm:px-8 sm:py-20">
      <div className="mb-10 flex flex-col items-center gap-3 text-center sm:mb-20">
        <span className="eyebrow text-pastel-pink font-semibold">Review Your Order</span>
        <h1 className="text-display-md font-medium text-charcoal md:text-display-lg">
          Your Bag
        </h1>
        <div className="rule-olive mt-4 w-16" />
      </div>

      <div className="flex flex-col gap-10 md:flex-row md:items-start">
        {/* Line items */}
        <div className="flex-1">
          <div className="hidden grid-cols-[80px_1fr_auto_auto] gap-4 border-b border-mist pb-3 font-body text-[11px] uppercase tracking-luxe text-charcoal/50 sm:grid">
            <span>Item</span>
            <span>Product</span>
            <span>Qty</span>
            <span className="text-right">Total</span>
          </div>

          <ul className="divide-y divide-mist">
            {items.map((item) => (
              <li
                key={item.variantId}
                className="flex items-start gap-4 py-6 sm:grid sm:grid-cols-[80px_1fr_auto_auto] sm:items-center sm:gap-4"
              >
                {/* Image */}
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-mist/20 bg-white shadow-sm sm:h-20 sm:w-16">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/file.svg";
                      }}
                    />
                  )}
                </div>

                {/* Name / size / remove / custom measurements */}
                <div className="flex flex-1 flex-col gap-1">
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-display text-base font-medium text-charcoal transition-colors duration-200 hover:text-pastel-pink"
                  >
                    {item.name}
                  </Link>
                  <span className="font-body text-xs text-charcoal/60">
                    Size {item.size}
                  </span>
                  {item.customMeasurements && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-pastel-peach/70 px-2 py-0.5 font-body text-[9px] font-semibold uppercase tracking-wider text-charcoal">
                      Custom Tailored
                    </span>
                  )}
                  {item.customMeasurements && (
                    <ul className="mt-1 flex flex-wrap gap-1.5">
                      {[
                        ["Shoulder", "shoulder"],
                        ["Bust", "bust"],
                        ["Waist", "waist"],
                        ["Hips", "hips"],
                        ["Arm Length", "armLength"],
                        ["Arm Hole", "armHole"],
                      ]
                        .filter(([, key]) => {
                          const v = (item.customMeasurements as Record<string, string>)[key];
                          return v && v.trim() !== "";
                        })
                        .map(([label, key]) => (
                          <li
                            key={key}
                            className="rounded-full border border-mist/30 bg-cream px-1.5 py-0.5 font-body text-[10px] text-charcoal/70"
                          >
                            {label}: {(item.customMeasurements as Record<string, string>)[key]} cm
                          </li>
                        ))}
                    </ul>
                  )}
                  <span className="font-body text-xs text-charcoal/60 sm:hidden">
                    {formatCurrency(item.price)} each
                  </span>
                </div>

                {/* Quantity */}
                <div className="mt-3 flex items-center gap-2 sm:mt-0">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={item.quantity <= 1}
                    onClick={() =>
                      updateQuantity(item.variantId, item.quantity - 1)
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-mist bg-white font-body text-sm text-charcoal shadow-sm transition-all duration-200 hover:border-pastel-pink hover:bg-pastel-pink/10 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    −
                  </button>

                  <span className="w-8 text-center font-body text-sm font-medium text-charcoal">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() =>
                      updateQuantity(item.variantId, item.quantity + 1)
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-mist bg-white font-body text-sm text-charcoal shadow-sm transition-all duration-200 hover:border-pastel-pink hover:bg-pastel-pink/10"
                  >
                    +
                  </button>
                </div>

                {/* Line total */}
                <div className="mt-3 text-right font-body text-sm text-charcoal sm:mt-0">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary */}
        <div className="rounded-3xl border border-mist/30 bg-white p-8 shadow-card md:w-80 h-fit">
          <h2 className="font-display text-xl font-medium text-charcoal">Order Summary</h2>
          <div className="rule-olive mt-4 mb-6 w-full" />

          <div className="flex items-center justify-between font-body text-sm text-charcoal/60">
            <span>Subtotal</span>
            <span className="font-medium text-charcoal">{formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-4 flex items-center justify-between font-body text-sm text-charcoal/60">
            <span>Shipping</span>
            <span className="text-[11px] uppercase tracking-wide italic">TBC</span>
          </div>

          <div className="rule-olive mt-6 mb-6 w-full" />

          <div className="flex items-center justify-between font-body text-base text-charcoal">
            <span className="font-medium">Total</span>
            <span className="font-display text-xl font-semibold">{formatCurrency(subtotal)}</span>
          </div>

          <Link
            href="/checkout"
            className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-pastel-peach px-8 font-body text-xs font-semibold uppercase tracking-wide text-charcoal shadow-md transition-all duration-300 ease-luxe hover:bg-pastel-pink hover:scale-[1.02]"
          >
            Proceed to Checkout
          </Link>

          <Link
            href="/"
            className="mt-4 block text-center font-body text-xs uppercase tracking-wide text-charcoal/40 transition-colors duration-200 hover:text-charcoal"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}