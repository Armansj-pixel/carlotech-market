"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Kecilkan & kompres gambar di browser sebelum upload, biar gak nunggu lama
// upload foto asli dari kamera HP (biasanya 3-8MB jadi di bawah 300-500KB).
async function compressImage(file: File, maxWidth = 1280, quality = 0.7): Promise<File> {
  // PDF atau file non-gambar dilewatkan apa adanya
  if (!file.type.startsWith("image/")) return file;

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
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(
            new File([blob], file.name.replace(/\.(png|jpe?g|webp)$/i, ".jpg"), {
              type: "image/jpeg",
            })
          );
        },
        "image/jpeg",
        quality
      );
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
      setProgressLabel("Mengecilkan ukuran foto…");
      const compressed = await compressImage(file);

      const supabase = createClient();
      const path = `${orderId}/${Date.now()}-${compressed.name}`;

      setProgressLabel("Mengunggah…");
      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(path, compressed);

      if (uploadError) {
        setError("Gagal upload. Pastikan bucket 'payment-proofs' sudah dibuat di Supabase Storage.");
        setLoading(false);
        setProgressLabel("");
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(path);

      setProgressLabel("Menyimpan…");
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proofUrl: publicUrl.publicUrl }),
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
        {loading ? progressLabel || "Memproses…" : "Kirim bukti"}
      </button>
    </div>
  );
}
