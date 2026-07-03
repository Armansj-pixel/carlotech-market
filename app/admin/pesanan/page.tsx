import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import type { Order, OrderStatus } from "@/lib/supabase/types";
import OrderActions from "./OrderActions";

export const dynamic = "force-dynamic";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Menunggu bayar",
  paid: "Lunas — perlu dikirim",
  delivered: "Terkirim",
  expired: "Kedaluwarsa",
  cancelled: "Dibatalkan",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending_payment: "text-signal-amber",
  paid: "text-signal-green",
  delivered: "text-text-muted",
  expired: "text-signal-red",
  cancelled: "text-signal-red",
};

export default async function AdminOrdersPage() {
  const supabase = createServiceClient();

  // Catatan: sengaja tanpa .limit() — kombinasi .order() + .limit() di client
  // Supabase yang dipakai project ini menghasilkan array kosong (bug yang sudah
  // diverifikasi lewat debug manual). .order() sendirian berjalan normal.
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (orders ?? []) as Order[];

  return (
    <main className="app-content min-h-screen px-6 py-10 md:px-12">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
              Admin
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold">Daftar Pesanan</h1>
          </div>
          <Link
            href="/admin/produk"
            className="glass-chip rounded-xl px-4 py-2 font-mono text-xs text-text-muted"
          >
            Kelola Produk →
          </Link>
        </div>

        <div className="mt-8 space-y-3">
          {error && (
            <div className="glass-card border-signal-red/40 p-5">
              <p className="font-mono text-xs text-signal-red">
                Gagal ambil data order: {error.message}
              </p>
            </div>
          )}
          {!error && list.length === 0 && (
            <p className="text-text-muted">Belum ada pesanan masuk.</p>
          )}

          {list.map((o) => (
            <div key={o.id} className="glass-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-text-muted">
                    {o.order_code} · {new Date(o.created_at).toLocaleString("id-ID")}
                  </p>
                  <p className="mt-1 font-display font-bold">
                    {o.product_name_snapshot} — {o.variant_label_snapshot}
                  </p>
                  <p className="price-gradient font-mono text-sm font-bold">
                    {formatIDR(o.price_snapshot)}
                  </p>
                  <p className="mt-2 font-mono text-xs text-text-muted">
                    {o.buyer_name} · {o.buyer_whatsapp}
                  </p>
                  {o.proof_url && (
                    <a
                      href={o.proof_url}
                      target="_blank"
                      className="mt-1 inline-block font-mono text-xs text-signal-green underline"
                    >
                      Lihat bukti transfer →
                    </a>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`font-mono text-xs ${STATUS_COLOR[o.status]}`}>
                    {STATUS_LABEL[o.status]}
                  </span>
                  <OrderActions orderId={o.id} status={o.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
