import Link from "next/link";
import { getAllComplaints } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "Réclamations" };

const REASON_LABELS: Record<string, string> = {
  not_done: "Prestation non réalisée",
  not_compliant: "Travail non conforme",
  payment_dispute: "Paiement contesté",
  bad_behavior: "Comportement inapproprié",
  fraud: "Fraude",
  fake_profile: "Faux profil",
  other: "Autre",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-amber-100 text-amber-800",
  investigating: "bg-blue-100 text-blue-800",
  resolved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-stone-200 text-stone-700",
};

export default async function AdminComplaintsPage() {
  const complaints = await getAllComplaints();
  return (
    <div>
      <h1 className="text-2xl font-bold">Réclamations</h1>
      <div className="mt-6 flex flex-col gap-3">
        {complaints.map((c) => {
          const reporter = c.reporter as unknown as { display_name: string | null };
          const against = c.against as unknown as { display_name: string | null } | null;
          return (
            <Link key={c.id} href={`/admin/complaints/${c.id}`} className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-card p-4 hover:shadow-sm">
              <div>
                <p className="font-medium">{REASON_LABELS[c.reason]}</p>
                <p className="text-sm text-muted-foreground">
                  {reporter?.display_name} {against ? `contre ${against.display_name}` : ""} · {formatDate(c.created_at)}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[c.status]}`}>{c.status}</span>
            </Link>
          );
        })}
        {complaints.length === 0 && <p className="text-center text-muted-foreground">Aucune réclamation.</p>}
      </div>
    </div>
  );
}
