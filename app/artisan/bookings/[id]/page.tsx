import { notFound } from "next/navigation";
import { Phone, CalendarDays, MapPin, CheckCircle2, Circle } from "lucide-react";
import { requireUser } from "@/lib/data/auth";
import { getBookingDetail } from "@/lib/data/requests";
import { StatusBadge } from "@/components/shared/status-badge";
import { BookingActions } from "@/components/shared/booking-actions";
import { ComplaintForm } from "@/components/shared/complaint-form";
import { CategoryIcon } from "@/lib/utils/category-icons";
import { formatDate, formatFCFA, STATUS_LABELS } from "@/lib/utils/format";

const TIMELINE_STEPS = ["scheduled", "artisan_en_route", "in_progress", "completed", "paid", "closed"];

export default async function ArtisanBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await requireUser("artisan");
  const booking = await getBookingDetail(id);
  if (!booking || booking.artisan_id !== me.id) notFound();

  const client = booking.client as unknown as { profile: { display_name: string | null; phone: string | null } };
  const item = booking.request_item as unknown as {
    categories: { name: string; icon: string; slug: string } | null;
    requests: { title: string; description: string; address: string | null };
  };
  const currentIndex = TIMELINE_STEPS.indexOf(booking.status);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{item.requests.title}</h1>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {item.categories && <CategoryIcon slug={item.categories.slug} size={14} />} {item.categories?.name}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-semibold">Suivi de la prestation</p>
        <ol className="mt-3 flex flex-col gap-2">
          {TIMELINE_STEPS.map((step, i) => (
            <li key={step} className={`flex items-center gap-2 text-sm ${i <= currentIndex ? "text-foreground" : "text-muted-foreground"}`}>
              {i <= currentIndex ? (
                <CheckCircle2 size={15} strokeWidth={1.75} className="text-accent" />
              ) : (
                <Circle size={15} strokeWidth={1.75} />
              )}
              {STATUS_LABELS[step]}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <p className="font-semibold">{client.profile.display_name}</p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Phone size={13} strokeWidth={1.75} /> {client.profile.phone}
        </p>
        <p className="mt-2 text-sm">
          Montant : <span className="font-semibold text-primary">{formatFCFA(booking.amount)}</span>
        </p>
        {booking.scheduled_date && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays size={13} strokeWidth={1.75} /> {formatDate(booking.scheduled_date)}
          </p>
        )}
        {item.requests.address && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin size={13} strokeWidth={1.75} /> {item.requests.address}
          </p>
        )}
      </div>

      <BookingActions bookingId={id} status={booking.status} role="artisan" />
      <ComplaintForm bookingId={id} againstId={booking.client_id} />
    </div>
  );
}
