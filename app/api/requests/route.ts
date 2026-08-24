import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyMany } from "@/lib/data/notify";

interface RequestItemInput {
  categoryId: string;
  description?: string;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const {
    title,
    description,
    address,
    city,
    lat,
    lng,
    desiredDate,
    desiredTime,
    budgetMin,
    budgetMax,
    estimatedDuration,
    urgency,
    items,
    mediaUrls,
  }: {
    title: string;
    description: string;
    address?: string;
    city?: string;
    lat?: number;
    lng?: number;
    desiredDate?: string;
    desiredTime?: string;
    budgetMin?: number;
    budgetMax?: number;
    estimatedDuration?: string;
    urgency?: string;
    items: RequestItemInput[];
    mediaUrls?: string[];
  } = body;

  if (!title || !description || !items?.length) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const { data: request, error: reqError } = await supabase
    .from("requests")
    .insert({
      client_id: user.id,
      title,
      description,
      address,
      city,
      lat,
      lng,
      desired_date: desiredDate || null,
      desired_time: desiredTime || null,
      budget_min: budgetMin || null,
      budget_max: budgetMax || null,
      estimated_duration: estimatedDuration || null,
      urgency: urgency || "normal",
    })
    .select()
    .single();

  if (reqError || !request) {
    return NextResponse.json({ error: reqError?.message || "Erreur" }, { status: 500 });
  }

  const { data: createdItems, error: itemsError } = await supabase
    .from("request_items")
    .insert(items.map((it) => ({ request_id: request.id, category_id: it.categoryId, description: it.description })))
    .select();

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  if (mediaUrls?.length) {
    await supabase.from("request_media").insert(
      mediaUrls.map((url) => ({ request_id: request.id, media_url: url, media_type: "photo" }))
    );
  }

  // Notifie les artisans dont le métier correspond à l'une des prestations demandées
  const admin = createAdminClient();
  const categoryIds = [...new Set(items.map((i) => i.categoryId))];
  const { data: matchingArtisans } = await admin
    .from("artisan_categories")
    .select("artisan_id")
    .in("category_id", categoryIds);

  const artisanIds = [...new Set((matchingArtisans || []).map((r) => r.artisan_id as string))];
  await notifyMany(artisanIds, {
    type: "new_request",
    title: "Nouvelle demande dans votre métier",
    body: title,
    link: `/artisan/requests/${request.id}`,
  });

  return NextResponse.json({ request, items: createdItems });
}
