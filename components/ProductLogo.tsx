"use client";

import { useState } from "react";

// Palet warna fallback (dipakai kalau produk belum ada image_url atau gambar gagal dimuat)
const FALLBACK_COLORS = [
  "#7C3AED",
  "#22D3EE",
  "#EC4899",
  "#4ADE80",
  "#FFB020",
  "#F1575B",
];

function colorFromName(name: string) {
  const idx = name.charCodeAt(0) % FALLBACK_COLORS.length;
  return FALLBACK_COLORS[idx];
}

export default function ProductLogo({
  name,
  imageUrl,
  size = 44,
}: {
  name: string;
  imageUrl?: string | null;
  size?: number;
}) {
  const [errored, setErrored] = useState(false);
  const showFallback = !imageUrl || errored;

  return (
    <div
      className="logo-badge"
      style={{
        width: size,
        height: size,
        background: showFallback ? colorFromName(name) : "#ffffff",
      }}
    >
      {showFallback ? (
        <span
          className="logo-badge-fallback"
          style={{ fontSize: size * 0.4, color: "#fff" }}
        >
          {name.charAt(0).toUpperCase()}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={`${name} logo`}
          onError={() => setErrored(true)}
        />
      )}
    </div>
  );
}
