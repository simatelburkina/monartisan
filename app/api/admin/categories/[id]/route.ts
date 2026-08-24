import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/data/require-admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, status, supabase } = await requireAdminApi();
  if (error) return NextResponse.json({ error }, { status });

  const body = await req.json();
  const { error: updateError } = await supabase
    .from("categories")
    .update({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.icon !== undefined && { icon: body.icon }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.isActive !== undefined && { is_active: body.isActive }),
    })
    .eq("id", id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, status, supabase } = await requireAdminApi();
  if (error) return NextResponse.json({ error }, { status });

  const { error: deleteError } = await supabase.from("categories").delete().eq("id", id);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
