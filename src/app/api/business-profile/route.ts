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

    // Only pass fields that exist in the BusinessProfile model
    const validData = {
      ruc: body.ruc,
      razonSocial: body.razonSocial,
      nombreComercial: body.nombreComercial || undefined,
      direccionMatriz: body.direccionMatriz,
      direccionSucursal: body.direccionSucursal || undefined,
      telefono: body.telefono || undefined,
      email: body.email || undefined,
      website: body.website || undefined,
      logoUrl: body.logoUrl || undefined,
      ambiente: body.ambiente || "PRUEBAS",
      obligadoContabilidad: body.obligadoContabilidad ?? false,
      contribuyenteEspecial: body.contribuyenteEspecial || undefined,
      regimenRimpe: body.regimenRimpe ?? false,
      ivaRate: body.ivaRate ?? 15,
      establishment: body.establishment || "001",
      emissionPoint: body.emissionPoint || "001",
    };

    const bp = await upsertBusinessProfile(tenantId, validData);
    return NextResponse.json(bp);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
