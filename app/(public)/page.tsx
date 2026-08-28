import Link from "next/link";
import Image from "next/image";
import { Search, ClipboardPlus, Wrench, MessagesSquare, Star, ArrowRight } from "lucide-react";
import { getCategories } from "@/lib/data/categories";
import { searchArtisans } from "@/lib/data/artisans";
import { ArtisanCard } from "@/components/shared/artisan-card";
import { CategoryIcon } from "@/lib/utils/category-icons";

export default async function HomePage() {
  const [categories, topArtisans] = await Promise.all([
    getCategories(),
    searchArtisans({ verifiedOnly: true }),
  ]);

  const steps = [
    { icon: Search, title: "Recherchez ou publiez", text: "Trouvez un artisan ou décrivez votre besoin en quelques minutes." },
    { icon: MessagesSquare, title: "Comparez et échangez", text: "Recevez plusieurs devis, discutez directement avec les artisans." },
    { icon: Star, title: "Réalisez et évaluez", text: "Suivez la prestation jusqu'à sa clôture puis laissez votre avis." },
  ];

  return (
    <div>
      <section className="relative overflow-hidden px-4 py-14 sm:py-20">
        <Image
          src="/banniere.jpeg"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-background/40" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Que recherchez-vous ?
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Trouvez rapidement un artisan fiable près de chez vous, ou publiez votre demande en
            quelques clics.
          </p>

          <form action="/artisans" className="mt-8 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search size={19} strokeWidth={1.75} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                name="q"
                placeholder="Un métier, un besoin... (ex : plombier, peintre)"
                className="h-14 w-full rounded-xl border border-border bg-card pl-12 pr-5 text-base shadow-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
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
              className="flex items-center gap-1.5 rounded-full bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground hover:opacity-90"
            >
              <ClipboardPlus size={16} strokeWidth={1.75} /> Publier une demande
            </Link>
            <Link
              href="/register?role=artisan"
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted"
            >
              <Wrench size={16} strokeWidth={1.75} /> Je suis artisan, je m&apos;inscris
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
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CategoryIcon slug={cat.slug} size={22} />
              </span>
              <span className="text-sm font-medium">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {topArtisans.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Artisans vérifiés</h2>
            <Link href="/artisans" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Voir tous les artisans <ArrowRight size={14} strokeWidth={2} />
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
          {steps.map((s) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card p-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <s.icon size={26} strokeWidth={1.75} />
              </span>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
