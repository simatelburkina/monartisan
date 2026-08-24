import { createClient } from "@/lib/supabase/server";
import type { ArtisanCardData } from "@/components/shared/artisan-card";

export interface ArtisanSearchFilters {
  categorySlug?: string;
  city?: string;
  verifiedOnly?: boolean;
  minRating?: number;
  query?: string;
}

// Aplati le résultat de la jointure Supabase (profiles + artisans + catégories)
// vers la forme attendue par <ArtisanCard>.
function mapArtisanRow(row: Record<string, unknown>): ArtisanCardData {
  const profile = row.profile as Record<string, unknown>;
  const cats = (row.artisan_categories as Array<{ categories: { name: string } | null }>) || [];
  return {
    id: row.id as string,
    display_name: (profile?.display_name as string) ?? null,
    company_name: (profile?.company_name as string) ?? null,
    avatar_url: (profile?.avatar_url as string) ?? null,
    city: (profile?.city as string) ?? null,
    headline: row.headline as string | null,
    rating_avg: Number(row.rating_avg) || 0,
    rating_count: Number(row.rating_count) || 0,
    is_verified: Boolean(row.is_verified),
    categories: cats.map((c) => c.categories?.name).filter((v): v is string => Boolean(v)),
  };
}

export async function searchArtisans(filters: ArtisanSearchFilters = {}) {
  const supabase = await createClient();

  let query = supabase
    .from("artisans")
    .select(
      `id, headline, rating_avg, rating_count, is_verified, is_available,
       profile:profiles!artisans_id_fkey(display_name, company_name, avatar_url, city, status),
       artisan_categories(categories(name, slug))`
    )
    .order("is_verified", { ascending: false })
    .order("rating_avg", { ascending: false });

  if (filters.verifiedOnly) query = query.eq("is_verified", true);
  if (filters.minRating) query = query.gte("rating_avg", filters.minRating);

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

  return rows.map(mapArtisanRow);
}

export async function getArtisanById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("artisans")
    .select(
      `*, profile:profiles!artisans_id_fkey(*),
       artisan_categories(hourly_rate, categories(id, name, slug, icon)),
       artisan_zones(city, district),
       portfolio_items(id, image_url, caption)`
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
