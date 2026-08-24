import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutButton } from "./logout-button";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export function DashboardShell({
  navItems,
  title,
  children,
}: {
  navItems: NavItem[];
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl">
      <aside className="hidden w-60 shrink-0 border-r border-border py-6 pr-4 md:block">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 px-3">
          <LogoutButton />
        </div>
      </aside>

      <div className="flex-1 px-4 py-6">
        <nav className="mb-4 flex gap-2 overflow-x-auto md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium"
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}
