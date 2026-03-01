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
    const msg = error instanceof Error ? error.message : String(error); return NextResponse.json({ error: msg }, { status: 500 });
  }
}
