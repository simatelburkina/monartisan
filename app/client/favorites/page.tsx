import { requireUser } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { ArtisanCard } from "@/components/shared/artisan-card";

export const metadata = { title: "Mes favoris" };

export default async function FavoritesPage() {
  const me = await requireUser("client");
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select(
      `artisan:artisans!inner(id, headline, rating_avg, rating_count, is_verified,
        profile:profiles!artisans_id_fkey(display_name, company_name, avatar_url, city),
        artisan_categories(categories(name)))`
    )
    .eq("client_id", me.id);

  const artisans = (data || []).map((f) => {
    const a = f.artisan as unknown as Record<string, unknown>;
    const profile = a.profile as Record<string, unknown>;
    const cats = (a.artisan_categories as Array<{ categories: { name: string } | null }>) || [];
    return {
      id: a.id as string,
      display_name: profile.display_name as string | null,
      company_name: profile.company_name as string | null,
      avatar_url: profile.avatar_url as string | null,
      city: profile.city as string | null,
      headline: a.headline as string | null,
      rating_avg: Number(a.rating_avg) || 0,
      rating_count: Number(a.rating_count) || 0,
      is_verified: Boolean(a.is_verified),
      categories: cats.map((c) => c.categories?.name).filter((v): v is string => Boolean(v)),
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Mes favoris</h1>
      {artisans.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">Vous n&apos;avez pas encore d&apos;artisan favori.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {artisans.map((a) => (
            <ArtisanCard key={a.id} artisan={a} />
          ))}
        </div>
      )}
    </div>
  );
}
