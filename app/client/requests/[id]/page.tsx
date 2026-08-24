import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/data/auth";
import { getRequestDetail } from "@/lib/data/requests";
import { StatusBadge } from "@/components/shared/status-badge";
import { RatingStars } from "@/components/shared/rating-stars";
import { VerifiedBadge } from "@/components/shared/status-badge";
import { QuoteActions } from "@/components/shared/quote-actions";
import { formatDate, formatFCFA, URGENCY_LABELS } from "@/lib/utils/format";

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await requireUser("client");
  const request = await getRequestDetail(id);
  if (!request || request.client_id !== me.id) notFound();

  const media = (request.request_media as Array<{ id: string; media_url: string }>) || [];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{request.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Publiée le {formatDate(request.created_at)} · {URGENCY_LABELS[request.urgency]}
            {request.city ? ` · 📍 ${request.city}` : ""}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <p className="mt-4 whitespace-pre-line rounded-2xl border border-border bg-card p-4 text-sm">
        {request.description}
      </p>

      {media.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {media.map((m) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={m.id} src={m.media_url} alt="" className="aspect-square rounded-xl object-cover" />
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
        {(request.budget_min || request.budget_max) && (
          <span>
            💰 Budget : {formatFCFA(request.budget_min)} - {formatFCFA(request.budget_max)}
          </span>
        )}
        {request.desired_date && <span>📅 Souhaité le {formatDate(request.desired_date)}</span>}
      </div>

      <h2 className="mt-8 text-lg font-semibold">Prestations & devis reçus</h2>
      <div className="mt-4 flex flex-col gap-4">
        {(request.request_items as Array<Record<string, unknown>>).map((item) => {
          const category = item.categories as { name: string; icon: string };
          const quotes = (item.quotes as Array<Record<string, unknown>>) || [];
          const responses = (item.request_responses as Array<Record<string, unknown>>) || [];
          return (
            <div key={item.id as string} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">
                  {category?.icon} {category?.name}
                </p>
                <span className="text-xs text-muted-foreground">{item.status as string}</span>
              </div>
              {(item.description as string) && (
                <p className="mt-1 text-sm text-muted-foreground">{item.description as string}</p>
              )}

              {responses.length > 0 && quotes.length === 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {responses.length} artisan(s) intéressé(s), en attente de devis.
                </p>
              )}

              {quotes.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">Aucun devis reçu pour cette prestation.</p>
              ) : (
                <div className="mt-3 flex flex-col gap-3">
                  {quotes.map((q) => {
                    const artisan = q.artisan as {
                      id: string;
                      is_verified: boolean;
                      rating_avg: number;
                      rating_count: number;
                      profile: { display_name: string | null; company_name: string | null };
                    };
                    return (
                      <div key={q.id as string} className="rounded-xl border border-border p-3">
                        <div className="flex items-center justify-between">
                          <Link href={`/artisans/${artisan.id}`} className="flex items-center gap-1.5 font-medium hover:underline">
                            {artisan.profile.company_name || artisan.profile.display_name}
                            {artisan.is_verified && <VerifiedBadge />}
                          </Link>
                          <span className="font-semibold text-primary">{formatFCFA(q.total_amount as number)}</span>
                        </div>
                        <RatingStars value={artisan.rating_avg} count={artisan.rating_count} />
                        <p className="mt-2 text-sm">{q.description as string}</p>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <span>Main d&apos;œuvre : {formatFCFA(q.labor_cost as number)}</span>
                          <span>Matériaux : {formatFCFA(q.materials_cost as number)}</span>
                          <span>Frais : {formatFCFA(q.extra_fees as number)}</span>
                        </div>
                        {q.delay_days ? <p className="mt-1 text-xs text-muted-foreground">Délai : {q.delay_days as number} jour(s)</p> : null}
                        <p className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-xs">{q.status as string}</p>
                        <QuoteActions quoteId={q.id as string} status={q.status as string} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
