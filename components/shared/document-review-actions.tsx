"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function DocumentReviewActions({ docId }: { docId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  function decide(decision: "approved" | "rejected") {
    startTransition(async () => {
      const res = await fetch(`/api/admin/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, rejectionReason: reason }),
      });
      if (res.ok) {
        setShowReject(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="flex gap-2">
        <button onClick={() => decide("approved")} disabled={pending} className="btn-primary h-8 px-3 text-xs">
          Approuver
        </button>
        <button onClick={() => setShowReject((s) => !s)} className="h-8 rounded-lg border border-danger px-3 text-xs font-medium text-danger">
          Rejeter
        </button>
      </div>
      {showReject && (
        <div className="flex gap-2">
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motif du rejet" className="input h-9 flex-1" />
          <button onClick={() => decide("rejected")} disabled={pending || !reason} className="btn-secondary h-9 px-3 text-xs">
            Confirmer
          </button>
        </div>
      )}
    </div>
  );
}
