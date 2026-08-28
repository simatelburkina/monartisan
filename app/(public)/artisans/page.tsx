import { searchArtisans } from "@/lib/data/artisans";
import { getCategories } from "@/lib/data/categories";
import { ArtisanCard } from "@/components/shared/artisan-card";
import { SearchFilters } from "@/components/shared/search-filters";
import { ArtisanViewToggle } from "@/components/shared/artisan-view-toggle";

export const metadata = { title: "Trouver un artisan" };

export default async function ArtisansPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    city?: string;
    verified?: string;
    available?: string;
    maxPrice?: string;
    minExperience?: string;
    sort?: string;
    lat?: string;
    lng?: string;
    maxDistance?: string;
    view?: string;
  }>;
}) {
  const sp = await searchParams;
  const lat = sp.lat ? Number(sp.lat) : undefined;
  const lng = sp.lng ? Number(sp.lng) : undefined;

  const [artisans, categories] = await Promise.all([
    searchArtisans({
      query: sp.q,
      categorySlug: sp.category,
      city: sp.city,
      verifiedOnly: sp.verified === "1",
      availableOnly: sp.available === "1",
      maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
      minExperience: sp.minExperience ? Number(sp.minExperience) : undefined,
      lat,
      lng,
      maxDistanceKm: sp.maxDistance ? Number(sp.maxDistance) : undefined,
      sort: (sp.sort as "rating" | "distance" | "price" | "experience") || "rating",
    }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Trouver un artisan</h1>
      <p className="mt-1 text-muted-foreground">{artisans.length} artisan(s) trouvé(s)</p>

      <SearchFilters categories={categories} sp={sp} />

      <ArtisanViewToggle
        artisans={artisans}
        center={lat != null && lng != null ? { lat, lng } : null}
        defaultView={sp.view === "map" ? "map" : "list"}
      >
        {artisans.length === 0 ? (
          <p className="mt-10 text-center text-muted-foreground">
            Aucun artisan ne correspond à votre recherche pour le moment.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {artisans.map((a) => (
              <ArtisanCard key={a.id} artisan={a} />
            ))}
          </div>
        )}
      </ArtisanViewToggle>
    </div>
  );
}
