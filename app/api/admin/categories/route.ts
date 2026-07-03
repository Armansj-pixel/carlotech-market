import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { isAdminAuthed } from "@/lib/admin/auth";

export async function GET() {
  const supabase = createServiceClient();
  const { data } = await supabase.from("categories").select("*").order("sort_order");
  return NextResponse.json({ categories: data ?? [] });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name, slug } = await req.json();
  if (!name || !slug) {
    return NextResponse.json({ error: "Nama & slug wajib diisi." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({ name, slug })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message.includes("duplicate") ? "Kategori dengan nama itu sudah ada." : "Gagal menambah kategori." },
      { status: 500 }
    );
  }

  revalidatePath("/");
  revalidatePath("/admin/produk");
  return NextResponse.json({ category: data });
}
