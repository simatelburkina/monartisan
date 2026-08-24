import Link from "next/link";
import { requireUser } from "@/lib/data/auth";
import { getArtisanQuotes } from "@/lib/data/requests";
import { formatDate, formatFCFA } from "@/lib/utils/format";

export const metadata = { title: "Mes devis" };

const STATUS_LABELS: Record<string, string> = {
  sent: "Envoyé",
  accepted: "Accepté",
  rejected: "Refusé",
  modification_requested: "Modification demandée",
  expired: "Expiré",
};

export default async function ArtisanQuotesPage() {
  const me = await requireUser("artisan");
  const quotes = await getArtisanQuotes(me.id);

  return (
    <div>
      <h1 className="text-2xl font-bold">Mes devis</h1>
      {quotes.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">Vous n&apos;avez envoyé aucun devis.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {quotes.map((q) => {
            const item = q.request_items as unknown as {
              id: string;
              description: string | null;
              categories: { name: string; icon: string } | null;
              requests: { id: string; title: string; city: string | null };
            };
            return (
              <Link
                key={q.id}
                href={`/artisan/requests/${item.requests.id}`}
                className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-card p-4 hover:shadow-sm"
              >
                <div>
                  <p className="font-semibold">
                    {item.categories?.icon} {item.requests.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(q.created_at)} · {formatFCFA(q.total_amount)}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs">{STATUS_LABELS[q.status] || q.status}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
