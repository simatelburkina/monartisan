"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
      <button onClick={() => act("accept")} disabled={pending} className="btn-primary h-9 px-4 text-xs">
        ✅ Accepter
      </button>
      <button onClick={() => act("request_modification")} disabled={pending} className="btn-secondary h-9 px-4 text-xs">
        ✏️ Demander une modification
      </button>
      <button onClick={() => act("reject")} disabled={pending} className="h-9 rounded-lg border border-danger px-4 text-xs font-medium text-danger">
        ✖ Refuser
      </button>
    </div>
  );
}
