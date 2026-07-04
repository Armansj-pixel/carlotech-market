// Notifikasi order baru & event lain ke Telegram — gratis, gak ada resiko
// banned kayak WhatsApp API. Setup: buat bot lewat @BotFather, isi
// TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID di environment variables.

export function isTelegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

// Ubah nomor format apapun (08xx, 62xx, +62xx, dengan spasi/strip) jadi
// format internasional tanpa "+" yang dipakai wa.me link (628xx...)
function normalizeToWaLink(rawNumber: string) {
  const digits = rawNumber.replace(/\D/g, "");
  let normalized = digits;
  if (digits.startsWith("0")) {
    normalized = "62" + digits.slice(1);
  } else if (!digits.startsWith("62")) {
    normalized = "62" + digits;
  }
  return `https://wa.me/${normalized}`;
}

export async function sendTelegramMessage(text: string) {
  if (!isTelegramConfigured()) {
    console.warn("Telegram belum dikonfigurasi, notifikasi dilewati.");
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`Telegram API error (${res.status}):`, body);
    }
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

  const waLink = normalizeToWaLink(params.buyerWhatsapp);

  return (
    `🛒 <b>Order baru masuk!</b>\n\n` +
    `Kode: <code>${params.orderCode}</code>\n` +
    `Produk: ${params.productName} — ${params.variantLabel}\n` +
    `Harga: ${price}\n` +
    `Pembeli: ${params.buyerName}\n` +
    `WhatsApp: <a href="${waLink}">${params.buyerWhatsapp}</a>\n\n` +
    `Cek di /admin/pesanan`
  );
}

export function formatProofUploadedMessage(params: {
  orderCode: string;
  buyerName: string;
  buyerWhatsapp: string;
}) {
  const waLink = normalizeToWaLink(params.buyerWhatsapp);

  return (
    `📎 <b>Bukti transfer diupload</b>\n\n` +
    `Kode: <code>${params.orderCode}</code>\n` +
    `Pembeli: ${params.buyerName}\n` +
    `WhatsApp: <a href="${waLink}">${params.buyerWhatsapp}</a>\n\n` +
    `Cek & konfirmasi di /admin/pesanan`
  );
}
