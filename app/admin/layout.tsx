import type { ReactNode } from "react";
import { requireUser } from "@/lib/data/auth";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Tableau de bord", icon: "🏠" },
  { href: "/admin/users", label: "Utilisateurs", icon: "👥" },
  { href: "/admin/artisans", label: "Artisans", icon: "🧰" },
  { href: "/admin/categories", label: "Catégories", icon: "🗂️" },
  { href: "/admin/requests", label: "Demandes", icon: "📝" },
  { href: "/admin/bookings", label: "Prestations", icon: "📅" },
  { href: "/admin/reviews", label: "Avis", icon: "⭐" },
  { href: "/admin/complaints", label: "Réclamations", icon: "🚩" },
  { href: "/admin/payments", label: "Paiements", icon: "💳" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const me = await requireUser("admin");
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader userId={me.id} />
      <DashboardShell navItems={NAV_ITEMS} title="Administration">
        {children}
      </DashboardShell>
    </div>
  );
}
