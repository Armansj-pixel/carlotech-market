import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateOrderCode } from "@/lib/payment/manual";
import { sendTelegramMessage, formatNewOrderMessage } from "@/lib/notification/telegram";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { variantId, buyerName, buyerWhatsapp, buyerEmail, notes } = body;

    if (!variantId || !buyerName || !buyerWhatsapp) {
      return NextResponse.json(
        { error: "Data belum lengkap." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .select("*, products(name)")
      .eq("id", variantId)
      .single();

    if (variantError || !variant) {
      return NextResponse.json(
        { error: "Varian produk tidak ditemukan." },
        { status: 404 }
      );
    }

    const orderCode = generateOrderCode();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_code: orderCode,
        variant_id: variant.id,
        product_name_snapshot: (variant as any).products?.name ?? "Produk",
        variant_label_snapshot: variant.label,
        price_snapshot: variant.price,
        buyer_name: buyerName,
        buyer_whatsapp: buyerWhatsapp,
        buyer_email: buyerEmail || null,
        payment_method: "manual_transfer",
        status: "pending_payment",
        notes: notes || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Gagal membuat order." },
        { status: 500 }
      );
    }

    // Notifikasi ke Telegram — kalau gagal/belum dikonfigurasi, gak masalah,
    // order tetap berhasil dibuat.
    sendTelegramMessage(
      formatNewOrderMessage({
        orderCode,
        productName: (variant as any).products?.name ?? "Produk",
        variantLabel: variant.label,
        price: variant.price,
        buyerName,
        buyerWhatsapp,
      })
    );

    return NextResponse.json({ order });
  } catch (err) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
