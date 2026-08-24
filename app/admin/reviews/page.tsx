import { getAllReviews } from "@/lib/data/admin";
import { RatingStars } from "@/components/shared/rating-stars";
import { ReviewModerationActions } from "@/components/shared/review-moderation-actions";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "Avis" };

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();
  return (
    <div>
      <h1 className="text-2xl font-bold">Modération des avis</h1>
      <div className="mt-6 flex flex-col gap-3">
        {reviews.map((r) => {
          const client = r.client as unknown as { profile: { display_name: string | null } };
          const artisan = r.artisan as unknown as { profile: { display_name: string | null; company_name: string | null } };
          return (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  <span className="font-medium">{client.profile.display_name}</span> → {artisan.profile.company_name || artisan.profile.display_name}
                </p>
                <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
              </div>
              <RatingStars value={r.rating} />
              {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
              {r.is_hidden && <p className="mt-1 text-xs text-danger">Masqué — {r.hidden_reason}</p>}
              <div className="mt-2">
                <ReviewModerationActions reviewId={r.id} isHidden={r.is_hidden} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
