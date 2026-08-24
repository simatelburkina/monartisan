import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notify } from "@/lib/data/notify";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { bookingId, rating, comment } = await req.json();
  if (!bookingId || !rating) return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });

  const { data: booking } = await supabase.from("bookings").select("artisan_id, client_id").eq("id", bookingId).single();
  if (!booking || booking.client_id !== user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { data: review, error } = await supabase
    .from("reviews")
    .insert({ booking_id: bookingId, client_id: user.id, artisan_id: booking.artisan_id, rating, comment })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await notify({
    userId: booking.artisan_id,
    type: "new_review",
    title: `Nouvel avis reçu (${rating}★)`,
    body: comment,
    link: `/artisan/reviews`,
  });

  return NextResponse.json({ review });
}
