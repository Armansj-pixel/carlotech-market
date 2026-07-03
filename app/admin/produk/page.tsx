import { createServiceClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/lib/supabase/types";
import ProductManager from "./ProductManager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const supabase = createServiceClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  const { data: products } = await supabase
    .from("products")
    .select("*, categories(*), product_variants(*)")
    .order("sort_order");

  return (
    <main className="app-content min-h-screen px-6 py-10 md:px-12">
      <div className="mx-auto max-w-4xl">
        <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
          Admin
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold">Kelola Produk</h1>

        <ProductManager
          initialCategories={(categories ?? []) as Category[]}
          initialProducts={(products ?? []) as Product[]}
        />
      </div>
    </main>
  );
}
