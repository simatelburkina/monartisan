import { requireUser } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/data/categories";
import { ProfileForm } from "@/components/shared/profile-form";
import { ArtisanProfessionalForm } from "./artisan-professional-form";
import { CategoriesEditor } from "./categories-editor";
import { ZonesEditor } from "./zones-editor";
import { PortfolioEditor } from "./portfolio-editor";

export const metadata = { title: "Mon profil" };

export default async function ArtisanProfilePage() {
  const me = await requireUser("artisan");
  const supabase = await createClient();

  const [{ data: artisan }, categories, { data: myCategories }, { data: zones }, { data: portfolio }] = await Promise.all([
    supabase.from("artisans").select("*").eq("id", me.id).single(),
    getCategories(),
    supabase.from("artisan_categories").select("category_id, hourly_rate").eq("artisan_id", me.id),
    supabase.from("artisan_zones").select("*").eq("artisan_id", me.id),
    supabase.from("portfolio_items").select("*").eq("artisan_id", me.id).order("created_at", { ascending: false }),
  ]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Mon profil</h1>
        <p className="text-muted-foreground">Un profil complet reçoit plus de demandes.</p>
      </div>

      <section>
        <h2 className="mb-2 font-semibold">Informations personnelles</h2>
        <ProfileForm profile={me} />
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Informations professionnelles</h2>
        <ArtisanProfessionalForm artisan={artisan!} />
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Métiers & spécialités</h2>
        <CategoriesEditor
          artisanId={me.id}
          categories={categories}
          initialSelection={myCategories || []}
        />
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Zones d&apos;intervention</h2>
        <ZonesEditor artisanId={me.id} initialZones={zones || []} />
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Photos de réalisations</h2>
        <PortfolioEditor artisanId={me.id} initialItems={portfolio || []} />
      </section>
    </div>
  );
}
