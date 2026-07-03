import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { isAdminAuthed } from "@/lib/admin/auth";

export async function GET() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories(*), product_variants(*)")
    .order("sort_order");
  return NextResponse.json({ products: data ?? [] });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name, slug, categoryId, description, imageUrl } = await req.json();
  if (!name || !slug) {
    return NextResponse.json({ error: "Nama & slug wajib diisi." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      category_id: categoryId || null,
      description: description || null,
      image_url: imageUrl || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Gagal menambah produk. Pastikan slug belum dipakai." },
      { status: 500 }
    );
  }

  revalidatePath("/");
  revalidatePath("/admin/produk");
  return NextResponse.json({ product: data });
}
