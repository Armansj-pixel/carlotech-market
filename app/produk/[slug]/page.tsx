import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/supabase/types";
import ProductLogo from "@/components/ProductLogo";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

async function getProduct(slug: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories(*), product_variants(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return data as Product | null;
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);
  if (!product) return notFound();

  const variants = (product.product_variants ?? [])
    .filter((v) => v.is_active)
    .sort((a, b) => a.price - b.price);

  return (
    <main className="app-content min-h-screen px-6 py-10 md:px-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="font-mono text-xs text-text-muted transition-colors hover:text-signal-cyan"
        >
          ← Kembali ke katalog
        </Link>

        <div className="mt-6 flex items-center gap-4">
          <ProductLogo name={product.name} imageUrl={product.image_url} size={56} />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              {product.categories?.name ?? "Umum"}
            </p>
            <h1 className="font-display text-2xl font-bold md:text-3xl">
              {product.name}
            </h1>
          </div>
        </div>

        {product.description && (
          <p className="mt-4 text-text-muted">{product.description}</p>
        )}

        <h2 className="mt-10 font-mono text-xs uppercase tracking-widest text-text-muted">
          Pilih durasi
        </h2>

        <div className="mt-4 space-y-3">
          {variants.length === 0 && (
            <p className="text-text-muted">Belum ada varian aktif.</p>
          )}
          {variants.map((v, i) => {
            const out = v.stock_count <= 0;
            const staggerClass = `stagger-${Math.min(i + 1, 9)}`;
            return (
              <Link
                key={v.id}
                href={out ? "#" : `/checkout?variant=${v.id}`}
                aria-disabled={out}
                className={`glass-card animate-cardIn ${staggerClass} flex items-center justify-between p-5 opacity-0 ${
                  out
                    ? "pointer-events-none opacity-40"
                    : "glass-card-hover"
                }`}
              >
                <div>
                  <p className="font-display text-lg font-bold">{v.label}</p>
                  <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-text-muted">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        out ? "bg-signal-red" : "bg-signal-green"
                      }`}
                    />
                    {out ? "Stok habis" : "Stok tersedia"}
                  </p>
                </div>
                <p className="price-gradient font-display text-xl font-bold">
                  {formatIDR(v.price)}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
