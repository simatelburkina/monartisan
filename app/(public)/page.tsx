import Link from "next/link";
import { getCategories } from "@/lib/data/categories";
import { searchArtisans } from "@/lib/data/artisans";
import { ArtisanCard } from "@/components/shared/artisan-card";

export default async function HomePage() {
  const [categories, topArtisans] = await Promise.all([
    getCategories(),
    searchArtisans({ verifiedOnly: true }),
  ]);

  return (
    <div>
      <section className="bg-gradient-to-b from-primary/10 to-background px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Que recherchez-vous ?
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Trouvez rapidement un artisan fiable près de chez vous, ou publiez votre demande en
            quelques clics.
          </p>

          <form action="/artisans" className="mt-8 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              name="q"
              placeholder="Un métier, un besoin... (ex : plombier, peintre)"
              className="h-14 flex-1 rounded-xl border border-border bg-card px-5 text-base shadow-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              className="h-14 rounded-xl bg-primary px-8 font-semibold text-primary-foreground shadow-sm hover:opacity-90"
            >
              Rechercher
            </button>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/client/requests/new"
              className="rounded-full bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground hover:opacity-90"
            >
              📝 Publier une demande
            </Link>
            <Link
              href="/register?role=artisan"
              className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted"
            >
              🧰 Je suis artisan, je m&apos;inscris
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-xl font-semibold">Catégories de prestations</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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
      </section>

      {topArtisans.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Artisans vérifiés</h2>
            <Link href="/artisans" className="text-sm font-medium text-primary hover:underline">
              Voir tous les artisans →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topArtisans.slice(0, 6).map((a) => (
              <ArtisanCard key={a.id} artisan={a} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-8 text-center text-xl font-semibold">Comment ça marche ?</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: "🔍", title: "Recherchez ou publiez", text: "Trouvez un artisan ou décrivez votre besoin en quelques minutes." },
            { icon: "💬", title: "Comparez et échangez", text: "Recevez plusieurs devis, discutez directement avec les artisans." },
            { icon: "⭐", title: "Réalisez et évaluez", text: "Suivez la prestation jusqu'à sa clôture puis laissez votre avis." },
          ].map((s) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card p-6 text-center">
              <div className="text-4xl">{s.icon}</div>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
