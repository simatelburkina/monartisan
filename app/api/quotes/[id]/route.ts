import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notify } from "@/lib/data/notify";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { action } = await req.json(); // accept | reject | request_modification

  const { data: quote } = await supabase
    .from("quotes")
    .select("*, request_items(id, request_id, category_id, requests(client_id))")
    .eq("id", id)
    .single();

  if (!quote) return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  const item = quote.request_items as unknown as {
    id: string;
    request_id: string;
    requests: { client_id: string };
  };
  if (item.requests.client_id !== user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  if (action === "accept") {
    await supabase.from("quotes").update({ status: "accepted" }).eq("id", id);
    await supabase
      .from("request_items")
      .update({ status: "assigned", assigned_artisan_id: quote.artisan_id })
      .eq("id", item.id);
    await supabase.from("requests").update({ status: "quote_accepted" }).eq("id", item.request_id);

    const { data: booking } = await supabase
      .from("bookings")
      .insert({
        request_item_id: item.id,
        quote_id: quote.id,
        client_id: user.id,
        artisan_id: quote.artisan_id,
        amount: quote.total_amount,
        scheduled_date: quote.proposed_date,
        status: "scheduled",
      })
      .select()
      .single();

    await notify({
      userId: quote.artisan_id,
      type: "quote_accepted",
      title: "Votre devis a été accepté 🎉",
      link: `/artisan/bookings/${booking?.id}`,
    });

    return NextResponse.json({ ok: true, booking });
  }

  if (action === "reject") {
    await supabase.from("quotes").update({ status: "rejected" }).eq("id", id);
    await notify({
      userId: quote.artisan_id,
      type: "quote_rejected",
      title: "Votre devis a été refusé",
      link: `/artisan/quotes`,
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "request_modification") {
    await supabase.from("quotes").update({ status: "modification_requested" }).eq("id", id);
    await notify({
      userId: quote.artisan_id,
      type: "new_quote",
      title: "Le client demande une modification de votre devis",
      link: `/artisan/quotes`,
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Action invalide" }, { status: 400 });
}
