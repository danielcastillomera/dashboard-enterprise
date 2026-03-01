import { NextResponse } from "next/server";
import { fetchPurchases } from "@/lib/db/data-source";

export async function GET() {
  try {
    const purchases = await fetchPurchases();
    return NextResponse.json({ purchases });
  } catch (error) {
    console.error("Purchases API error:", error);
    const msg = error instanceof Error ? error.message : String(error); return NextResponse.json({ error: msg }, { status: 500 });
  }
}
