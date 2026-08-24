import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notify } from "@/lib/data/notify";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { decision, message } = await req.json();
  if (!["interested", "declined", "info_requested"].includes(decision)) {
    return NextResponse.json({ error: "Décision invalide" }, { status: 400 });
  }

  const { error } = await supabase.from("request_responses").upsert(
    { request_item_id: id, artisan_id: user.id, decision, message },
    { onConflict: "request_item_id,artisan_id" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (decision === "interested") {
    await supabase
      .from("requests")
      .update({ status: "proposals_received" })
      .eq(
        "id",
        (
          await supabase.from("request_items").select("request_id").eq("id", id).single()
        ).data?.request_id
      )
      .eq("status", "published");

    const { data: item } = await supabase
      .from("request_items")
      .select("request_id, requests(client_id)")
      .eq("id", id)
      .single();
    const clientId = (item as unknown as { requests: { client_id: string } })?.requests?.client_id;
    if (clientId) {
      await notify({
        userId: clientId,
        type: "new_quote",
        title: "Un artisan est intéressé par votre demande",
        link: `/client/requests/${item?.request_id}`,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
