"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current =
      (document.documentElement.getAttribute("data-theme") as
        | "light"
        | "dark") ?? "light";
    setTheme(current);
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("stacklab-theme", next);
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "light" ? "Passer en sombre" : "Passer en clair"}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-transparent text-muted transition-[color,border-color,background] duration-200 ease-out hover:border-muted hover:bg-bg-2 hover:text-text active:scale-95"
    >
      <span className="font-mono text-sm leading-none" aria-hidden>
        {theme === "light" ? "☾" : "☀"}
      </span>
    </button>
  );
}
