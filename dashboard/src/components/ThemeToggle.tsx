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
      className="rounded-lg border border-border bg-bg-2 px-3 py-1.5 text-sm text-muted transition-colors hover:text-text"
    >
      {theme === "light" ? "☾" : "☀"}
    </button>
  );
}
