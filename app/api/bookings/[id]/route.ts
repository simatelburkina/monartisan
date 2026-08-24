import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notify } from "@/lib/data/notify";
import type { BookingStatus } from "@/lib/types/database";

const TRANSITIONS: Record<string, { next: BookingStatus; label: string; actor: "artisan" | "client" | "both" }> = {
  en_route: { next: "artisan_en_route", label: "L'artisan est en route", actor: "artisan" },
  start: { next: "in_progress", label: "La prestation a débuté", actor: "artisan" },
  complete: { next: "completed", label: "La prestation est terminée", actor: "artisan" },
  confirm_payment: { next: "paid", label: "Paiement confirmé", actor: "client" },
  close: { next: "closed", label: "Prestation clôturée", actor: "both" },
};

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { action } = await req.json();
  const transition = TRANSITIONS[action];
  if (!transition) return NextResponse.json({ error: "Action invalide" }, { status: 400 });

  const { data: booking } = await supabase.from("bookings").select("*").eq("id", id).single();
  if (!booking) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const isArtisan = booking.artisan_id === user.id;
  const isClient = booking.client_id === user.id;
  if (!isArtisan && !isClient) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  if (transition.actor === "artisan" && !isArtisan) return NextResponse.json({ error: "Réservé à l'artisan" }, { status: 403 });
  if (transition.actor === "client" && !isClient) return NextResponse.json({ error: "Réservé au client" }, { status: 403 });

  const updates: Record<string, unknown> = { status: transition.next };
  if (transition.next === "in_progress") updates.started_at = new Date().toISOString();
  if (transition.next === "completed") updates.completed_at = new Date().toISOString();
  if (transition.next === "closed") updates.closed_at = new Date().toISOString();

  const { error } = await supabase.from("bookings").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (transition.next === "completed") {
    await supabase.from("request_items").update({ status: "done" }).eq("id", booking.request_item_id);
  }

  const notifyUserId = isArtisan ? booking.client_id : booking.artisan_id;
  await notify({
    userId: notifyUserId,
    type: transition.next === "completed" ? "booking_completed" : "booking_scheduled",
    title: transition.label,
    link: isArtisan ? `/client/bookings/${id}` : `/artisan/bookings/${id}`,
  });

  return NextResponse.json({ ok: true });
}
