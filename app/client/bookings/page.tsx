import Link from "next/link";
import { requireUser } from "@/lib/data/auth";
import { getBookingsFor } from "@/lib/data/requests";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatFCFA } from "@/lib/utils/format";

export const metadata = { title: "Mes prestations" };

export default async function ClientBookingsPage() {
  const me = await requireUser("client");
  const bookings = await getBookingsFor(me.id, "client");

  return (
    <div>
      <h1 className="text-2xl font-bold">Mes prestations</h1>
      {bookings.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">Aucune prestation pour le moment.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {bookings.map((b) => {
            const artisan = b.artisan as unknown as { profile: { display_name: string | null; company_name: string | null } };
            const item = b.request_item as unknown as { categories: { name: string; icon: string } | null };
            return (
              <Link
                key={b.id}
                href={`/client/bookings/${b.id}`}
                className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-card p-4 hover:shadow-sm"
              >
                <div>
                  <p className="font-semibold">
                    {item.categories?.icon} {item.categories?.name} — {artisan.profile.company_name || artisan.profile.display_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(b.scheduled_date)} · {formatFCFA(b.amount)}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
