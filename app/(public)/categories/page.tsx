import Link from "next/link";
import { getCategories } from "@/lib/data/categories";

export const metadata = { title: "Catégories de prestations" };

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Catégories de prestations</h1>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-5 text-center transition-shadow hover:shadow-md"
          >
            <span className="text-3xl">{cat.icon}</span>
            <span className="text-sm font-medium">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
