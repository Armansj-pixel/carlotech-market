import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
  }
  return NextResponse.json({ order });
}

// Dipakai buyer untuk melampirkan URL bukti transfer setelah upload ke storage
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { proofUrl } = body;

  if (!proofUrl) {
    return NextResponse.json({ error: "URL bukti wajib diisi." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: order, error } = await supabase
    .from("orders")
    .update({ proof_url: proofUrl })
    .eq("id", params.id)
    .select()
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Gagal menyimpan bukti." }, { status: 500 });
  }
  return NextResponse.json({ order });
}
