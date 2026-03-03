import { NextResponse } from "next/server";
import { getInvoicesAction, createInvoiceAction, getInvoiceStatsAction } from "@/lib/actions/billing";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get("stats") === "true") {
      const result = await getInvoiceStatsAction();
      if (!result.success) return NextResponse.json({ error: result.message }, { status: 500 });
      return NextResponse.json(result.data);
    }
    const result = await getInvoicesAction();
    if (!result.success) return NextResponse.json({ error: result.message }, { status: 500 });
    return NextResponse.json(result.data);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await createInvoiceAction(body);
    if (!result.success) return NextResponse.json({ error: result.message }, { status: 400 });
    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
