import { createClient } from "@/lib/supabase/server";
import { CategoriesAdmin } from "./categories-admin";

export const metadata = { title: "Catégories" };

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");
  return (
    <div>
      <h1 className="text-2xl font-bold">Catégories de prestations</h1>
      <CategoriesAdmin initialCategories={categories || []} />
    </div>
  );
}
