"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import StackLabLogo from "./StackLabLogo";
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
    <aside className="flex w-full shrink-0 flex-col justify-between border-b border-border bg-bg md:h-screen md:w-64 md:border-b-0 md:border-r">
      <div>
        <div className="flex items-center justify-between border-border px-5 py-5 md:border-b">
          <Link href="/dashboard" aria-label="StackLab — tableau de bord">
            <StackLabLogo height={30} />
          </Link>
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
        <nav className="flex flex-row gap-1 overflow-x-auto px-3 py-3 md:flex-col md:gap-1.5 md:overflow-visible md:px-3 md:py-4">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-[44px] items-center justify-between gap-3 rounded-full border px-4 py-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] transition-[color,background,border-color] duration-200 ease-out active:scale-[0.97] ${
                  active
                    ? "border-text bg-text text-bg"
                    : "border-transparent text-muted hover:border-border hover:bg-bg-2 hover:text-text"
                }`}
              >
                <span>{item.label}</span>
                {item.href.endsWith("messages") &&
                  unread !== null &&
                  unread > 0 && (
                    <span
                      className={`badge ${
                        active ? "badge-solid" : "badge-outline"
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
      <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
        <div className="hidden md:block">
          <ThemeToggle />
        </div>
        <button type="button" onClick={logout} className="btn-ghost">
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
