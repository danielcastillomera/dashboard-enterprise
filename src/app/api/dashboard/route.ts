import { NextResponse } from "next/server";
import {
  fetchDashboardKPIs,
  fetchFinancialSummary,
  fetchMonthlySales,
  fetchCategorySales,
  fetchTopProducts,
  fetchRecentOrders,
  fetchInventoryAlerts,
} from "@/lib/db/data-source";

export async function GET() {
  try {
    const [kpis, financial, monthlySales, categorySales, topProducts, recentOrders, inventoryAlerts] =
      await Promise.all([
        fetchDashboardKPIs(),
        fetchFinancialSummary(),
        fetchMonthlySales(),
        fetchCategorySales(),
        fetchTopProducts(5),
        fetchRecentOrders(5),
        fetchInventoryAlerts(),
      ]);

    return NextResponse.json({
      kpis, financial, monthlySales, categorySales, topProducts, recentOrders, inventoryAlerts,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Dashboard API error:", msg);
    return NextResponse.json({ error: `Error: ${msg}` }, { status: 500 });
  }
}
