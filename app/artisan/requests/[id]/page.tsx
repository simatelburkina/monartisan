import { notFound } from "next/navigation";
import { requireUser } from "@/lib/data/auth";
import { getRequestDetail } from "@/lib/data/requests";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/shared/status-badge";
import { RequestItemResponder } from "@/components/shared/request-item-responder";
import { QuoteForm } from "@/components/shared/quote-form";
import { formatDate, formatFCFA, URGENCY_LABELS } from "@/lib/utils/format";

export default async function ArtisanRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await requireUser("artisan");
  const request = await getRequestDetail(id);
  if (!request) notFound();

  const supabase = await createClient();
  const { data: myCats } = await supabase.from("artisan_categories").select("category_id").eq("artisan_id", me.id);
  const myCategoryIds = new Set((myCats || []).map((c) => c.category_id));

  const media = (request.request_media as Array<{ id: string; media_url: string }>) || [];
  const items = (request.request_items as Array<Record<string, unknown>>).filter((it) =>
    myCategoryIds.has(it.category_id as string)
  );

  if (items.length === 0) notFound();

  return (
    <div className="mx-auto max-w-2xl">
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

      <p className="mt-4 whitespace-pre-line rounded-2xl border border-border bg-card p-4 text-sm">{request.description}</p>

      {media.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {media.map((m) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={m.id} src={m.media_url} alt="" className="aspect-square rounded-xl object-cover" />
          ))}
        </div>
      )}

      {(request.budget_min || request.budget_max) && (
        <p className="mt-3 text-sm text-muted-foreground">
          💰 Budget indicatif : {formatFCFA(request.budget_min as number)} - {formatFCFA(request.budget_max as number)}
        </p>
      )}

      <h2 className="mt-6 text-lg font-semibold">Prestation(s) correspondant à votre métier</h2>
      <div className="mt-3 flex flex-col gap-4">
        {items.map((item) => {
          const category = item.categories as { name: string; icon: string };
          const responses = (item.request_responses as Array<Record<string, unknown>>) || [];
          const myResponse = responses.find((r) => r.artisan_id === me.id);
          const quotes = (item.quotes as Array<Record<string, unknown>>) || [];
          const myQuote = quotes.find((q) => q.artisan_id === me.id);

          return (
            <div key={item.id as string} className="rounded-2xl border border-border bg-card p-4">
              <p className="font-semibold">
                {category?.icon} {category?.name}
              </p>
              {(item.description as string) && <p className="mt-1 text-sm text-muted-foreground">{item.description as string}</p>}

              <div className="mt-3">
                <RequestItemResponder itemId={item.id as string} existingDecision={myResponse?.decision as string | undefined} />
              </div>

              {myQuote ? (
                <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm">
                  Devis envoyé : {formatFCFA(myQuote.total_amount as number)} — statut : {myQuote.status as string}
                </p>
              ) : (
                <div className="mt-3">
                  <QuoteForm requestItemId={item.id as string} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
