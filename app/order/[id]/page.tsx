import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import type { Order, OrderStatus } from "@/lib/supabase/types";
import UploadProof from "./UploadProof";

export const dynamic = "force-dynamic";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Menunggu pembayaran",
  paid: "Pembayaran diterima — akun sedang disiapkan",
  delivered: "Akun sudah dikirim",
  expired: "Kedaluwarsa",
  cancelled: "Dibatalkan",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending_payment: "text-signal-amber",
  paid: "text-signal-green",
  delivered: "text-signal-green",
  expired: "text-signal-red",
  cancelled: "text-signal-red",
};

export default async function OrderStatusPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServiceClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!order) return notFound();

  const o = order as Order;

  return (
    <main className="app-content min-h-screen px-6 py-10 md:px-12">
      <div className="mx-auto max-w-xl">
        <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
          Kode pesanan
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold">{o.order_code}</h1>

        <div className="glass-card mt-6 p-5">
          <p className={`font-display text-lg font-bold ${STATUS_COLOR[o.status]}`}>
            {STATUS_LABEL[o.status]}
          </p>
          <div className="mt-4 space-y-1 font-mono text-sm text-text-muted">
            <p>{o.product_name_snapshot} — {o.variant_label_snapshot}</p>
            <p className="text-text">{formatIDR(o.price_snapshot)}</p>
            <p>Atas nama: {o.buyer_name}</p>
            <p>WhatsApp: {o.buyer_whatsapp}</p>
          </div>
        </div>

        {o.status === "pending_payment" && !o.proof_url && (
          <UploadProof orderId={o.id} />
        )}

        {o.status === "pending_payment" && o.proof_url && (
          <p className="mt-6 font-mono text-sm text-signal-amber">
            Bukti transfer diterima, menunggu konfirmasi admin.
          </p>
        )}

        {o.status === "delivered" && (
          <p className="mt-6 text-sm text-text-muted">
            Akun sudah dikirim ke WhatsApp {o.buyer_whatsapp}. Hubungi admin
            kalau belum diterima.
          </p>
        )}
      </div>
    </main>
  );
}
