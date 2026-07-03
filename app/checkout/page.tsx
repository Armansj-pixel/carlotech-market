import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { MANUAL_PAYMENT_INFO } from "@/lib/payment/manual";
import ProductLogo from "@/components/ProductLogo";
import CheckoutForm from "./CheckoutForm";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { variant?: string };
}) {
  if (!searchParams.variant) redirect("/");

  const supabase = createServiceClient();
  const { data: variant } = await supabase
    .from("product_variants")
    .select("*, products(name, image_url)")
    .eq("id", searchParams.variant)
    .single();

  if (!variant) redirect("/");

  const productInfo = (variant as any).products;

  return (
    <main className="app-content min-h-screen px-6 py-10 md:px-12">
      <div className="mx-auto max-w-xl">
        <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
          Checkout
        </p>

        <div className="mt-2 flex items-center gap-3">
          <ProductLogo name={productInfo?.name ?? "?"} imageUrl={productInfo?.image_url} size={40} />
          <h1 className="font-display text-2xl font-bold md:text-3xl">
            {productInfo?.name} — {variant.label}
          </h1>
        </div>
        <p className="price-gradient mt-2 font-display text-xl font-bold">
          {formatIDR(variant.price)}
        </p>

        <div className="glass-card mt-8 p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Metode pembayaran
          </p>
          <p className="mt-2 font-display text-lg font-bold">
            Transfer manual
          </p>
          <div className="mt-3 space-y-1 font-mono text-sm">
            <p>
              Bank: <span className="text-text-muted">{MANUAL_PAYMENT_INFO.bankName}</span>
            </p>
            <p>
              No. rek: <span className="text-signal-cyan">{MANUAL_PAYMENT_INFO.accountNumber}</span>
            </p>
            <p>
              A/N: <span className="text-text-muted">{MANUAL_PAYMENT_INFO.accountHolder}</span>
            </p>
          </div>
          <p className="mt-4 text-sm text-text-muted">
            {MANUAL_PAYMENT_INFO.instructions}
          </p>
        </div>

        <CheckoutForm variantId={variant.id} />
      </div>
    </main>
  );
}
