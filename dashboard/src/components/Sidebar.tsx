"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { apiGet } from "@/lib/api";

const NAV = [
  { href: "/dashboard", label: "Vue d'ensemble", exact: true },
  { href: "/dashboard/messages", label: "Messages", exact: false },
  { href: "/dashboard/projects", label: "Projets", exact: false },
  { href: "/dashboard/settings", label: "Réglages", exact: false },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [unread, setUnread] = useState<number | null>(null);

  // Unread badge polling (30-60s).
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await apiGet<{ messages: unknown[] }>(
          "/api/admin/messages?status=unread",
        );
        if (active) setUnread(data.messages.length);
      } catch {
        if (active) setUnread(null);
      }
    };
    load();
    const timer = setInterval(load, 45000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [pathname]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <aside className="flex w-full shrink-0 flex-col justify-between border-b border-border bg-bg-2 md:h-screen md:w-60 md:border-b-0 md:border-r">
      <div>
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/dashboard" className="font-extrabold tracking-tight">
            <span className="rounded-md bg-accent px-2 py-1 text-accent-text">
              StackLab
            </span>
          </Link>
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
        <nav className="flex flex-row gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-0">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-accent font-semibold text-accent-text"
                    : "text-muted hover:bg-bg hover:text-text"
                }`}
              >
                <span>{item.label}</span>
                {item.href.endsWith("messages") &&
                  unread !== null &&
                  unread > 0 && (
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${
                        active ? "bg-accent-text text-accent" : "bg-accent text-accent-text"
                      }`}
                    >
                      {unread}
                    </span>
                  )}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center justify-between px-5 py-4">
        <div className="hidden md:block">
          <ThemeToggle />
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-text"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
