import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { sendTelegramMessage, formatProofUploadedMessage } from "@/lib/notification/telegram";

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

// Dipakai buyer untuk melampirkan bukti transfer (base64) setelah checkout
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
  // Sengaja TIDAK pakai .select().single() di sini — biar respons ke buyer
  // gak perlu ngirim balik data gede (foto base64) yang baru aja diupload,
  // cukup konfirmasi berhasil/gagal aja, jadi jauh lebih cepat.
  const { error } = await supabase
    .from("orders")
    .update({ proof_url: proofUrl })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: "Gagal menyimpan bukti." }, { status: 500 });
  }

  // Ambil kolom kecil aja (bukan proof_url yang gede) buat isi notifikasi
  const { data: orderInfo } = await supabase
    .from("orders")
    .select("order_code, buyer_name")
    .eq("id", params.id)
    .single();

  if (orderInfo) {
    await sendTelegramMessage(
      formatProofUploadedMessage({
        orderCode: orderInfo.order_code,
        buyerName: orderInfo.buyer_name,
      })
    );
  }

  revalidatePath("/admin/pesanan");
  revalidatePath(`/order/${params.id}`);
  return NextResponse.json({ ok: true });
}
