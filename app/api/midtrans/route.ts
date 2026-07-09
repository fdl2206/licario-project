import { NextRequest, NextResponse } from "next/server";
import midtransClient from "midtrans-client";

interface CheckoutItemPayload {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutRequestBody {
  items: CheckoutItemPayload[];
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  grossAmount: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CheckoutRequestBody;
    const { items, customer, grossAmount } = body;

    if (!items?.length || !grossAmount) {
      return NextResponse.json(
        { error: "Missing order items or amount." },
        { status: 400 }
      );
    }

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    });

    const orderId = `LICARIO-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      item_details: items.map((item) => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        name: item.name.slice(0, 50),
      })),
      customer_details: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        billing_address: {
          address: customer.address,
          city: customer.city,
        },
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
      orderId,
    });
  } catch (error) {
    console.error("Midtrans transaction error:", error);
    return NextResponse.json(
      { error: "Failed to create Midtrans transaction." },
      { status: 500 }
    );
  }
}
