import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAdminAuthed } from "@/lib/admin/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status } = await req.json();
  const allowed = ["pending_payment", "paid", "delivered", "expired", "cancelled"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const extra: Record<string, string> = {};
  if (status === "paid") extra.paid_at = new Date().toISOString();
  if (status === "delivered") extra.delivered_at = new Date().toISOString();

  const { data: order, error } = await supabase
    .from("orders")
    .update({ status, ...extra })
    .eq("id", params.id)
    .select()
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Gagal update order." }, { status: 500 });
  }
  return NextResponse.json({ order });
}
