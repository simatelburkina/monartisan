import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/data/require-admin";
import { notify } from "@/lib/data/notify";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, status, supabase, user } = await requireAdminApi();
  if (error) return NextResponse.json({ error }, { status });

  const { status: newStatus, resolutionNote } = await req.json();
  const { data: complaint, error: updateError } = await supabase
    .from("complaints")
    .update({
      status: newStatus,
      resolution_note: resolutionNote,
      handled_by: user!.id,
      resolved_at: ["resolved", "rejected"].includes(newStatus) ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  if (complaint?.booking_id && ["resolved", "rejected"].includes(newStatus)) {
    const { data: booking } = await supabase.from("bookings").select("status").eq("id", complaint.booking_id).single();
    if (booking?.status === "disputed") {
      await supabase.from("bookings").update({ status: "closed", closed_at: new Date().toISOString() }).eq("id", complaint.booking_id);
    }
  }

  if (complaint) {
    await notify({
      userId: complaint.reporter_id,
      type: "complaint_update",
      title: "Mise à jour de votre réclamation",
      body: resolutionNote,
      link: "/",
    });
  }

  return NextResponse.json({ ok: true });
}
