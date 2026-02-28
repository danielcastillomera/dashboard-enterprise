import { NextRequest, NextResponse } from "next/server";
import { fetchSales } from "@/lib/db/data-source";

export async function GET(request: NextRequest) {
  try {
    const from = request.nextUrl.searchParams.get("from");
    const to = request.nextUrl.searchParams.get("to");
    const filter: { from?: Date; to?: Date } = {};
    if (from) filter.from = new Date(from);
    if (to) filter.to = new Date(to + "T23:59:59");

    const sales = await fetchSales(Object.keys(filter).length > 0 ? filter : undefined);
    return NextResponse.json({ sales });
  } catch (error) {
    console.error("Sales API error:", error);
    return NextResponse.json({ error: "Error al cargar ventas" }, { status: 500 });
  }
}
