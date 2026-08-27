import { notFound } from "next/navigation";
import Link from "next/link";
import { ClipboardPlus } from "lucide-react";
import { getCategoryBySlug } from "@/lib/data/categories";
import { searchArtisans } from "@/lib/data/artisans";
import { ArtisanCard } from "@/components/shared/artisan-card";
import { CategoryIcon } from "@/lib/utils/category-icons";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const artisans = await searchArtisans({ categorySlug: slug });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CategoryIcon slug={category.slug} size={28} />
        </span>
        <div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          <p className="text-sm text-muted-foreground">{artisans.length} artisan(s) disponible(s)</p>
        </div>
      </div>

      <div className="mt-4">
        <Link
          href={`/client/requests/new?category=${category.slug}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <ClipboardPlus size={16} strokeWidth={1.75} /> Publier une demande en {category.name}
        </Link>
      </div>

      {artisans.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">
          Aucun artisan disponible dans cette catégorie pour le moment.
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
