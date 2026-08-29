import { getAllUsers } from "@/lib/data/admin";
import { UserStatusActions, UserEditButton } from "@/components/shared/user-status-actions";
import { initials, formatDate } from "@/lib/utils/format";

export const metadata = { title: "Utilisateurs" };

const ROLE_LABELS: Record<string, string> = { client: "Client", artisan: "Artisan", admin: "Admin" };
const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  suspended: "bg-orange-100 text-orange-800",
  banned: "bg-red-100 text-red-800",
};

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const users = await getAllUsers(q);

  return (
    <div>
      <h1 className="text-2xl font-bold">Utilisateurs</h1>
      <form className="mt-4">
        <input name="q" defaultValue={q} placeholder="Rechercher un nom, email, téléphone..." className="input max-w-sm" />
      </form>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Inscrit le</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="flex items-center gap-2 px-4 py-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {initials(u.display_name)}
                  </span>
                  {u.display_name || "—"}
                </td>
                <td className="px-4 py-3">{ROLE_LABELS[u.role]}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {u.email}
                  <br />
                  {u.phone}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[u.status]}`}>{u.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <UserEditButton user={u} />
                    {u.role !== "admin" && <UserStatusActions userId={u.id} status={u.status} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
