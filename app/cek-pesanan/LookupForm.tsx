"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LookupForm() {
  const router = useRouter();
  const [orderCode, setOrderCode] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderCode, whatsapp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Order tidak ditemukan.");
        setLoading(false);
        return;
      }

      router.push(`/order/${data.orderId}`);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
          Kode order
        </label>
        <input
          required
          value={orderCode}
          onChange={(e) => setOrderCode(e.target.value)}
          placeholder="CT-XXXXXX"
          className="glass-input mt-1 w-full rounded-xl px-4 py-3 text-text placeholder:text-text-muted"
        />
      </div>

      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
          Nomor WhatsApp
        </label>
        <input
          required
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="08xxxxxxxxxx"
          className="glass-input mt-1 w-full rounded-xl px-4 py-3 text-text placeholder:text-text-muted"
        />
      </div>

      {error && <p className="text-sm text-signal-red">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-signal-cyan to-signal-violet py-3 font-display font-bold text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Mencari…" : "Cek status pesanan"}
      </button>
    </form>
  );
}
