import { NextResponse } from "next/server";
import { getCustomersAction, createCustomerAction, updateCustomerAction, deleteCustomerAction } from "@/lib/actions/billing";

export async function GET() {
  try {
    const result = await getCustomersAction();
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
    const result = await createCustomerAction(body);
    if (!result.success) return NextResponse.json({ error: result.message }, { status: 400 });
    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const result = await updateCustomerAction(id, data);
    if (!result.success) return NextResponse.json({ error: result.message }, { status: 400 });
    return NextResponse.json(result.data);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const result = await deleteCustomerAction(body.id);
    if (!result.success) return NextResponse.json({ error: result.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
