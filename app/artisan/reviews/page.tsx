import { requireUser } from "@/lib/data/auth";
import { getArtisanReviews } from "@/lib/data/artisans";
import { RatingStars } from "@/components/shared/rating-stars";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "Mes avis" };

export default async function ArtisanReviewsPage() {
  const me = await requireUser("artisan");
  const reviews = await getArtisanReviews(me.id);

  return (
    <div>
      <h1 className="text-2xl font-bold">Avis reçus</h1>
      {reviews.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">Aucun avis pour le moment.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {reviews.map((r) => {
            const review = r as unknown as { id: string; rating: number; comment: string | null; created_at: string; client: { profile: { display_name: string | null } } };
            return (
              <div key={review.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{review.client?.profile?.display_name || "Client"}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                </div>
                <RatingStars value={review.rating} />
                {review.comment && <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
