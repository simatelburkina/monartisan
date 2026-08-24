import Link from "next/link";
import { requireUser } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { getMatchingRequestsForArtisan, getArtisanQuotes, getBookingsFor } from "@/lib/data/requests";
import { StatusBadge } from "@/components/shared/status-badge";
import { RatingStars } from "@/components/shared/rating-stars";
import { formatFCFA, timeAgo } from "@/lib/utils/format";

export const metadata = { title: "Tableau de bord" };

export default async function ArtisanDashboardPage() {
  const me = await requireUser("artisan");
  const supabase = await createClient();
  const [{ data: artisan }, requests, quotes, bookings] = await Promise.all([
    supabase.from("artisans").select("*").eq("id", me.id).single(),
    getMatchingRequestsForArtisan(me.id),
    getArtisanQuotes(me.id),
    getBookingsFor(me.id, "artisan"),
  ]);

  const newRequests = requests.filter(
    (r) => !((r.request_responses as Array<{ artisan_id: string }>) || []).some((x) => x.artisan_id === me.id)
  );
  const activeBookings = bookings.filter((b) => !["closed", "paid"].includes(b.status));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Bonjour {me.first_name || ""} 👋</h1>
        <RatingStars value={artisan?.rating_avg || 0} count={artisan?.rating_count || 0} />
      </div>

      {!artisan?.is_verified && (
        <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm">
          Votre profil n&apos;est pas encore vérifié.{" "}
          <Link href="/artisan/documents" className="font-medium underline">
            Envoyez vos documents
          </Link>{" "}
          pour obtenir le badge « Artisan vérifié ».
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Nouvelles demandes", value: newRequests.length, href: "/artisan/requests" },
          { label: "Devis envoyés", value: quotes.length, href: "/artisan/quotes" },
          { label: "Prestations en cours", value: activeBookings.length, href: "/artisan/bookings" },
          { label: "Revenus totaux", value: formatFCFA(artisan?.total_earnings || 0), href: "/artisan/bookings" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href} className="rounded-2xl border border-border bg-card p-4 hover:shadow-md">
            <p className="text-xl font-bold text-primary">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </Link>
        ))}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Nouvelles demandes correspondant à votre métier</h2>
          <Link href="/artisan/requests" className="text-sm font-medium text-primary hover:underline">
            Voir tout →
          </Link>
        </div>
        {newRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune nouvelle demande pour le moment.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {newRequests.slice(0, 5).map((r) => {
              const req = r.requests as unknown as { id: string; title: string; city: string | null; created_at: string; status: string };
              return (
                <Link
                  key={r.id as string}
                  href={`/artisan/requests/${req.id}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:shadow-sm"
                >
                  <div>
                    <p className="font-medium">{req.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {req.city ? `📍 ${req.city} · ` : ""}
                      {timeAgo(req.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={req.status} />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
