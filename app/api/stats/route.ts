import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface OrderRow {
  status: string;
  total_amount: number | string;
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}

function isPending(status: string): boolean {
  return status === "pending" || status === "Pending";
}

function isCompleted(status: string): boolean {
  return (
    status === "completed" ||
    status === "Completed" ||
    status === "success" ||
    status === "Success"
  );
}

export async function GET() {
  try {
    const { count: totalProducts, error: productError } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true });

    const { data: orders, error: orderError } = await supabase
      .from("orders")
      .select("status, total_amount");

    if (productError) throw productError;
    if (orderError) throw orderError;

    const rows = (orders || []) as OrderRow[];
    const pendingOrders = rows.filter((o) => isPending(o.status)).length;
    const completedOrders = rows.filter((o) => isCompleted(o.status)).length;
    const totalRevenue = rows
      .filter((o) => isCompleted(o.status))
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    return NextResponse.json({
      totalProducts: totalProducts ?? 0,
      pendingOrders,
      completedOrders,
      totalRevenue,
    });
  } catch (err) {
    console.error("Supabase Stats error:", err);
    return NextResponse.json(
      { error: getErrorMessage(err) },
      { status: 500 }
    );
  }
}