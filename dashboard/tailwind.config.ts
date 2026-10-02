import type { Config } from "tailwindcss";

/**
 * Design tokens per PLAN-v2 §3.1. CSS custom properties live in globals.css
 * and are switched via [data-theme="light|dark"] on <html>.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-2": "var(--bg-2)",
        text: "var(--text)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        "accent-text": "var(--accent-text)",
        border: "var(--border)",
        "canvas-dark": "var(--canvas-dark)",
      },
      fontFamily: {
        sans: [
          '"Bricolage Grotesque"',
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: ['ui-monospace', '"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
