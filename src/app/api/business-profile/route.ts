import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { getCurrentTenantId } = await import("@/lib/db/get-tenant");
    const { prisma } = await import("@/lib/prisma");
    const tenantId = await getCurrentTenantId();
    const bp = await prisma.businessProfile.findUnique({ where: { tenantId } });
    return NextResponse.json(bp ?? null);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { getCurrentTenantId } = await import("@/lib/db/get-tenant");
    const { upsertBusinessProfile } = await import("@/lib/billing/queries");
    const tenantId = await getCurrentTenantId();
    const body = await req.json();
    const bp = await upsertBusinessProfile(tenantId, body);
    return NextResponse.json(bp);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
