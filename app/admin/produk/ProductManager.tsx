"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Product } from "@/lib/supabase/types";
import ProductLogo from "@/components/ProductLogo";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ProductManager({
  initialCategories,
  initialProducts,
}: {
  initialCategories: Category[];
  initialProducts: Product[];
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);

  // form tambah kategori
  const [catName, setCatName] = useState("");
  const [catLoading, setCatLoading] = useState(false);

  // form tambah produk
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [prodName, setProdName] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodLogo, setProdLogo] = useState("");
  const [prodLoading, setProdLoading] = useState(false);
  const [prodError, setProdError] = useState("");

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!catName.trim()) return;
    setCatLoading(true);
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: catName, slug: slugify(catName) }),
    });
    setCatName("");
    setCatLoading(false);
    router.refresh();
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    setProdError("");
    if (!prodName.trim()) return;
    setProdLoading(true);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: prodName,
        slug: slugify(prodName),
        categoryId: prodCategory || null,
        description: prodDesc || null,
        imageUrl: prodLogo || null,
      }),
    });
    if (!res.ok) {
      setProdError("Gagal menambah produk. Coba nama lain.");
      setProdLoading(false);
      return;
    }
    setProdName("");
    setProdCategory("");
    setProdDesc("");
    setProdLogo("");
    setShowAddProduct(false);
    setProdLoading(false);
    router.refresh();
  }

  async function toggleActive(product: Product) {
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !product.is_active }),
    });
    router.refresh();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Hapus produk ini beserta semua variannya?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Tambah kategori */}
      <div className="glass-card p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
          Kategori
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {initialCategories.map((c) => (
            <span
              key={c.id}
              className="glass-chip rounded-full px-3 py-1 font-mono text-xs text-text-muted"
            >
              {c.name}
            </span>
          ))}
        </div>
        <form onSubmit={addCategory} className="mt-4 flex gap-2">
          <input
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="Nama kategori baru, mis. Editing"
            className="glass-input flex-1 rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted"
          />
          <button
            type="submit"
            disabled={catLoading}
            className="rounded-lg bg-gradient-to-r from-signal-cyan to-signal-violet px-4 py-2 font-mono text-xs font-bold text-ink disabled:opacity-50"
          >
            Tambah
          </button>
        </form>
      </div>

      {/* Tambah produk */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Produk
          </p>
          <button
            onClick={() => setShowAddProduct((s) => !s)}
            className="glass-chip rounded-lg px-3 py-1.5 font-mono text-xs text-text-muted"
          >
            {showAddProduct ? "Batal" : "+ Produk baru"}
          </button>
        </div>

        {showAddProduct && (
          <form onSubmit={addProduct} className="mt-4 space-y-3">
            <input
              required
              value={prodName}
              onChange={(e) => setProdName(e.target.value)}
              placeholder="Nama produk, mis. Netflix Premium"
              className="glass-input w-full rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted"
            />
            <select
              value={prodCategory}
              onChange={(e) => setProdCategory(e.target.value)}
              className="glass-input w-full rounded-lg px-3 py-2 text-sm text-text"
            >
              <option value="">Tanpa kategori</option>
              {initialCategories.map((c) => (
                <option key={c.id} value={c.id} className="bg-ink">
                  {c.name}
                </option>
              ))}
            </select>
            <textarea
              value={prodDesc}
              onChange={(e) => setProdDesc(e.target.value)}
              placeholder="Deskripsi singkat (opsional)"
              rows={2}
              className="glass-input w-full rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted"
            />
            <div>
              <input
                value={prodLogo}
                onChange={(e) => setProdLogo(e.target.value)}
                placeholder="URL logo, mis. https://cdn.simpleicons.org/netflix/E50914"
                className="glass-input w-full rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted"
              />
              <p className="mt-1 font-mono text-[10px] text-text-muted">
                Cari nama brand di simpleicons.org lalu pakai link:
                cdn.simpleicons.org/[nama-brand]/[kode-warna-hex-tanpa-#]
              </p>
              {prodLogo && (
                <div className="mt-2">
                  <ProductLogo name={prodName || "?"} imageUrl={prodLogo} size={36} />
                </div>
              )}
            </div>
            {prodError && <p className="text-xs text-signal-red">{prodError}</p>}
            <button
              type="submit"
              disabled={prodLoading}
              className="w-full rounded-lg bg-gradient-to-r from-signal-cyan to-signal-violet py-2 font-mono text-xs font-bold text-ink disabled:opacity-50"
            >
              {prodLoading ? "Menyimpan…" : "Simpan produk"}
            </button>
          </form>
        )}
      </div>

      {/* Daftar produk + varian */}
      <div className="space-y-3">
        {initialProducts.length === 0 && (
          <p className="text-text-muted">Belum ada produk. Tambahkan lewat form di atas.</p>
        )}
        {initialProducts.map((p) => (
          <div key={p.id} className="glass-card p-5">
            <div className="flex items-center gap-3.5">
              <ProductLogo name={p.name} imageUrl={p.image_url} />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  {p.categories?.name ?? "Tanpa kategori"} ·{" "}
                  {p.is_active ? (
                    <span className="text-signal-green">Aktif</span>
                  ) : (
                    <span className="text-signal-red">Nonaktif</span>
                  )}
                </p>
                <h3 className="truncate font-display text-lg font-bold">{p.name}</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                  className="glass-chip rounded-lg px-3 py-1.5 font-mono text-xs text-text-muted"
                >
                  {expanded === p.id ? "Tutup" : "Varian"}
                </button>
                <button
                  onClick={() => toggleActive(p)}
                  className="glass-chip rounded-lg px-3 py-1.5 font-mono text-xs text-text-muted"
                >
                  {p.is_active ? "Nonaktifkan" : "Aktifkan"}
                </button>
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="rounded-lg border border-signal-red/50 bg-signal-red/10 px-3 py-1.5 font-mono text-xs text-signal-red"
                >
                  Hapus
                </button>
              </div>
            </div>

            {expanded === p.id && (
              <VariantManager product={p} onChange={() => router.refresh()} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function VariantManager({
  product,
  onChange,
}: {
  product: Product;
  onChange: () => void;
}) {
  const [label, setLabel] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);

  const variants = product.product_variants ?? [];

  async function addVariant(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !price) return;
    setLoading(true);
    await fetch("/api/admin/variants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        label,
        durationDays: durationDays ? Number(durationDays) : null,
        price: Number(price),
        stockCount: stock ? Number(stock) : 0,
      }),
    });
    setLabel("");
    setDurationDays("");
    setPrice("");
    setStock("");
    setLoading(false);
    onChange();
  }

  async function updateStock(variantId: string, newStock: number) {
    await fetch(`/api/admin/variants/${variantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock_count: newStock }),
    });
    onChange();
  }

  async function deleteVariant(variantId: string) {
    if (!confirm("Hapus varian ini?")) return;
    await fetch(`/api/admin/variants/${variantId}`, { method: "DELETE" });
    onChange();
  }

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <div className="space-y-2">
        {variants.map((v) => (
          <div
            key={v.id}
            className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold">{v.label}</p>
              <p className="price-gradient font-mono text-xs font-bold">
                {formatIDR(v.price)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="font-mono text-[10px] text-text-muted">Stok</label>
              <input
                type="number"
                defaultValue={v.stock_count}
                onBlur={(e) => updateStock(v.id, Number(e.target.value))}
                className="glass-input w-16 rounded-md px-2 py-1 text-center text-xs text-text"
              />
              <button
                onClick={() => deleteVariant(v.id)}
                className="font-mono text-xs text-signal-red"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
        {variants.length === 0 && (
          <p className="font-mono text-xs text-text-muted">Belum ada varian.</p>
        )}
      </div>

      <form onSubmit={addVariant} className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (1 Bulan)"
          className="glass-input rounded-lg px-3 py-2 text-xs text-text placeholder:text-text-muted"
        />
        <input
          value={durationDays}
          onChange={(e) => setDurationDays(e.target.value)}
          placeholder="Hari (30)"
          type="number"
          className="glass-input rounded-lg px-3 py-2 text-xs text-text placeholder:text-text-muted"
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Harga"
          type="number"
          className="glass-input rounded-lg px-3 py-2 text-xs text-text placeholder:text-text-muted"
        />
        <div className="flex gap-2">
          <input
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Stok"
            type="number"
            className="glass-input w-full rounded-lg px-3 py-2 text-xs text-text placeholder:text-text-muted"
          />
          <button
            type="submit"
            disabled={loading}
            className="whitespace-nowrap rounded-lg bg-gradient-to-r from-signal-cyan to-signal-violet px-3 py-2 font-mono text-xs font-bold text-ink disabled:opacity-50"
          >
            +
          </button>
        </div>
      </form>
    </div>
  );
}
