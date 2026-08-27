"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, HelpCircle, X } from "lucide-react";

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
    const config: Record<string, { icon: typeof Check; label: string }> = {
      interested: { icon: Check, label: "Vous êtes intéressé" },
      declined: { icon: X, label: "Vous avez refusé" },
      info_requested: { icon: HelpCircle, label: "Vous avez demandé des précisions" },
    };
    const c = config[existingDecision];
    return (
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {c && <c.icon size={14} strokeWidth={1.75} />}
        {c?.label || existingDecision}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => respond("interested")} disabled={pending} className="btn-primary flex h-9 items-center gap-1.5 px-4 text-xs">
          <Check size={14} strokeWidth={2} /> Je suis intéressé
        </button>
        <button onClick={() => setShowInfoBox((s) => !s)} className="btn-secondary flex h-9 items-center gap-1.5 px-4 text-xs">
          <HelpCircle size={14} strokeWidth={1.75} /> Infos complémentaires
        </button>
        <button
          onClick={() => respond("declined")}
          disabled={pending}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-danger px-4 text-xs font-medium text-danger"
        >
          <X size={14} strokeWidth={2} /> Refuser
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
