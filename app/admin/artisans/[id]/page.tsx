import { notFound } from "next/navigation";
import { getArtisanAdminDetail } from "@/lib/data/admin";
import { VerifyArtisanButton } from "@/components/shared/verify-artisan-button";
import { DocumentReviewActions } from "@/components/shared/document-review-actions";
import { RatingStars } from "@/components/shared/rating-stars";
import { formatDate } from "@/lib/utils/format";

export default async function AdminArtisanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artisan = await getArtisanAdminDetail(id);
  if (!artisan) notFound();

  const profile = artisan.profile as unknown as {
    display_name: string | null;
    company_name: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
  };
  const documents = artisan.documents as Array<{ id: string; doc_type: string; file_url: string; status: string; created_at: string }>;
  const categories = (artisan.artisan_categories as Array<{ hourly_rate: number | null; categories: { name: string; icon: string } }>) || [];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{profile.company_name || profile.display_name}</h1>
          <p className="text-sm text-muted-foreground">
            {profile.email} · {profile.phone} · {profile.city}
          </p>
          <RatingStars value={artisan.rating_avg} count={artisan.rating_count} />
        </div>
        <VerifyArtisanButton artisanId={artisan.id} isVerified={artisan.is_verified} />
      </div>

      {artisan.description && (
        <p className="mt-4 whitespace-pre-line rounded-2xl border border-border bg-card p-4 text-sm">{artisan.description}</p>
      )}

      {categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c, i) => (
            <span key={i} className="rounded-full bg-muted px-3 py-1 text-sm">
              {c.categories.icon} {c.categories.name}
            </span>
          ))}
        </div>
      )}

      <h2 className="mt-6 font-semibold">Documents justificatifs</h2>
      {documents.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">Aucun document envoyé.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {documents.map((d) => (
            <div key={d.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <a href={d.file_url} target="_blank" rel="noreferrer" className="font-medium underline">
                  {d.doc_type}
                </a>
                <span className="text-xs text-muted-foreground">{formatDate(d.created_at)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Statut : {d.status}</p>
              {d.status === "pending" && <DocumentReviewActions docId={d.id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
