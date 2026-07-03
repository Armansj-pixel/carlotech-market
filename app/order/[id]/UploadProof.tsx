"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Kecilkan & kompres gambar di browser, lalu ubah jadi base64 (data URL) —
// disimpan langsung sebagai teks di kolom proof_url, TANPA butuh Supabase
// Storage bucket sama sekali. Base64 data URL tetap bisa dipakai langsung
// sebagai src="..." buat nampilin gambar di admin panel.
async function compressToBase64(
  file: File,
  maxWidth = 1000,
  quality = 0.6
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file"));

    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas tidak didukung"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // toDataURL langsung menghasilkan string base64 siap simpan
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(dataUrl);
    };
    img.onerror = () => reject(new Error("Gagal memuat gambar"));

    reader.readAsDataURL(file);
  });
}

export default function UploadProof({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState("");

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError("");

    try {
      setProgressLabel("Mengecilkan & mengonversi foto…");
      const base64 = await compressToBase64(file);

      // Batas aman kolom text di Postgres jauh di atas ini, tapi tetap kita
      // jaga-jaga: kalau hasil base64 masih terlalu besar, kompres lebih lagi
      let finalDataUrl = base64;
      if (base64.length > 700_000) {
        finalDataUrl = await compressToBase64(file, 700, 0.4);
      }

      setProgressLabel("Menyimpan…");
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proofUrl: finalDataUrl }),
      });

      if (!res.ok) {
        setError("Gagal menyimpan bukti transfer.");
        setLoading(false);
        setProgressLabel("");
        return;
      }

      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
      setProgressLabel("");
    }
  }

  return (
    <div className="glass-card mt-6 p-5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
        Upload bukti transfer
      </p>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="mt-3 w-full font-mono text-xs text-text-muted"
      />
      {error && <p className="mt-2 text-sm text-signal-red">{error}</p>}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-signal-cyan to-signal-violet py-2.5 font-display font-bold text-ink disabled:opacity-50"
      >
        {loading ? progressLabel || "Memproses…" : "Kirim bukti"}
      </button>
    </div>
  );
}
