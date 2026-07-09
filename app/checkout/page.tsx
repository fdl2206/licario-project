"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCartStore } from "@/store/useCartStore";
import { useOrderStore, type OrderStatus } from "@/store/useOrderStore";
import { formatCurrency } from "@/lib/formatCurrency";


interface FormValues {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
}

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

const INITIAL_VALUES: FormValues = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  apartment: "",
  city: "",
  province: "",
  postalCode: "",
  phone: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIGITS_PATTERN = /^\d+$/;

type FormErrors = Partial<Record<keyof FormValues, string>>;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.firstName.trim()) errors.firstName = "First name is required.";
  if (!values.lastName.trim()) errors.lastName = "Last name is required.";
  if (!values.address.trim()) errors.address = "Street address is required.";
  if (!values.city.trim()) errors.city = "City is required.";
  if (!values.province.trim()) errors.province = "Province is required.";

  if (!values.postalCode.trim()) {
    errors.postalCode = "Postal code is required.";
  } else if (!DIGITS_PATTERN.test(values.postalCode.trim())) {
    errors.postalCode = "Postal code must contain numbers only.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!DIGITS_PATTERN.test(values.phone.trim())) {
    errors.phone = "Phone number must contain numbers only.";
  }

  return errors;
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal());
  const clearCart = useCartStore((state) => state.clearCart);
  const addOrder = useOrderStore((state) => state.addOrder);


  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = useMemo(() => validate(values), [values]);
  const isValid = Object.keys(errors).length === 0;

  const handleChange =
    (field: keyof FormValues, sanitize?: (raw: string) => string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = sanitize ? sanitize(e.target.value) : e.target.value;
      setValues((prev) => ({ ...prev, [field]: raw }));
    };

  const handleBlur = (field: keyof FormValues) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const showError = (field: keyof FormValues) =>
    touched[field] && errors[field] ? errors[field] : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      email: true,
      firstName: true,
      lastName: true,
      address: true,
      city: true,
      province: true,
      postalCode: true,
      phone: true,
    });
    if (!isValid || items.length === 0) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/midtrans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.variantId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          customer: {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone,
            address: values.address,
            city: values.city,
          },
          grossAmount: subtotal,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        throw new Error(data.error ?? "Failed to create transaction.");
      }

      if (!window.snap) {
        throw new Error("Payment popup failed to load. Please refresh and try again.");
      }

      const orderItems = items.map((item) => ({
        id: item.variantId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const recordOrder = (status: OrderStatus) => {
        addOrder({
          orderId: data.orderId,
          totalAmount: subtotal,
          status,
          items: orderItems,
          snapToken: data.token,
          createdAt: new Date().toISOString(),
        });
      };

      window.snap.pay(data.token, {
        onSuccess: () => {
          toast.success("Payment successful!", {
            description: "Thank you for shopping with Licario.",
          });
          recordOrder("Success");
          clearCart();
          router.push("/orders");
        },
        onPending: () => {
          toast.info("Payment pending", {
            description: "Please complete your payment to confirm the order.",
          });
          recordOrder("Pending");
          clearCart();
          router.push("/orders");
        },
        onError: () => {
          toast.error("Payment failed", {
            description: "Something went wrong. Please try again.",
          });
          recordOrder("Failed");
          router.push("/orders");
        },
        onClose: () => {
          toast.info("Payment window closed", {
            description: "You can resume checkout anytime.",
          });
        },
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast.error("Unable to start payment", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: keyof FormValues) =>
    `hairline h-12 w-full bg-white px-4 font-body text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none ${
      showError(field) ? "border-red-500" : ""
    }`;

  if (items.length === 0) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-cream px-6 text-center">
        <span className="eyebrow text-charcoal/60">Checkout</span>
        <h1 className="text-display-md text-charcoal">
          Your bag is empty
        </h1>
        <p className="max-w-sm font-body text-sm leading-relaxed text-charcoal/70">
          Add something to your bag before proceeding to checkout.
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
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-16 sm:px-8 sm:py-20">
      <div className="mb-12 flex flex-col items-center gap-2 text-center sm:mb-16">
        <span className="eyebrow text-charcoal/60">Secure Checkout</span>
        <h1 className="text-display-md text-charcoal md:text-display-lg">
          Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.2fr_1fr]">
        {/* Left — shipping / contact form */}
        <form className="flex flex-col gap-10" onSubmit={handleSubmit} noValidate>
          {/* Contact */}
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-lg text-charcoal">Contact</h2>
            <div>
              <input
                type="email"
                required
                placeholder="Email address"
                value={values.email}
                onChange={handleChange("email")}
                onBlur={handleBlur("email")}
                className={inputClass("email")}
              />
              {showError("email") && (
                <p className="mt-1.5 font-body text-xs text-red-500">
                  {showError("email")}
                </p>
              )}
            </div>
          </section>

          {/* Shipping address */}
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-lg text-charcoal">
              Shipping Address
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <input
                  type="text"
                  required
                  placeholder="First name"
                  value={values.firstName}
                  onChange={handleChange("firstName")}
                  onBlur={handleBlur("firstName")}
                  className={inputClass("firstName")}
                />
                {showError("firstName") && (
                  <p className="mt-1.5 font-body text-xs text-red-500">
                    {showError("firstName")}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Last name"
                  value={values.lastName}
                  onChange={handleChange("lastName")}
                  onBlur={handleBlur("lastName")}
                  className={inputClass("lastName")}
                />
                {showError("lastName") && (
                  <p className="mt-1.5 font-body text-xs text-red-500">
                    {showError("lastName")}
                  </p>
                )}
              </div>
            </div>

            <div>
              <input
                type="text"
                required
                placeholder="Street address"
                value={values.address}
                onChange={handleChange("address")}
                onBlur={handleBlur("address")}
                className={inputClass("address")}
              />
              {showError("address") && (
                <p className="mt-1.5 font-body text-xs text-red-500">
                  {showError("address")}
                </p>
              )}
            </div>

            <input
              type="text"
              placeholder="Apartment, suite, etc. (optional)"
              value={values.apartment}
              onChange={handleChange("apartment")}
              className="hairline h-12 w-full bg-white px-4 font-body text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={values.city}
                  onChange={handleChange("city")}
                  onBlur={handleBlur("city")}
                  className={inputClass("city")}
                />
                {showError("city") && (
                  <p className="mt-1.5 font-body text-xs text-red-500">
                    {showError("city")}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Province"
                  value={values.province}
                  onChange={handleChange("province")}
                  onBlur={handleBlur("province")}
                  className={inputClass("province")}
                />
                {showError("province") && (
                  <p className="mt-1.5 font-body text-xs text-red-500">
                    {showError("province")}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  placeholder="Postal code"
                  value={values.postalCode}
                  onChange={handleChange("postalCode", (raw) =>
                    raw.replace(/\D/g, "")
                  )}
                  onBlur={handleBlur("postalCode")}
                  className={inputClass("postalCode")}
                />
                {showError("postalCode") && (
                  <p className="mt-1.5 font-body text-xs text-red-500">
                    {showError("postalCode")}
                  </p>
                )}
              </div>
            </div>

            <div>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                placeholder="Phone number"
                value={values.phone}
                onChange={handleChange("phone", (raw) => raw.replace(/\D/g, ""))}
                onBlur={handleBlur("phone")}
                className={inputClass("phone")}
              />
              {showError("phone") && (
                <p className="mt-1.5 font-body text-xs text-red-500">
                  {showError("phone")}
                </p>
              )}
            </div>
          </section>

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="mt-2 flex h-12 w-full items-center justify-center bg-charcoal font-body text-xs uppercase tracking-wide text-cream transition-colors duration-300 ease-luxe hover:bg-navy disabled:cursor-not-allowed disabled:bg-charcoal/30"
          >
            {isSubmitting ? "Processing..." : "Place Order"}
          </button>

          <Link
            href="/cart"
            className="text-center font-body text-xs uppercase tracking-wide text-charcoal/60 transition-colors duration-200 hover:text-charcoal"
          >
            Return to Bag
          </Link>
        </form>

        {/* Right — order summary */}
        <div className="hairline h-fit w-full bg-white p-6">
          <h2 className="font-display text-lg text-charcoal">Order Summary</h2>
          <div className="rule-olive mt-4 mb-4 w-full" />

          <ul className="flex flex-col gap-4">
            {items.map((item) => (
              <li key={item.variantId} className="flex items-center gap-3">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-cream">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center bg-charcoal px-1 text-[10px] leading-none text-cream">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="font-body text-sm text-charcoal">
                    {item.name}
                  </span>
                  <span className="font-body text-xs text-charcoal/50">
                    Size {item.size}
                  </span>
                </div>
                <span className="font-body text-sm text-charcoal">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="rule-olive mt-6 mb-4 w-full" />

          <div className="flex items-center justify-between font-body text-sm text-charcoal/70">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between font-body text-sm text-charcoal/70">
            <span>Shipping</span>
            <span>Free</span>
          </div>

          <div className="rule-olive mt-4 mb-4 w-full" />

          <div className="flex items-center justify-between font-body text-base text-charcoal">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
