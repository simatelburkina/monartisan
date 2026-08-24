import { getAllBookings } from "@/lib/data/admin";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatFCFA } from "@/lib/utils/format";

export const metadata = { title: "Prestations" };

export default async function AdminBookingsPage() {
  const bookings = await getAllBookings();
  return (
    <div>
      <h1 className="text-2xl font-bold">Toutes les prestations</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Prestation</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Artisan</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const client = b.client as unknown as { profile: { display_name: string | null } };
              const artisan = b.artisan as unknown as { profile: { display_name: string | null; company_name: string | null } };
              const item = b.request_item as unknown as { categories: { name: string } | null };
              return (
                <tr key={b.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{item.categories?.name}</td>
                  <td className="px-4 py-3">{client.profile.display_name}</td>
                  <td className="px-4 py-3">{artisan.profile.company_name || artisan.profile.display_name}</td>
                  <td className="px-4 py-3">{formatFCFA(b.amount)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(b.created_at)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
