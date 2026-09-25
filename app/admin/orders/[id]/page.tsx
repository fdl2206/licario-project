"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [status, setStatus] = useState("Pending");

  // Placeholder order details for UI review
  const order = {
    id: id || "ORD-9421",
    date: "September 12, 2026",
    customer: {
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "+62 812-3456-7890",
      shippingAddress: "Jl. Sudirman No. 45, Kebayoran Baru, Jakarta Selatan, 12190",
    },
    items: [
      { id: 1, name: "Classic Silk Shirt", quantity: 1, price: 650000 },
      { id: 2, name: "Linen Wide Leg Pants", quantity: 1, price: 490000 },
    ],
    total: 1140000,
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/orders" className="text-xs text-charcoal/60 hover:text-charcoal flex items-center gap-1 mb-1">
            ← Back to Orders
          </Link>
          <h1 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
            Order {order.id}
          </h1>
          <p className="mt-1 text-sm text-charcoal/60">Placed on {order.date}</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-charcoal">Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-mist/60 bg-white px-3 py-2 text-sm font-medium text-charcoal"
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="md:col-span-2 rounded-2xl border border-mist/40 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-charcoal">Order Items</h2>
          <div className="divide-y divide-mist/30">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium text-charcoal">{item.name}</p>
                  <p className="text-xs text-charcoal/50">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium text-charcoal">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-mist/30 pt-4 flex justify-between items-center">
            <span className="font-semibold text-charcoal">Total Amount</span>
            <span className="text-lg font-bold text-charcoal">Rp {order.total.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* Customer & Shipping */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-mist/40 bg-white p-6 shadow-sm space-y-3 text-sm">
            <h2 className="text-base font-semibold text-charcoal">Customer Details</h2>
            <div>
              <p className="font-medium text-charcoal">{order.customer.name}</p>
              <p className="text-charcoal/60">{order.customer.email}</p>
              <p className="text-charcoal/60">{order.customer.phone}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-mist/40 bg-white p-6 shadow-sm space-y-3 text-sm">
            <h2 className="text-base font-semibold text-charcoal">Shipping Address</h2>
            <p className="text-charcoal/70">{order.customer.shippingAddress}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
