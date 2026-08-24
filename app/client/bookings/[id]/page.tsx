import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/data/auth";
import { getBookingDetail } from "@/lib/data/requests";
import { StatusBadge } from "@/components/shared/status-badge";
import { BookingActions } from "@/components/shared/booking-actions";
import { ReviewForm } from "@/components/shared/review-form";
import { ComplaintForm } from "@/components/shared/complaint-form";
import { formatDate, formatFCFA, STATUS_LABELS } from "@/lib/utils/format";

const TIMELINE_STEPS = ["scheduled", "artisan_en_route", "in_progress", "completed", "paid", "closed"];

export default async function ClientBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await requireUser("client");
  const booking = await getBookingDetail(id);
  if (!booking || booking.client_id !== me.id) notFound();

  const artisan = booking.artisan as unknown as {
    id: string;
    profile: { display_name: string | null; company_name: string | null; phone: string | null };
    rating_avg: number;
  };
  const item = booking.request_item as unknown as {
    description: string | null;
    categories: { name: string; icon: string } | null;
    requests: { title: string; address: string | null };
  };
  const review = (booking.review as Array<{ id: string; rating: number; comment: string | null }>)?.[0];
  const currentIndex = TIMELINE_STEPS.indexOf(booking.status);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{item.requests.title}</h1>
          <p className="text-sm text-muted-foreground">
            {item.categories?.icon} {item.categories?.name}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-semibold">Suivi de la prestation</p>
        <ol className="mt-3 flex flex-col gap-2">
          {TIMELINE_STEPS.map((step, i) => (
            <li key={step} className={`flex items-center gap-2 text-sm ${i <= currentIndex ? "text-foreground" : "text-muted-foreground"}`}>
              <span>{i <= currentIndex ? "✅" : "⬜"}</span>
              {STATUS_LABELS[step]}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <Link href={`/artisans/${artisan.id}`} className="font-semibold hover:underline">
          {artisan.profile.company_name || artisan.profile.display_name}
        </Link>
        <p className="text-sm text-muted-foreground">📞 {artisan.profile.phone}</p>
        <p className="mt-2 text-sm">
          Montant : <span className="font-semibold text-primary">{formatFCFA(booking.amount)}</span>
        </p>
        {booking.scheduled_date && <p className="text-sm text-muted-foreground">📅 {formatDate(booking.scheduled_date)}</p>}
        {item.requests.address && <p className="text-sm text-muted-foreground">📍 {item.requests.address}</p>}
      </div>

      <BookingActions bookingId={id} status={booking.status} role="client" />

      {["completed", "paid", "closed"].includes(booking.status) &&
        (review ? (
          <p className="mt-4 text-sm text-muted-foreground">Vous avez déjà noté cette prestation ({review.rating}★).</p>
        ) : (
          <ReviewForm bookingId={id} />
        ))}

      <ComplaintForm bookingId={id} againstId={artisan.id} />
    </div>
  );
}
