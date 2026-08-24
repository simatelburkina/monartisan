import Link from "next/link";
import { getAllArtisans } from "@/lib/data/admin";
import { VerifyArtisanButton } from "@/components/shared/verify-artisan-button";
import { RatingStars } from "@/components/shared/rating-stars";
import { initials } from "@/lib/utils/format";

export const metadata = { title: "Artisans" };

export default async function AdminArtisansPage() {
  const artisans = await getAllArtisans();

  return (
    <div>
      <h1 className="text-2xl font-bold">Artisans</h1>
      <div className="mt-6 flex flex-col gap-3">
        {artisans.map((a) => {
          const profile = a.profile as unknown as { display_name: string | null; company_name: string | null; city: string | null };
          const pendingDocs = (a.documents as Array<{ status: string }>).filter((d) => d.status === "pending").length;
          return (
            <div key={a.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <Link href={`/admin/artisans/${a.id}`} className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {initials(profile.company_name || profile.display_name)}
                </span>
                <div>
                  <p className="font-medium">{profile.company_name || profile.display_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {profile.city || "—"} {pendingDocs > 0 && `· ${pendingDocs} document(s) à valider`}
                  </p>
                  <RatingStars value={a.rating_avg} count={a.rating_count} />
                </div>
              </Link>
              <VerifyArtisanButton artisanId={a.id} isVerified={a.is_verified} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
