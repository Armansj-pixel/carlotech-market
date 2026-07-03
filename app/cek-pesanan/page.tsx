import Link from "next/link";
import LookupForm from "./LookupForm";

export default function CekPesananPage() {
  return (
    <main className="app-content min-h-screen px-6 py-10 md:px-12">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="font-mono text-xs text-text-muted transition-colors hover:text-signal-cyan"
        >
          ← Kembali ke katalog
        </Link>

        <p className="mt-6 font-mono text-xs uppercase tracking-widest text-text-muted">
          Cek Pesanan
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
          Lacak status pesananmu
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Masukkan kode order (contoh: CT-XXXXXX) dan nomor WhatsApp yang
          dipakai saat checkout.
        </p>

        <LookupForm />
      </div>
    </main>
  );
}
