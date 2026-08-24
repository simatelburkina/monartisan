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
      <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 1.5l2.1 1.1 2.35-.4 1.15 2.05 2.05 1.15-.4 2.35L18.5 10l-1.1 2.1.4 2.35-2.05 1.15-1.15 2.05-2.35-.4L10 18.5l-2.1-1.1-2.35.4-1.15-2.05-2.05-1.15.4-2.35L1.5 10l1.1-2.1-.4-2.35 2.05-1.15L5.4 2.35l2.35.4L10 1.5zm3.7 6.3a1 1 0 0 0-1.4-1.4L9 9.68 7.2 7.88a1 1 0 1 0-1.4 1.42l2.5 2.5a1 1 0 0 0 1.4 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      Artisan vérifié
    </span>
  );
}
