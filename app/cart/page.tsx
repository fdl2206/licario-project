"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/lib/formatCurrency";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const subtotal = useCartStore((state) => state.subtotal());

  if (items.length === 0) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-cream px-6 text-center">
        <span className="eyebrow text-charcoal/60">Your Bag</span>
        <h1 className="text-display-md text-charcoal">Your bag is empty</h1>
        <p className="max-w-sm font-body text-sm leading-relaxed text-charcoal/70">
          Discover pieces designed to be worn for years, not seasons.
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex h-12 items-center justify-center border border-charcoal px-8 font-body text-xs uppercase tracking-wide text-charcoal transition-colors duration-300 ease-luxe hover:bg-charcoal hover:text-cream"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-16 sm:px-8 sm:py-20">
      <div className="mb-10 flex flex-col items-center gap-2 text-center sm:mb-14">
        <span className="eyebrow text-charcoal/60">Review Your Order</span>
        <h1 className="text-display-md text-charcoal md:text-display-lg">
          Your Bag
        </h1>
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
                <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-white sm:h-20 sm:w-16">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  )}
                </div>

                {/* Name / size / remove */}
                <div className="flex flex-1 flex-col gap-1">
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-display text-base text-charcoal transition-colors duration-200 hover:text-navy"
                  >
                    {item.name}
                  </Link>
                  <span className="font-body text-xs text-charcoal/60">
                    Size {item.size}
                  </span>
                  <span className="font-body text-xs text-charcoal/60 sm:hidden">
                    {formatCurrency(item.price)} each
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.variantId)}
                    className="mt-1 w-fit font-body text-[11px] uppercase tracking-wide text-charcoal/50 underline-offset-2 transition-colors duration-200 hover:text-error hover:underline"
                  >
                    Remove
                  </button>
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
                    className="hairline flex h-8 w-8 items-center justify-center font-body text-sm text-charcoal transition-colors duration-200 hover:bg-charcoal hover:text-cream disabled:cursor-not-allowed disabled:border-mist disabled:text-charcoal/25 disabled:hover:bg-transparent disabled:hover:text-charcoal/25"
                  >
                    −
                  </button>

                  <span className="w-6 text-center font-body text-sm text-charcoal">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() =>
                      updateQuantity(item.variantId, item.quantity + 1)
                    }
                    className="hairline flex h-8 w-8 items-center justify-center font-body text-sm text-charcoal transition-colors duration-200 hover:bg-charcoal hover:text-cream"
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
        <div className="hairline w-full shrink-0 bg-white p-6 md:w-80">
          <h2 className="font-display text-lg text-charcoal">Order Summary</h2>
          <div className="rule-olive mt-4 mb-4 w-full" />

          <div className="flex items-center justify-between font-body text-sm text-charcoal/70">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between font-body text-sm text-charcoal/70">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>

          <div className="rule-olive mt-4 mb-4 w-full" />

          <div className="flex items-center justify-between font-body text-base text-charcoal">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          <Link
            href="/checkout"
            className="mt-6 flex h-12 w-full items-center justify-center bg-charcoal font-body text-xs uppercase tracking-wide text-cream transition-colors duration-300 ease-luxe hover:bg-navy"
          >
            Proceed to Checkout
          </Link>


          <Link
            href="/"
            className="mt-4 block text-center font-body text-xs uppercase tracking-wide text-charcoal/60 transition-colors duration-200 hover:text-charcoal"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
