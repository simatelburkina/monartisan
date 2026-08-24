import { searchArtisans } from "@/lib/data/artisans";
import { getCategories } from "@/lib/data/categories";
import { ArtisanCard } from "@/components/shared/artisan-card";

export const metadata = { title: "Trouver un artisan" };

export default async function ArtisansPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; city?: string; verified?: string }>;
}) {
  const sp = await searchParams;
  const [artisans, categories] = await Promise.all([
    searchArtisans({
      query: sp.q,
      categorySlug: sp.category,
      city: sp.city,
      verifiedOnly: sp.verified === "1",
    }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Trouver un artisan</h1>
      <p className="mt-1 text-muted-foreground">{artisans.length} artisan(s) trouvé(s)</p>

      <form className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-4">
        <input
          type="text"
          name="q"
          defaultValue={sp.q}
          placeholder="Métier, nom..."
          className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring sm:col-span-1"
        />
        <select
          name="category"
          defaultValue={sp.category || ""}
          className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="city"
          defaultValue={sp.city}
          placeholder="Ville / quartier"
          className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <label className="flex h-11 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm">
          <input type="checkbox" name="verified" value="1" defaultChecked={sp.verified === "1"} />
          Artisans vérifiés uniquement
        </label>
        <button
          type="submit"
          className="h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 sm:col-span-4"
        >
          Filtrer
        </button>
      </form>

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
    </div>
  );
}
