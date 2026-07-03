import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { isAdminAuthed } from "@/lib/admin/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const allowedFields = ["label", "duration_days", "price", "stock_count", "is_active"];
  const update: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) update[key] = body[key];
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("product_variants")
    .update(update)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Gagal update varian." }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/admin/produk");
  return NextResponse.json({ variant: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createServiceClient();
  const { error } = await supabase.from("product_variants").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: "Gagal hapus varian." }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/admin/produk");
  return NextResponse.json({ ok: true });
}
