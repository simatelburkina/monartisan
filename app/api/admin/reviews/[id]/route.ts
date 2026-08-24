import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/data/require-admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, status, supabase } = await requireAdminApi();
  if (error) return NextResponse.json({ error }, { status });

  const { hidden, reason } = await req.json();
  const { error: updateError } = await supabase
    .from("reviews")
    .update({ is_hidden: hidden, hidden_reason: hidden ? reason : null })
    .eq("id", id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
