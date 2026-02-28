import { NextRequest, NextResponse } from "next/server";
import { fetchProducts, fetchCategories } from "@/lib/db/data-source";

export async function GET(request: NextRequest) {
  try {
    const filter = request.nextUrl.searchParams.get("filter") || undefined;
    const [products, categories] = await Promise.all([
      fetchProducts(filter),
      fetchCategories(),
    ]);
    return NextResponse.json({ products, categories });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json({ error: "Error al cargar productos" }, { status: 500 });
  }
}
