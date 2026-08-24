import type { ReactNode } from "react";
import { requireUser } from "@/lib/data/auth";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";

const NAV_ITEMS: NavItem[] = [
  { href: "/artisan", label: "Tableau de bord", icon: "🏠" },
  { href: "/artisan/requests", label: "Nouvelles demandes", icon: "📥" },
  { href: "/artisan/quotes", label: "Mes devis", icon: "🧾" },
  { href: "/artisan/bookings", label: "Prestations", icon: "📅" },
  { href: "/messages", label: "Messages", icon: "💬" },
  { href: "/artisan/reviews", label: "Mes avis", icon: "⭐" },
  { href: "/artisan/documents", label: "Vérification", icon: "📄" },
  { href: "/artisan/profile", label: "Mon profil", icon: "👤" },
];

export default async function ArtisanLayout({ children }: { children: ReactNode }) {
  const me = await requireUser("artisan");
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader userId={me.id} />
      <DashboardShell navItems={NAV_ITEMS} title="Espace artisan">
        {children}
      </DashboardShell>
      <WhatsAppButton />
    </div>
  );
}
