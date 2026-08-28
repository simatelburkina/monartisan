import Link from "next/link";
import { MapPin } from "lucide-react";
import { RatingStars } from "./rating-stars";
import { VerifiedBadge } from "./status-badge";
import { initials } from "@/lib/utils/format";

export interface ArtisanCardData {
  id: string;
  display_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
  city: string | null;
  lat?: number | null;
  lng?: number | null;
  headline: string | null;
  rating_avg: number;
  rating_count: number;
  is_verified: boolean;
  years_experience?: number;
  distance_km?: number | null;
  categories?: string[];
}

export function ArtisanCard({ artisan }: { artisan: ArtisanCardData }) {
  const name = artisan.company_name || artisan.display_name || "Artisan";
  return (
    <Link
      href={`/artisans/${artisan.id}`}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        {artisan.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artisan.avatar_url}
            alt={name}
            className="h-14 w-14 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
            {initials(name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="truncate font-semibold">{name}</h3>
            {artisan.is_verified && <VerifiedBadge />}
          </div>
          <p className="truncate text-sm text-muted-foreground">{artisan.headline || "Artisan"}</p>
          {artisan.city && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin size={12} strokeWidth={1.75} /> {artisan.city}
              {artisan.distance_km != null && ` · ${artisan.distance_km.toFixed(1)} km`}
            </p>
          )}
        </div>
      </div>
      {artisan.categories && artisan.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {artisan.categories.slice(0, 3).map((c) => (
            <span key={c} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {c}
            </span>
          ))}
        </div>
      )}
      <RatingStars value={artisan.rating_avg} count={artisan.rating_count} />
    </Link>
  );
}
