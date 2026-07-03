import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAdminAuthed } from "@/lib/admin/auth";

export async function POST(req: NextRequest) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { productId, label, durationDays, price, stockCount } = await req.json();
  if (!productId || !label || price == null) {
    return NextResponse.json({ error: "Data varian belum lengkap." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("product_variants")
    .insert({
      product_id: productId,
      label,
      duration_days: durationDays || null,
      price,
      stock_count: stockCount || 0,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Gagal menambah varian." }, { status: 500 });
  }
  return NextResponse.json({ variant: data });
}
