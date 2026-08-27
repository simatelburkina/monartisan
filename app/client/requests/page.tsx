import Link from "next/link";
import { Plus, MapPin } from "lucide-react";
import { requireUser } from "@/lib/data/auth";
import { getClientRequests } from "@/lib/data/requests";
import { StatusBadge } from "@/components/shared/status-badge";
import { CategoryIcon } from "@/lib/utils/category-icons";
import { formatDate, URGENCY_LABELS } from "@/lib/utils/format";

export const metadata = { title: "Mes demandes" };

export default async function ClientRequestsPage() {
  const me = await requireUser("client");
  const requests = await getClientRequests(me.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes demandes</h1>
        <Link href="/client/requests/new" className="btn-primary flex items-center gap-1.5">
          <Plus size={16} strokeWidth={2} /> Nouvelle demande
        </Link>
      </div>

      {requests.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">Vous n&apos;avez publié aucune demande.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {requests.map((r) => (
            <Link
              key={r.id}
              href={`/client/requests/${r.id}`}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">{r.title}</p>
                <p className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                  {formatDate(r.created_at)} · {URGENCY_LABELS[r.urgency]}
                  {r.city && (
                    <span className="flex items-center gap-1">
                      · <MapPin size={13} strokeWidth={1.75} /> {r.city}
                    </span>
                  )}
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {(r.request_items || []).map((it: { id: string; categories: { name: string; icon: string; slug: string } | null }) => (
                    <span key={it.id} className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                      {it.categories && <CategoryIcon slug={it.categories.slug} size={12} />} {it.categories?.name}
                    </span>
                  ))}
                </div>
              </div>
              <StatusBadge status={r.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
