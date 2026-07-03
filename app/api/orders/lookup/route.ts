import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { orderCode, whatsapp } = await req.json();

  if (!orderCode || !whatsapp) {
    return NextResponse.json(
      { error: "Kode order & nomor WhatsApp wajib diisi." },
      { status: 400 }
    );
  }

  const normalizedCode = String(orderCode).trim().toUpperCase();
  const normalizedWhatsapp = String(whatsapp).replace(/\D/g, "");

  const supabase = createServiceClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, buyer_whatsapp")
    .eq("order_code", normalizedCode)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json(
      { error: "Order tidak ditemukan. Cek kembali kode order-nya." },
      { status: 404 }
    );
  }

  const orderWhatsappDigits = String(order.buyer_whatsapp).replace(/\D/g, "");
  // Cocokkan 4 digit terakhir aja, biar toleran format 08xx vs 628xx vs +62
  if (!orderWhatsappDigits.endsWith(normalizedWhatsapp.slice(-4)) || normalizedWhatsapp.length < 4) {
    return NextResponse.json(
      { error: "Nomor WhatsApp gak cocok dengan order ini." },
      { status: 404 }
    );
  }

  return NextResponse.json({ orderId: order.id });
}
