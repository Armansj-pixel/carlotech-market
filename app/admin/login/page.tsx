"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setError("Password salah.");
      setLoading(false);
      return;
    }

    router.push("/admin/pesanan");
  }

  return (
    <main className="app-content flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="glass-card w-full max-w-sm p-6"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
          Carlo Tech Store
        </p>
        <h1 className="mt-1 font-display text-xl font-bold">Admin Login</h1>

        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password admin"
          className="glass-input mt-6 w-full rounded-xl px-4 py-3 text-text placeholder:text-text-muted"
        />
        {error && <p className="mt-2 text-sm text-signal-red">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-signal-cyan to-signal-violet py-2.5 font-display font-bold text-ink disabled:opacity-50"
        >
          {loading ? "Memproses…" : "Masuk"}
        </button>
      </form>
    </main>
  );
}
