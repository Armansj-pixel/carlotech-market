import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DebugPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "(kosong)";
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const supabase = createServiceClient();
  const { count, error } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const { data: sample } = await supabase
    .from("orders")
    .select("order_code, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <main className="min-h-screen bg-ink px-6 py-10 font-mono text-sm text-text">
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="font-display text-xl font-bold">Debug Koneksi Supabase</h1>

        <div className="glass-card p-4">
          <p className="text-text-muted">NEXT_PUBLIC_SUPABASE_URL:</p>
          <p className="break-all text-signal-cyan">{url}</p>
        </div>

        <div className="glass-card p-4">
          <p className="text-text-muted">SUPABASE_SERVICE_ROLE_KEY ada?</p>
          <p className={hasServiceKey ? "text-signal-green" : "text-signal-red"}>
            {hasServiceKey ? "Ya, terisi" : "TIDAK ADA / kosong"}
          </p>
        </div>

        <div className="glass-card p-4">
          <p className="text-text-muted">NEXT_PUBLIC_SUPABASE_ANON_KEY ada?</p>
          <p className={hasAnonKey ? "text-signal-green" : "text-signal-red"}>
            {hasAnonKey ? "Ya, terisi" : "TIDAK ADA / kosong"}
          </p>
        </div>

        <div className="glass-card p-4">
          <p className="text-text-muted">Jumlah baris di tabel orders:</p>
          <p className="text-2xl text-signal-amber">{count ?? "error"}</p>
          {error && <p className="mt-2 text-signal-red">Error: {error.message}</p>}
        </div>

        <div className="glass-card p-4">
          <p className="text-text-muted">5 order terbaru (kode & waktu):</p>
          <pre className="mt-2 whitespace-pre-wrap text-xs text-text">
            {JSON.stringify(sample, null, 2)}
          </pre>
        </div>

        <p className="text-xs text-text-muted">
          Bandingkan NEXT_PUBLIC_SUPABASE_URL di atas dengan Project URL yang kamu lihat
          di Supabase (Project Settings → API). Kalau beda, itu penyebabnya — perbaiki
          env var di Vercel lalu redeploy.
        </p>
      </div>
    </main>
  );
}
