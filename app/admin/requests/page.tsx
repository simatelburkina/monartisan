import { getAllRequests } from "@/lib/data/admin";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "Demandes" };

export default async function AdminRequestsPage() {
  const requests = await getAllRequests();
  return (
    <div>
      <h1 className="text-2xl font-bold">Toutes les demandes</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Demande</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Prestations</th>
              <th className="px-4 py-3">Publiée le</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => {
              const client = r.client as unknown as { profile: { display_name: string | null } };
              const items = (r.request_items as Array<{ id: string; categories: { name: string } | null }>) || [];
              return (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{r.title}</td>
                  <td className="px-4 py-3">{client.profile.display_name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {items.map((it) => it.categories?.name).join(", ")}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
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
