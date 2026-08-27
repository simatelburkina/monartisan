"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, X } from "lucide-react";

export function QuoteActions({ quoteId, status }: { quoteId: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function act(action: "accept" | "reject" | "request_modification") {
    startTransition(async () => {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setDone(true);
        router.refresh();
      }
    });
  }

  if (status !== "sent" || done) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button onClick={() => act("accept")} disabled={pending} className="btn-primary flex h-9 items-center gap-1.5 px-4 text-xs">
        <Check size={14} strokeWidth={2} /> Accepter
      </button>
      <button onClick={() => act("request_modification")} disabled={pending} className="btn-secondary flex h-9 items-center gap-1.5 px-4 text-xs">
        <Pencil size={14} strokeWidth={1.75} /> Demander une modification
      </button>
      <button
        onClick={() => act("reject")}
        disabled={pending}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-danger px-4 text-xs font-medium text-danger"
      >
        <X size={14} strokeWidth={2} /> Refuser
      </button>
    </div>
  );
}
