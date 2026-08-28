import { createClient } from "@/lib/supabase/server";
import type { ArtisanCardData } from "@/components/shared/artisan-card";
import { distanceKm } from "@/lib/utils/geo";

export interface ArtisanSearchFilters {
  categorySlug?: string;
  city?: string;
  verifiedOnly?: boolean;
  minRating?: number;
  query?: string;
  maxPrice?: number;
  minExperience?: number;
  availableOnly?: boolean;
  lat?: number;
  lng?: number;
  maxDistanceKm?: number;
  sort?: "rating" | "distance" | "price" | "experience";
}

// Aplati le résultat de la jointure Supabase (profiles + artisans + catégories)
// vers la forme attendue par <ArtisanCard>.
function mapArtisanRow(row: Record<string, unknown>, distance?: number | null): ArtisanCardData {
  const profile = row.profile as Record<string, unknown>;
  const cats = (row.artisan_categories as Array<{ categories: { name: string } | null; hourly_rate?: number | null }>) || [];
  return {
    id: row.id as string,
    display_name: (profile?.display_name as string) ?? null,
    company_name: (profile?.company_name as string) ?? null,
    avatar_url: (profile?.avatar_url as string) ?? null,
    city: (profile?.city as string) ?? null,
    lat: (profile?.lat as number) ?? null,
    lng: (profile?.lng as number) ?? null,
    headline: row.headline as string | null,
    rating_avg: Number(row.rating_avg) || 0,
    rating_count: Number(row.rating_count) || 0,
    is_verified: Boolean(row.is_verified),
    years_experience: Number(row.years_experience) || 0,
    distance_km: distance ?? null,
    categories: cats.map((c) => c.categories?.name).filter((v): v is string => Boolean(v)),
  };
}

export async function searchArtisans(filters: ArtisanSearchFilters = {}) {
  const supabase = await createClient();

  let query = supabase
    .from("artisans")
    .select(
      `id, headline, rating_avg, rating_count, is_verified, is_available, years_experience,
       profile:profiles!artisans_id_fkey(display_name, company_name, avatar_url, city, status, lat, lng),
       artisan_categories(hourly_rate, categories(name, slug))`
    )
    .order("is_verified", { ascending: false })
    .order("rating_avg", { ascending: false });

  if (filters.verifiedOnly) query = query.eq("is_verified", true);
  if (filters.minRating) query = query.gte("rating_avg", filters.minRating);
  if (filters.availableOnly) query = query.eq("is_available", true);
  if (filters.minExperience) query = query.gte("years_experience", filters.minExperience);

  const { data, error } = await query.limit(60);
  if (error || !data) return [];

  let rows = (data as unknown as Record<string, unknown>[]).filter(
    (r) => (r.profile as Record<string, unknown>)?.status === "active"
  );

  if (filters.city) {
    const city = filters.city.toLowerCase();
    rows = rows.filter((r) => ((r.profile as Record<string, unknown>)?.city as string)?.toLowerCase().includes(city));
  }
  if (filters.categorySlug) {
    rows = rows.filter((r) =>
      (r.artisan_categories as Array<{ categories: { slug: string } | null }>)?.some(
        (c) => c.categories?.slug === filters.categorySlug
      )
    );
  }
  if (filters.query) {
    const q = filters.query.toLowerCase();
    rows = rows.filter((r) => {
      const p = r.profile as Record<string, unknown>;
      const name = `${p?.company_name || ""} ${p?.display_name || ""} ${r.headline || ""}`.toLowerCase();
      return name.includes(q);
    });
  }
  if (filters.maxPrice) {
    rows = rows.filter((r) => {
      const cats = (r.artisan_categories as Array<{ hourly_rate: number | null }>) || [];
      const rates = cats.map((c) => c.hourly_rate).filter((v): v is number => v != null);
      return rates.length === 0 || rates.some((rate) => rate <= filters.maxPrice!);
    });
  }

  let withDistance = rows.map((r) => {
    const p = r.profile as Record<string, unknown>;
    const plat = p?.lat as number | null;
    const plng = p?.lng as number | null;
    const distance =
      filters.lat != null && filters.lng != null && plat != null && plng != null
        ? distanceKm(filters.lat, filters.lng, plat, plng)
        : null;
    return { row: r, distance };
  });

  if (filters.lat != null && filters.lng != null && filters.maxDistanceKm) {
    withDistance = withDistance.filter((r) => r.distance == null || r.distance <= filters.maxDistanceKm!);
  }

  if (filters.sort === "distance" && filters.lat != null && filters.lng != null) {
    withDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  } else if (filters.sort === "price") {
    withDistance.sort((a, b) => {
      const rateOf = (r: Record<string, unknown>) => {
        const cats = (r.artisan_categories as Array<{ hourly_rate: number | null }>) || [];
        const rates = cats.map((c) => c.hourly_rate).filter((v): v is number => v != null);
        return rates.length ? Math.min(...rates) : Infinity;
      };
      return rateOf(a.row) - rateOf(b.row);
    });
  } else if (filters.sort === "experience") {
    withDistance.sort((a, b) => (Number(b.row.years_experience) || 0) - (Number(a.row.years_experience) || 0));
  }

  return withDistance.map(({ row, distance }) => mapArtisanRow(row, distance));
}

export async function getArtisanById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("artisans")
    .select(
      `*, profile:profiles!artisans_id_fkey(*),
       artisan_categories(hourly_rate, categories(id, name, slug, icon)),
       artisan_zones(city, district),
       portfolio_items(id, image_url, caption),
       artisan_availability(id, weekday, start_time, end_time)`
    )
    .eq("id", id)
    .single();
  return data as Record<string, unknown> | null;
}

export async function getArtisanReviews(artisanId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, client:clients!inner(id, profile:profiles!clients_id_fkey(display_name, avatar_url))")
    .eq("artisan_id", artisanId)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false });
  return (data as Record<string, unknown>[]) || [];
}
