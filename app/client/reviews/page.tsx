import Link from "next/link";
import { requireUser } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { RatingStars } from "@/components/shared/rating-stars";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "Mes avis" };

export default async function ClientReviewsPage() {
  const me = await requireUser("client");
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, artisan:artisans!inner(id, profile:profiles!artisans_id_fkey(display_name, company_name))")
    .eq("client_id", me.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold">Mes avis</h1>
      {!data || data.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">Vous n&apos;avez laissé aucun avis.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {data.map((r) => {
            const artisan = r.artisan as unknown as { id: string; profile: { display_name: string | null; company_name: string | null } };
            return (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <Link href={`/artisans/${artisan.id}`} className="font-medium hover:underline">
                    {artisan.profile.company_name || artisan.profile.display_name}
                  </Link>
                  <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
                </div>
                <RatingStars value={r.rating} />
                {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
