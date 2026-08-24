import Link from "next/link";
import { requireUser } from "@/lib/data/auth";
import { getMatchingRequestsForArtisan } from "@/lib/data/requests";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatFCFA, timeAgo, URGENCY_LABELS } from "@/lib/utils/format";

export const metadata = { title: "Nouvelles demandes" };

export default async function ArtisanRequestsFeedPage() {
  const me = await requireUser("artisan");
  const items = await getMatchingRequestsForArtisan(me.id);

  return (
    <div>
      <h1 className="text-2xl font-bold">Demandes correspondant à votre métier</h1>
      {items.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">
          Aucune demande pour le moment. Complétez votre profil pour recevoir plus de demandes.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {items.map((it) => {
            const req = it.requests as unknown as {
              id: string;
              title: string;
              description: string;
              city: string | null;
              desired_date: string | null;
              urgency: string;
              budget_min: number | null;
              budget_max: number | null;
              status: string;
              created_at: string;
            };
            const category = it.categories as { name: string; icon: string } | null;
            const myResponse = ((it.request_responses as Array<{ artisan_id: string; decision: string }>) || []).find(
              (r) => r.artisan_id === me.id
            );
            return (
              <Link
                key={it.id as string}
                href={`/artisan/requests/${req.id}`}
                className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {category?.icon} {req.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{req.description}</p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {req.city && <span>📍 {req.city}</span>}
                  <span>⏱ {URGENCY_LABELS[req.urgency]}</span>
                  {(req.budget_min || req.budget_max) && (
                    <span>
                      💰 {formatFCFA(req.budget_min)} - {formatFCFA(req.budget_max)}
                    </span>
                  )}
                  <span>{timeAgo(req.created_at)}</span>
                  {myResponse && (
                    <span className="rounded-full bg-muted px-2 py-0.5">Vous avez déjà répondu : {myResponse.decision}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
