import type { ReactNode } from "react";
import { Home, Inbox, FileText, CalendarCheck, MessageCircle, Star, ShieldCheck, User } from "lucide-react";
import { requireUser } from "@/lib/data/auth";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";

const NAV_ITEMS: NavItem[] = [
  { href: "/artisan", label: "Tableau de bord", icon: Home },
  { href: "/artisan/requests", label: "Nouvelles demandes", icon: Inbox },
  { href: "/artisan/quotes", label: "Mes devis", icon: FileText },
  { href: "/artisan/bookings", label: "Prestations", icon: CalendarCheck },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/artisan/reviews", label: "Mes avis", icon: Star },
  { href: "/artisan/documents", label: "Vérification", icon: ShieldCheck },
  { href: "/artisan/profile", label: "Mon profil", icon: User },
];

export default async function ArtisanLayout({ children }: { children: ReactNode }) {
  const me = await requireUser("artisan");
  return (
    <>
      <DashboardShell navItems={NAV_ITEMS} title="Espace artisan" headerRight={<DashboardHeader userId={me.id} />}>
        {children}
      </DashboardShell>
      <WhatsAppButton />
    </>
  );
}
