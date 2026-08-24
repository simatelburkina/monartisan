"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function RequestItemResponder({ itemId, existingDecision }: { itemId: string; existingDecision?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [showInfoBox, setShowInfoBox] = useState(false);

  function respond(decision: "interested" | "declined" | "info_requested") {
    startTransition(async () => {
      const res = await fetch(`/api/request-items/${itemId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, message }),
      });
      if (res.ok) {
        setShowInfoBox(false);
        router.refresh();
      }
    });
  }

  if (existingDecision) {
    const labels: Record<string, string> = {
      interested: "✅ Vous êtes intéressé",
      declined: "✖ Vous avez refusé",
      info_requested: "❓ Vous avez demandé des précisions",
    };
    return <p className="text-sm text-muted-foreground">{labels[existingDecision] || existingDecision}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => respond("interested")} disabled={pending} className="btn-primary h-9 px-4 text-xs">
          ✅ Je suis intéressé
        </button>
        <button onClick={() => setShowInfoBox((s) => !s)} className="btn-secondary h-9 px-4 text-xs">
          ❓ Infos complémentaires
        </button>
        <button onClick={() => respond("declined")} disabled={pending} className="h-9 rounded-lg border border-danger px-4 text-xs font-medium text-danger">
          ✖ Refuser
        </button>
      </div>
      {showInfoBox && (
        <div className="flex gap-2">
          <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Votre question..." className="input flex-1" />
          <button onClick={() => respond("info_requested")} disabled={pending || !message} className="btn-primary h-11 px-4 text-xs">
            Envoyer
          </button>
        </div>
      )}
    </div>
  );
}
