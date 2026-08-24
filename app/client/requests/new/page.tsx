import { getCategories } from "@/lib/data/categories";
import { NewRequestForm } from "./new-request-form";

export const metadata = { title: "Publier une demande" };

export default async function NewRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [categories, sp] = await Promise.all([getCategories(), searchParams]);
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Publier une demande</h1>
      <p className="mt-1 text-muted-foreground">
        Décrivez votre besoin. Vous pouvez ajouter plusieurs prestations si votre projet regroupe
        plusieurs métiers (ex : rénovation = peinture + plomberie).
      </p>
      <NewRequestForm categories={categories} defaultCategorySlug={sp.category} />
    </div>
  );
}
