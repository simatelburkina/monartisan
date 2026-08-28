import type { ReactNode } from "react";
import { Home, Users, Wrench, LayoutGrid, ClipboardList, CalendarCheck, Star, Flag, CreditCard } from "lucide-react";
import { requireUser } from "@/lib/data/auth";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Tableau de bord", icon: <Home /> },
  { href: "/admin/users", label: "Utilisateurs", icon: <Users /> },
  { href: "/admin/artisans", label: "Artisans", icon: <Wrench /> },
  { href: "/admin/categories", label: "Catégories", icon: <LayoutGrid /> },
  { href: "/admin/requests", label: "Demandes", icon: <ClipboardList /> },
  { href: "/admin/bookings", label: "Prestations", icon: <CalendarCheck /> },
  { href: "/admin/reviews", label: "Avis", icon: <Star /> },
  { href: "/admin/complaints", label: "Réclamations", icon: <Flag /> },
  { href: "/admin/payments", label: "Paiements", icon: <CreditCard /> },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const me = await requireUser("admin");
  return (
    <DashboardShell navItems={NAV_ITEMS} title="Administration" headerRight={<DashboardHeader userId={me.id} />}>
      {children}
    </DashboardShell>
  );
}
