import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notify } from "@/lib/data/notify";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const {
    requestItemId,
    description,
    laborCost,
    materialsCost,
    extraFees,
    delayDays,
    proposedDate,
    conditions,
  } = await req.json();

  if (!requestItemId || !description) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const { data: quote, error } = await supabase
    .from("quotes")
    .insert({
      request_item_id: requestItemId,
      artisan_id: user.id,
      description,
      labor_cost: laborCost || 0,
      materials_cost: materialsCost || 0,
      extra_fees: extraFees || 0,
      delay_days: delayDays || null,
      proposed_date: proposedDate || null,
      conditions,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: item } = await supabase
    .from("request_items")
    .select("request_id, requests(client_id, id)")
    .eq("id", requestItemId)
    .single();
  const clientId = (item as unknown as { requests: { client_id: string } })?.requests?.client_id;
  if (clientId) {
    await notify({
      userId: clientId,
      type: "new_quote",
      title: "Nouveau devis reçu",
      body: description,
      link: `/client/requests/${item?.request_id}`,
    });
  }

  return NextResponse.json({ quote });
}
