import type { ReactNode } from "react";
import { requireUser } from "@/lib/data/auth";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";

const NAV_ITEMS: NavItem[] = [
  { href: "/client", label: "Tableau de bord", icon: "🏠" },
  { href: "/client/requests", label: "Mes demandes", icon: "📝" },
  { href: "/client/bookings", label: "Mes prestations", icon: "📅" },
  { href: "/messages", label: "Messages", icon: "💬" },
  { href: "/client/favorites", label: "Favoris", icon: "❤️" },
  { href: "/client/reviews", label: "Mes avis", icon: "⭐" },
  { href: "/client/profile", label: "Mon profil", icon: "👤" },
];

export default async function ClientLayout({ children }: { children: ReactNode }) {
  const me = await requireUser("client");
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader userId={me.id} />
      <DashboardShell navItems={NAV_ITEMS} title="Espace client">
        {children}
      </DashboardShell>
      <WhatsAppButton />
    </div>
  );
}
