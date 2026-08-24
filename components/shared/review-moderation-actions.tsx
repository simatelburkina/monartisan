"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function ReviewModerationActions({ reviewId, isHidden }: { reviewId: string; isHidden: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");

  function set(hidden: boolean) {
    startTransition(async () => {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden, reason }),
      });
      if (res.ok) {
        setShowReason(false);
        router.refresh();
      }
    });
  }

  if (isHidden) {
    return (
      <button onClick={() => set(false)} disabled={pending} className="btn-secondary h-8 px-3 text-xs">
        Réafficher
      </button>
    );
  }

  if (showReason) {
    return (
      <div className="flex gap-2">
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motif" className="input h-9 w-40" />
        <button onClick={() => set(true)} disabled={pending} className="h-9 rounded-lg border border-danger px-3 text-xs font-medium text-danger">
          Confirmer
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setShowReason(true)} className="h-8 rounded-lg border border-danger px-3 text-xs font-medium text-danger">
      Masquer
    </button>
  );
}
