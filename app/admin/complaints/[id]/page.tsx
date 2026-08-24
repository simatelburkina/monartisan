import { notFound } from "next/navigation";
import { getComplaintDetail } from "@/lib/data/admin";
import { formatDateTime } from "@/lib/utils/format";
import { ComplaintResolveForm } from "./complaint-resolve-form";

export default async function AdminComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const complaint = await getComplaintDetail(id);
  if (!complaint) notFound();

  const reporter = complaint.reporter as unknown as { display_name: string | null; email: string | null; phone: string | null };
  const against = complaint.against as unknown as { display_name: string | null; email: string | null; phone: string | null } | null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Réclamation</h1>
      <p className="mt-1 text-sm text-muted-foreground">{formatDateTime(complaint.created_at)}</p>

      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm">
          <span className="font-semibold">Signalé par :</span> {reporter.display_name} ({reporter.email}, {reporter.phone})
        </p>
        {against && (
          <p className="mt-1 text-sm">
            <span className="font-semibold">Contre :</span> {against.display_name} ({against.email}, {against.phone})
          </p>
        )}
        <p className="mt-2 text-sm">
          <span className="font-semibold">Motif :</span> {complaint.reason}
        </p>
        <p className="mt-2 whitespace-pre-line text-sm">{complaint.description}</p>
      </div>

      <ComplaintResolveForm complaintId={id} currentStatus={complaint.status} />
    </div>
  );
}
