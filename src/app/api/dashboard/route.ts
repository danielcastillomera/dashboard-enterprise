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
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Error al cargar datos del dashboard" }, { status: 500 });
  }
}
