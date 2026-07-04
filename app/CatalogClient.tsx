"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Category, Product } from "@/lib/supabase/types";
import ProductLogo from "@/components/ProductLogo";
import { getGsap } from "@/lib/motion/gsap";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function CatalogClient({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const cardRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  const filtered = useMemo(() => {
    if (!activeCategory) return products;
    return products.filter((p) => p.category_id === activeCategory);
  }, [activeCategory, products]);

  // GSAP scroll-reveal — kartu muncul pas masuk viewport pas di-scroll,
  // bukan cuma pas halaman pertama kali dibuka.
  useEffect(() => {
    const { gsap, ScrollTrigger } = getGsap();
    const cards = Array.from(cardRefs.current.values());
    if (cards.length === 0) return;

    gsap.set(cards, { opacity: 0, y: 24 });

    const triggers = cards.map((card) =>
      ScrollTrigger.create({
        trigger: card,
        start: "top 92%",
        once: true,
        onEnter: () => {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
          });
        },
      })
    );

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [filtered]);

  // Micro-interaction: tilt kartu ngikutin posisi kursor
  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const card = cardRefs.current.get(id);
    if (!card) return;
    const { gsap } = getGsap();
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(card, {
      rotateX: (-y / rect.height) * 8,
      rotateY: (x / rect.width) * 8,
      transformPerspective: 600,
      duration: 0.4,
      ease: "power2.out",
    });
  }

  function handleMouseLeave(id: string) {
    const card = cardRefs.current.get(id);
    if (!card) return;
    const { gsap } = getGsap();
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: "power3.out",
    });
  }

  return (
    <>
      {/* Filter kategori */}
      <section className="sticky top-0 z-10 px-6 py-4 md:px-12">
        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveCategory(null)}
            className={`glass-chip whitespace-nowrap rounded-full px-4 py-1.5 font-mono text-xs text-text-muted ${
              activeCategory === null ? "active" : ""
            }`}
          >
            Semua
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`glass-chip whitespace-nowrap rounded-full px-4 py-1.5 font-mono text-xs text-text-muted ${
                activeCategory === c.id ? "active" : ""
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      {/* Grid produk */}
      <section className="px-6 pb-16 pt-4 md:px-12">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 && (
            <p className="col-span-full text-text-muted">
              Belum ada produk di kategori ini.
            </p>
          )}

          {filtered.map((p) => {
            const variants = p.product_variants ?? [];
            const cheapest = variants
              .filter((v) => v.is_active)
              .sort((a, b) => a.price - b.price)[0];
            const anyStock = variants.some((v) => v.stock_count > 0);

            return (
              <Link
                key={p.id}
                href={`/produk/${p.slug}`}
                ref={(el) => {
                  if (el) cardRefs.current.set(p.id, el);
                }}
                onMouseMove={(e) => handleMouseMove(e, p.id)}
                onMouseLeave={() => handleMouseLeave(p.id)}
                className="glass-card group relative overflow-hidden p-5 will-change-transform"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="flex items-center gap-3.5">
                  <ProductLogo name={p.name} imageUrl={p.image_url} />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                      {p.categories?.name ?? "Umum"}
                    </p>
                    <h3 className="mt-0.5 truncate font-display text-lg font-bold">
                      {p.name}
                    </h3>
                  </div>
                  <span
                    className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                      anyStock
                        ? "dot-live bg-signal-green"
                        : "dot-out bg-signal-red"
                    }`}
                    title={anyStock ? "Stok tersedia" : "Stok habis"}
                  />
                </div>

                <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-mono text-[10px] text-text-muted">
                      MULAI DARI
                    </p>
                    <p className="price-gradient font-display text-xl font-bold">
                      {cheapest ? formatIDR(cheapest.price) : "—"}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-text-muted transition-colors group-hover:text-signal-cyan">
                    Lihat detail →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
