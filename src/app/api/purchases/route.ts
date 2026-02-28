import { NextResponse } from "next/server";
import { fetchPurchases } from "@/lib/db/data-source";

export async function GET() {
  try {
    const purchases = await fetchPurchases();
    return NextResponse.json({ purchases });
  } catch (error) {
    console.error("Purchases API error:", error);
    return NextResponse.json({ error: "Error al cargar compras" }, { status: 500 });
  }
}
