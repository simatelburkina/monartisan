import Link from "next/link";
import { ClipboardPlus } from "lucide-react";
import { requireUser } from "@/lib/data/auth";
import { getClientRequests, getBookingsFor } from "@/lib/data/requests";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "Tableau de bord" };

export default async function ClientDashboardPage() {
  const me = await requireUser("client");
  const [requests, bookings] = await Promise.all([getClientRequests(me.id), getBookingsFor(me.id, "client")]);

  const active = requests.filter((r) => !["closed", "cancelled"].includes(r.status));
  const activeBookings = bookings.filter((b) => !["closed", "paid"].includes(b.status));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Bonjour {me.first_name || ""}</h1>
        <p className="text-muted-foreground">Voici un aperçu de votre activité.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Demandes actives", value: active.length, href: "/client/requests" },
          { label: "Prestations en cours", value: activeBookings.length, href: "/client/bookings" },
          { label: "Total demandes", value: requests.length, href: "/client/requests" },
          { label: "Total prestations", value: bookings.length, href: "/client/bookings" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href} className="rounded-2xl border border-border bg-card p-4 hover:shadow-md">
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </Link>
        ))}
      </div>

      <Link href="/client/requests/new" className="btn-primary flex w-fit items-center gap-1.5">
        <ClipboardPlus size={16} strokeWidth={1.75} /> Publier une nouvelle demande
      </Link>

      <section>
        <h2 className="mb-3 font-semibold">Demandes récentes</h2>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune demande publiée pour le moment.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {requests.slice(0, 5).map((r) => (
              <Link
                key={r.id}
                href={`/client/requests/${r.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:shadow-sm"
              >
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">Publiée le {formatDate(r.created_at)}</p>
                </div>
                <StatusBadge status={r.status} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
