"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutForm({ variantId }: { variantId: string }) {
  const router = useRouter();
  const [buyerName, setBuyerName] = useState("");
  const [buyerWhatsapp, setBuyerWhatsapp] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId,
          buyerName,
          buyerWhatsapp,
          buyerEmail,
          notes,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal membuat order.");
        setLoading(false);
        return;
      }

      router.push(`/order/${data.order.id}`);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
          Nama
        </label>
        <input
          required
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          className="glass-input mt-1 w-full rounded-xl px-4 py-3 text-text placeholder:text-text-muted"
          placeholder="Nama lengkap"
        />
      </div>

      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
          Nomor WhatsApp
        </label>
        <input
          required
          value={buyerWhatsapp}
          onChange={(e) => setBuyerWhatsapp(e.target.value)}
          className="glass-input mt-1 w-full rounded-xl px-4 py-3 text-text placeholder:text-text-muted"
          placeholder="08xxxxxxxxxx"
        />
      </div>

      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
          Email (opsional)
        </label>
        <input
          value={buyerEmail}
          onChange={(e) => setBuyerEmail(e.target.value)}
          className="glass-input mt-1 w-full rounded-xl px-4 py-3 text-text placeholder:text-text-muted"
          placeholder="nama@email.com"
        />
      </div>

      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
          Catatan (opsional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="glass-input mt-1 w-full rounded-xl px-4 py-3 text-text placeholder:text-text-muted"
          placeholder="Contoh: minta profil kosong"
        />
      </div>

      {error && <p className="text-sm text-signal-red">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-signal-cyan to-signal-violet py-3 font-display font-bold text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Memproses…" : "Buat pesanan"}
      </button>
      <p className="text-center text-xs text-text-muted">
        Bukti transfer diupload di halaman status pesanan setelah ini.
      </p>
    </form>
  );
}
