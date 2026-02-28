import { NextResponse } from "next/server";
import { fetchCategories } from "@/lib/db/data-source";

export async function GET() {
  try {
    const categories = await fetchCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json({ error: "Error al cargar categorías" }, { status: 500 });
  }
}
