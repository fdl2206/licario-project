"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCartStore } from "@/store/useCartStore";
import { useOrderStore, type OrderStatus } from "@/store/useOrderStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { supabase } from "@/lib/supabase";


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
      const customerName = `${values.firstName} ${values.lastName}`;
      const customerAddress = `${values.address}${values.apartment ? `, ${values.apartment}` : ""}, ${values.city}, ${values.province}, ${values.postalCode}`;

      // 1. Insert ke tabel 'orders' di Supabase
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: customerName,
          customer_phone: values.phone,
          customer_address: customerAddress,
          total_amount: subtotal,
          status: "pending",
        })
        .select("id")
        .single();

      if (orderError) throw orderError;
      const orderId = orderData.id;

      // 2. Insert ke tabel 'order_items' (bulk insert)
      const orderItemsToInsert = items.map((item) => ({
        order_id: orderId,
        product_id: item.productId,
        size: item.size,
        quantity: item.quantity,
        price_at_time: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      // 3. Format pesan WhatsApp
      const waNumber = "6281231740217";
      const itemDetails = items
        .map((item) => {
          let line = `- ${item.name} (${item.size}) x ${item.quantity}`;
          if (item.customMeasurements) {
            const { height, weight, sleeveLength, dressLength } = item.customMeasurements;
            const measures = [
              height && `Tinggi ${height}cm`,
              weight && `Berat ${weight}kg`,
              sleeveLength && `Lengan ${sleeveLength}cm`,
              dressLength && `Baju ${dressLength}cm`,
            ].filter(Boolean).join(", ");
            if (measures) line += `\n  - Custom Size: ${measures}`;
          }
          return line;
        })
        .join("\n");

      const message = `Halo Licario, saya ingin mengonfirmasi pesanan saya:

*Order ID:* ${orderId}
*Nama:* ${customerName}
*Telepon:* ${values.phone}

*Daftar Barang:*
${itemDetails}

*Total Harga:* ${formatCurrency(subtotal)}

*Alamat Pengiriman:*
${customerAddress}

Mohon instruksi selanjutnya untuk pembayaran. Terima kasih.`;

      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

      // 4. Redirect ke WhatsApp dan Finalisasi
      toast.success("Pesanan berhasil dibuat!", {
        description: "Mengarahkan ke WhatsApp untuk konfirmasi...",
      });

      // Simpan di order store lokal juga untuk history
      addOrder({
        orderId: orderId,
        totalAmount: subtotal,
        status: "Pending",
        items: items.map((i) => ({
          id: i.variantId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        snapToken: "", // Tidak digunakan lagi
        createdAt: new Date().toISOString(),
      });

      // Tunggu sebentar sebelum redirect agar user bisa baca toast
      setTimeout(() => {
        window.open(waUrl, "_blank");
        clearCart();
        router.push("/orders");
      }, 1500);

    } catch (err) {
      console.error("Checkout error:", err);
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast.error("Gagal memproses pesanan", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: keyof FormValues) =>
    `hairline h-12 w-full rounded-xl bg-white px-5 font-body text-sm text-charcoal placeholder:text-charcoal/40 focus:ring-2 focus:ring-pastel-peach/50 focus:outline-none transition-all ${
      showError(field) ? "border-red-400" : "border-mist/50"
    }`;

  if (items.length === 0) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-cream px-6 text-center">
        <span className="eyebrow text-pastel-pink font-semibold">Checkout</span>
        <h1 className="text-display-md font-medium text-charcoal">
          Your bag is empty
        </h1>
        <p className="max-w-sm font-body text-sm leading-relaxed text-charcoal/60">
          Add something to your bag before proceeding to checkout.
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
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-16 sm:px-8 sm:py-20">
      <div className="mb-12 flex flex-col items-center gap-3 text-center sm:mb-20">
        <span className="eyebrow text-pastel-pink font-semibold">Secure Checkout</span>
        <h1 className="text-display-md font-medium text-charcoal md:text-display-lg">
          Checkout
        </h1>
        <div className="rule-olive mt-4 w-16" />
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
            className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-pastel-peach px-8 font-body text-xs font-semibold uppercase tracking-wide text-charcoal shadow-md transition-all duration-300 ease-luxe hover:bg-pastel-pink hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : "Place Order"}
          </button>

          <Link
            href="/cart"
            className="text-center font-body text-xs uppercase tracking-wide text-charcoal/40 transition-colors duration-200 hover:text-charcoal"
          >
            Return to Bag
          </Link>
        </form>

        {/* Right — order summary */}
        <div className="rounded-3xl border border-mist/30 bg-white p-8 shadow-card h-fit">
          <h2 className="font-display text-xl font-medium text-charcoal">Order Summary</h2>
          <div className="rule-olive mt-4 mb-6 w-full" />

          <ul className="flex flex-col gap-6">
            {items.map((item) => (
              <li key={item.variantId} className="flex items-center gap-4">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-mist/20 bg-cream">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-pastel-purple shadow-sm px-1 text-[9px] font-semibold leading-none text-charcoal">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="font-body text-sm font-medium text-charcoal">
                    {item.name}
                  </span>
                  <span className="font-body text-[11px] uppercase tracking-wide text-charcoal/40">
                    Size {item.size}
                  </span>
                </div>
                <span className="font-body text-sm font-medium text-charcoal">
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
