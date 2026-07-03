import { createServiceClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/lib/supabase/types";
import CatalogClient from "./CatalogClient";

export const revalidate = 60;

async function getData() {
  const supabase = createServiceClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  const { data: products } = await supabase
    .from("products")
    .select("*, categories(*), product_variants(*)")
    .eq("is_active", true)
    .order("sort_order");

  return {
    categories: (categories ?? []) as Category[],
    products: (products ?? []) as Product[],
  };
}

export default async function HomePage() {
  const { categories, products } = await getData();

  return (
    <main className="app-content min-h-screen">
      {/* Hero */}
      <section className="px-6 pt-14 pb-10 md:px-12 md:pt-20 md:pb-14">
        <div className="mx-auto max-w-5xl">
          <p className="animate-fadeUp font-mono text-xs tracking-[0.2em] text-signal-cyan opacity-0">
            CARLO TECH STORE
          </p>
          <h1
            className="animate-fadeUp mt-4 font-display text-4xl font-bold leading-tight opacity-0 md:text-6xl"
            style={{ animationDelay: "0.12s" }}
          >
            Akses premium,
            <br />
            diaktifkan cepat.
          </h1>
          <p
            className="animate-fadeUp mt-5 max-w-lg text-text-muted opacity-0"
            style={{ animationDelay: "0.24s" }}
          >
            Langganan streaming, tools kreator, dan aplikasi premium lainnya.
            Order, bayar, akun terkirim langsung ke WhatsApp-mu.
          </p>
        </div>
      </section>

      <CatalogClient categories={categories} products={products} />
    </main>
  );
}
