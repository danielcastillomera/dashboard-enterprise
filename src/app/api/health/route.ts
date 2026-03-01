import { NextResponse } from "next/server";

/* Health check — useful for debugging Vercel deploy issues */
export async function GET() {
  const checks: Record<string, string> = {};

  // 1. Environment variables
  checks.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅" : "❌ MISSING";
  checks.SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅" : "❌ MISSING";
  checks.SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅" : "❌ MISSING";
  checks.DATABASE_URL = process.env.DATABASE_URL ? "✅" : "❌ MISSING";
  checks.DIRECT_URL = process.env.DIRECT_URL ? "✅" : "❌ MISSING";
  checks.USE_REAL_DB = process.env.USE_REAL_DB || "❌ NOT SET";

  // 2. Database connection
  try {
    const { prisma } = await import("@/lib/prisma");
    const count = await prisma.tenant.count();
    checks.DB_CONNECTION = `✅ Connected (${count} tenants)`;
  } catch (error) {
    checks.DB_CONNECTION = `❌ ${error instanceof Error ? error.message : String(error)}`;
  }

  // 3. Auth session
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    checks.AUTH_SESSION = user ? `✅ ${user.email}` : "⚠️ No session (not logged in)";
  } catch (error) {
    checks.AUTH_SESSION = `❌ ${error instanceof Error ? error.message : String(error)}`;
  }

  const allOk = !Object.values(checks).some((v) => v.startsWith("❌"));

  return NextResponse.json({
    status: allOk ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    checks,
  });
}
