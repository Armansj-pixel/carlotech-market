// Notifikasi order baru & event lain ke Telegram — gratis, gak ada resiko
// banned kayak WhatsApp API. Setup: buat bot lewat @BotFather, isi
// TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID di environment variables.

export function isTelegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

export async function sendTelegramMessage(text: string) {
  if (!isTelegramConfigured()) {
    console.warn("Telegram belum dikonfigurasi, notifikasi dilewati.");
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });
  } catch (err) {
    // Sengaja gak dilempar sebagai error — kalau notifikasi gagal,
    // proses order tetap harus lanjut, jangan sampai gagal gara-gara ini.
    console.error("Gagal kirim notifikasi Telegram:", err);
  }
}

export function formatNewOrderMessage(params: {
  orderCode: string;
  productName: string;
  variantLabel: string;
  price: number;
  buyerName: string;
  buyerWhatsapp: string;
}) {
  const price = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(params.price);

  return (
    `🛒 <b>Order baru masuk!</b>\n\n` +
    `Kode: <code>${params.orderCode}</code>\n` +
    `Produk: ${params.productName} — ${params.variantLabel}\n` +
    `Harga: ${price}\n` +
    `Pembeli: ${params.buyerName} (${params.buyerWhatsapp})\n\n` +
    `Cek di /admin/pesanan`
  );
}

export function formatProofUploadedMessage(params: {
  orderCode: string;
  buyerName: string;
}) {
  return (
    `📎 <b>Bukti transfer diupload</b>\n\n` +
    `Kode: <code>${params.orderCode}</code>\n` +
    `Pembeli: ${params.buyerName}\n\n` +
    `Cek & konfirmasi di /admin/pesanan`
  );
}
