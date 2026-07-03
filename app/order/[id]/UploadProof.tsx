"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Kompres foto jadi base64 langsung di HP, sekali proses aja (gak diulang-ulang)
// biar gak berat. Target: ukuran kecil dari awal, cukup buat baca bukti transfer.
function compressToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const MAX_WIDTH = 700;
      const scale = Math.min(1, MAX_WIDTH / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Canvas tidak didukung"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.45);
      URL.revokeObjectURL(objectUrl);
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Gagal memuat gambar"));
    };

    img.src = objectUrl;
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
      setProgressLabel("Mengecilkan foto…");
      const base64 = await compressToBase64(file);

      setProgressLabel("Menyimpan…");
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proofUrl: base64 }),
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
