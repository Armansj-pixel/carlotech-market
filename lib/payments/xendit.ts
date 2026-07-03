// Modul Xendit — sudah disiapkan strukturnya, tinggal aktifkan begitu
// akun Xendit sudah verified dan XENDIT_SECRET_KEY diisi di environment variables.
//
// Cara mengaktifkan nanti:
// 1. Isi XENDIT_SECRET_KEY di .env / Vercel env vars
// 2. Di app/checkout, tampilkan opsi "Bayar Otomatis (Xendit)" di samping manual transfer
// 3. Set webhook URL di dashboard Xendit ke: https://domainmu.com/api/xendit/webhook

import { Xendit } from "xendit-node";

export function isXenditConfigured() {
  return Boolean(process.env.XENDIT_SECRET_KEY);
}

export async function createXenditInvoice(params: {
  orderCode: string;
  amount: number;
  buyerName: string;
  buyerEmail?: string;
  description: string;
}) {
  if (!isXenditConfigured()) {
    throw new Error(
      "Xendit belum dikonfigurasi. Isi XENDIT_SECRET_KEY di environment variables."
    );
  }

  const xenditClient = new Xendit({
    secretKey: process.env.XENDIT_SECRET_KEY!,
  });

  const invoice = await xenditClient.Invoice.createInvoice({
    data: {
      externalId: params.orderCode,
      amount: params.amount,
      payerEmail: params.buyerEmail,
      description: params.description,
      successRedirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/order/${params.orderCode}?status=success`,
      failureRedirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/order/${params.orderCode}?status=failed`,
    },
  });

  return invoice;
}

// Verifikasi callback token dari header x-callback-token saat webhook masuk
export function verifyXenditCallback(headerToken: string | null) {
  if (!process.env.XENDIT_CALLBACK_TOKEN) return false;
  return headerToken === process.env.XENDIT_CALLBACK_TOKEN;
}
