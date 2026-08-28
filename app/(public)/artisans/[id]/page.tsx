import { notFound } from "next/navigation";
import { MapPin, Wrench, ClipboardPlus } from "lucide-react";
import { getArtisanById, getArtisanReviews } from "@/lib/data/artisans";
import { getCurrentUser } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { RatingStars } from "@/components/shared/rating-stars";
import { VerifiedBadge } from "@/components/shared/status-badge";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { ContactArtisanButton } from "@/components/shared/contact-artisan-button";
import { CategoryIcon } from "@/lib/utils/category-icons";
import { initials, timeAgo, formatFCFA } from "@/lib/utils/format";
import Link from "next/link";

export default async function ArtisanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [artisan, reviews, me] = await Promise.all([
    getArtisanById(id),
    getArtisanReviews(id),
    getCurrentUser(),
  ]);
  if (!artisan) notFound();

  const profile = artisan.profile as Record<string, unknown>;
  const name = (profile.company_name as string) || (profile.display_name as string) || "Artisan";
  const categories = (artisan.artisan_categories as Array<{ hourly_rate: number | null; categories: { id: string; name: string; slug: string; icon: string } }>) || [];
  const zones = (artisan.artisan_zones as Array<{ city: string; district: string | null }>) || [];
  const portfolio = (artisan.portfolio_items as Array<{ id: string; image_url: string; caption: string | null }>) || [];
  const availability = (artisan.artisan_availability as Array<{ id: string; weekday: number; start_time: string; end_time: string }>) || [];
  const WEEKDAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  let isFavorited = false;
  if (me?.role === "client") {
    const supabase = await createClient();
    const { data } = await supabase
      .from("favorites")
      .select("*")
      .eq("client_id", me.id)
      .eq("artisan_id", id)
      .maybeSingle();
    isFavorited = Boolean(data);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-start">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url as string} alt={name} className="h-24 w-24 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
            {initials(name)}
          </div>
        )}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{name}</h1>
            {Boolean(artisan.is_verified) && <VerifiedBadge />}
          </div>
          <p className="mt-1 text-muted-foreground">{artisan.headline as string}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <RatingStars value={Number(artisan.rating_avg) || 0} count={Number(artisan.rating_count) || 0} />
            {profile.city ? (
              <span className="flex items-center gap-1">
                <MapPin size={14} strokeWidth={1.75} /> {profile.city as string}
              </span>
            ) : null}
            <span className="flex items-center gap-1">
              <Wrench size={14} strokeWidth={1.75} /> {artisan.years_experience as number} ans d&apos;expérience
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <ContactArtisanButton artisanId={id} isClient={me?.role === "client"} />
            <FavoriteButton artisanId={id} initialFavorited={isFavorited} isClient={me?.role === "client"} />
            {me?.role === "client" && (
              <Link
                href={`/client/requests/new?artisan=${id}`}
                className="btn-secondary flex items-center gap-1.5"
              >
                <ClipboardPlus size={16} strokeWidth={1.75} /> Demander un devis
              </Link>
            )}
          </div>
        </div>
      </div>

      {artisan.description ? (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">À propos</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{artisan.description as string}</p>
        </section>
      ) : null}

      {categories.length > 0 && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Spécialités & tarifs indicatifs</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((c) => (
              <span key={c.categories.id} className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm">
                <CategoryIcon slug={c.categories.slug} size={15} />
                {c.categories.name}
                {c.hourly_rate ? ` — ${formatFCFA(c.hourly_rate)}/h` : ""}
              </span>
            ))}
          </div>
        </section>
      )}

      {zones.length > 0 && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Zones d&apos;intervention</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {zones.map((z) => `${z.city}${z.district ? ` (${z.district})` : ""}`).join(" · ")}
          </p>
        </section>
      )}

      {availability.length > 0 && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Disponibilités</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {availability
              .slice()
              .sort((a, b) => a.weekday - b.weekday)
              .map((a) => (
                <span key={a.id} className="rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground">
                  {WEEKDAYS[a.weekday]} {a.start_time.slice(0, 5)}–{a.end_time.slice(0, 5)}
                </span>
              ))}
          </div>
        </section>
      )}

      {portfolio.length > 0 && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Réalisations</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {portfolio.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id} src={p.image_url} alt={p.caption || ""} className="aspect-square w-full rounded-xl object-cover" />
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold">Avis clients ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Aucun avis pour le moment.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-4">
            {reviews.map((r) => {
              const review = r as { id: string; rating: number; comment: string | null; created_at: string; client: { profile: { display_name: string | null } } };
              return (
                <div key={review.id} className="border-t border-border pt-3 first:border-t-0 first:pt-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{review.client?.profile?.display_name || "Client"}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(review.created_at)}</span>
                  </div>
                  <RatingStars value={review.rating} />
                  {review.comment && <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
