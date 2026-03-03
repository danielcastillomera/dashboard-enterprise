import { NextResponse } from "next/server";
import { fetchCategories } from "@/lib/db/data-source";

export async function GET() {
  try {
    const categories = await fetchCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Categories API error:", error);
    const msg = error instanceof Error ? error.message : String(error); return NextResponse.json({ error: msg }, { status: 500 });
  }
}
