import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A18",
        glass: {
          DEFAULT: "rgba(255,255,255,0.06)",
          border: "rgba(255,255,255,0.14)",
          hover: "rgba(255,255,255,0.12)",
        },
        blob: {
          violet: "#7C3AED",
          cyan: "#22D3EE",
          pink: "#EC4899",
        },
        signal: {
          amber: "#FFB020",
          green: "#4ADE80",
          red: "#FB7185",
          cyan: "#7EE8F9",
          violet: "#C4B5FD",
        },
        text: {
          DEFAULT: "#F1F0FA",
          muted: "#A9A6C9",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        float1: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(40px, 30px) scale(1.08)" },
        },
        float2: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(-30px, 40px) scale(1.05)" },
        },
        float3: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(30px, -30px) scale(1.1)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        cardIn: {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        float1: "float1 14s ease-in-out infinite",
        float2: "float2 18s ease-in-out infinite",
        float3: "float3 16s ease-in-out infinite",
        fadeUp: "fadeUp 0.6s ease-out forwards",
        cardIn: "cardIn 0.5s ease-out forwards",
        pulseSoft: "pulseSoft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
