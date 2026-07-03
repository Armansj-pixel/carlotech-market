"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UploadProof({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const path = `${orderId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(path, file);

      if (uploadError) {
        setError("Gagal upload. Pastikan bucket 'payment-proofs' sudah dibuat di Supabase Storage.");
        setLoading(false);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(path);

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proofUrl: publicUrl.publicUrl }),
      });

      if (!res.ok) {
        setError("Gagal menyimpan bukti transfer.");
        setLoading(false);
        return;
      }

      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <div className="glass-card mt-6 p-5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
        Upload bukti transfer
      </p>
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="mt-3 w-full font-mono text-xs text-text-muted"
      />
      {error && <p className="mt-2 text-sm text-signal-red">{error}</p>}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-signal-cyan to-signal-violet py-2.5 font-display font-bold text-ink disabled:opacity-50"
      >
        {loading ? "Mengunggah…" : "Kirim bukti"}
      </button>
    </div>
  );
}
