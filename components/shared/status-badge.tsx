import { BadgeCheck } from "lucide-react";
import { STATUS_LABELS } from "@/lib/utils/format";

const COLORS: Record<string, string> = {
  published: "bg-blue-100 text-blue-800",
  proposals_received: "bg-amber-100 text-amber-800",
  quote_accepted: "bg-emerald-100 text-emerald-800",
  scheduled: "bg-violet-100 text-violet-800",
  artisan_en_route: "bg-violet-100 text-violet-800",
  in_progress: "bg-orange-100 text-orange-800",
  completed: "bg-teal-100 text-teal-800",
  paid: "bg-green-100 text-green-800",
  closed: "bg-stone-200 text-stone-700",
  cancelled: "bg-red-100 text-red-800",
  disputed: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        COLORS[status] || "bg-stone-100 text-stone-700"
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
      <BadgeCheck size={13} strokeWidth={2} />
      Artisan vérifié
    </span>
  );
}
