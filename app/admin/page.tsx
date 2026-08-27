import Link from "next/link";
import { Users, Wrench, ClipboardList, CalendarCheck, Flag, FileCheck } from "lucide-react";
import { getAdminStats } from "@/lib/data/admin";

export const metadata = { title: "Administration" };

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Clients", value: stats.clients, href: "/admin/users", icon: Users },
    { label: "Artisans", value: stats.artisans, href: "/admin/artisans", icon: Wrench },
    { label: "Demandes publiées", value: stats.requests, href: "/admin/requests", icon: ClipboardList },
    { label: "Prestations", value: stats.bookings, href: "/admin/bookings", icon: CalendarCheck },
    { label: "Réclamations ouvertes", value: stats.complaintsOpen, href: "/admin/complaints", icon: Flag },
    { label: "Documents à valider", value: stats.pendingDocs, href: "/admin/artisans", icon: FileCheck },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Tableau de bord administrateur</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-2xl border border-border bg-card p-5 hover:shadow-md">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <c.icon size={22} strokeWidth={1.75} />
            </span>
            <p className="mt-3 text-2xl font-bold text-primary">{c.value}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
