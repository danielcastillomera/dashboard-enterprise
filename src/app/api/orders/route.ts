import { NextRequest, NextResponse } from "next/server";
import { fetchOrders } from "@/lib/db/data-source";

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status") || undefined;
    const search = request.nextUrl.searchParams.get("search") || undefined;
    const orders = await fetchOrders({ status, search });
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json({ error: "Error al cargar pedidos" }, { status: 500 });
  }
}
