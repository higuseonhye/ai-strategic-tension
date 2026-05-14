import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        background: "hsl(220 25% 5%)",
        foreground: "hsl(210 40% 96%)",
        card: "hsl(222 30% 7%)",
        cardForeground: "hsl(210 40% 96%)",
        muted: "hsl(220 14% 14%)",
        mutedForeground: "hsl(217 10% 65%)",
        border: "hsl(220 14% 16%)",
        primary: "hsl(8 90% 58%)",
        primaryForeground: "hsl(0 0% 100%)",
        accent: "hsl(35 95% 60%)",
        danger: "hsl(0 80% 60%)",
        success: "hsl(150 60% 50%)",
        tension: {
          low: "hsl(150 60% 50%)",
          mid: "hsl(40 95% 55%)",
          high: "hsl(8 90% 58%)",
          critical: "hsl(345 90% 55%)",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Inter",
          "sans-serif",
        ],
        display: ["ui-serif", "Georgia", "Cambria", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245, 76, 50, 0.4)" },
          "50%": { boxShadow: "0 0 24px 6px rgba(245, 76, 50, 0.25)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "45%": { opacity: ".4" },
          "55%": { opacity: ".85" },
        },
        slideUp: {
          from: { transform: "translateY(8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        marquee: {
          from: { transform: "translateX(0%)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
        flicker: "flicker 4s ease-in-out infinite",
        slideUp: "slideUp .4s ease-out both",
        marquee: "marquee 30s linear infinite",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.6) 70%), linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
