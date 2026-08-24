import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/data/require-admin";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(req: Request) {
  const { error, status, supabase } = await requireAdminApi();
  if (error) return NextResponse.json({ error }, { status });

  const { name, icon, description } = await req.json();
  if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  const { data, error: insertError } = await supabase
    .from("categories")
    .insert({ name, slug: slugify(name), icon, description })
    .select()
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  return NextResponse.json({ category: data });
}
