import type { Config } from "tailwindcss";

/**
 * Design tokens — ported from the public site (site/src/styles/global.css).
 * Monochrome system: the "accent" is text/bg inversion, never a hue.
 * CSS custom properties live in globals.css and are switched via
 * [data-theme="light|dark"] on <html>.
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
        border: "var(--border)",
      },
      fontFamily: {
        sans: [
          "var(--font-archivo)",
          '"Archivo"',
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        serif: [
          "var(--font-instrument)",
          '"Instrument Serif"',
          "serif",
        ],
        mono: [
          "ui-monospace",
          '"SF Mono"',
          '"Cascadia Mono"',
          '"Segoe UI Mono"',
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
