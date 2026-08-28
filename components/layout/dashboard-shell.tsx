"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ChevronsLeft, ChevronsRight, MoreHorizontal, X } from "lucide-react";
import { LogoutButton } from "./logout-button";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const COLLAPSE_KEY = "ma-sidebar-collapsed";
const MOBILE_PRIMARY_COUNT = 4;

function useIsActive(pathname: string) {
  return (href: string) => {
    const isRoot = href === "/client" || href === "/artisan" || href === "/admin";
    return isRoot ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  };
}

export function DashboardShell({
  navItems,
  title,
  headerRight,
  children,
}: {
  navItems: NavItem[];
  title: string;
  headerRight?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isActive = useIsActive(pathname);
  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs with localStorage, client-only by nature
    if (window.localStorage.getItem(COLLAPSE_KEY) === "1") setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  const primaryItems = navItems.slice(0, MOBILE_PRIMARY_COUNT);
  const overflowItems = navItems.slice(MOBILE_PRIMARY_COUNT);

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4">
          <Image src="/icons/logo-mark.png" alt="" width={36} height={36} className="h-9 w-9 shrink-0" priority />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight">MON ARTISAN</p>
              <p className="truncate text-[11px] leading-tight text-sidebar-muted-foreground">{title}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary/15 text-primary"
                        : "text-sidebar-foreground/85 hover:bg-white/5 hover:text-sidebar-foreground"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    <item.icon size={18} strokeWidth={1.75} className="shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-sidebar-border p-3">
          <button
            onClick={toggleCollapsed}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-muted-foreground hover:bg-white/5 hover:text-sidebar-foreground ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {collapsed ? (
              <ChevronsRight size={18} strokeWidth={1.75} />
            ) : (
              <ChevronsLeft size={18} strokeWidth={1.75} />
            )}
            {!collapsed && "Réduire"}
          </button>
          <div className={collapsed ? "mt-1 flex justify-center" : "mt-1"}>
            <LogoutButton variant={collapsed ? "sidebar-compact" : "sidebar"} />
          </div>
        </div>
      </aside>

      <div
        className={`flex min-h-screen flex-col transition-[margin] duration-200 ${
          collapsed ? "md:ml-[76px]" : "md:ml-64"
        }`}
      >
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur">
          <div className="flex min-w-0 items-center gap-2">
            <Image src="/icons/logo-mark.png" alt="" width={32} height={32} className="h-8 w-8 shrink-0 md:hidden" />
            <span className="truncate text-sm font-bold md:hidden">MON ARTISAN</span>
            <p className="hidden truncate text-sm font-semibold text-foreground md:block">{title}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">{headerRight}</div>
        </header>

        <main className="flex-1 px-4 pb-24 pt-5 md:pb-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {primaryItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon size={20} strokeWidth={active ? 2.25 : 1.75} />
              <span className="max-w-[4.5rem] truncate">{item.label}</span>
            </Link>
          );
        })}
        {overflowItems.length > 0 && (
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
              overflowItems.some((item) => isActive(item.href)) ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <MoreHorizontal size={20} strokeWidth={1.75} />
            <span>Plus</span>
          </button>
        )}
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMoreOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-border bg-card p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Plus d&apos;options</p>
              <button
                onClick={() => setMoreOpen(false)}
                aria-label="Fermer"
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>
            <ul className="grid grid-cols-3 gap-2">
              {overflowItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border border-border px-2 py-3 text-xs font-medium ${
                      isActive(item.href) ? "border-primary/40 bg-primary/10 text-primary" : "text-foreground"
                    }`}
                  >
                    <item.icon size={20} strokeWidth={1.75} />
                    <span className="text-center leading-tight">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t border-border pt-3">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
