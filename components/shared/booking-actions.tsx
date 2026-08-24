"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

const ACTIONS: Record<string, { action: string; label: string }[]> = {
  artisan: [
    { action: "en_route", label: "🚗 Je suis en route" },
    { action: "start", label: "▶️ Démarrer la prestation" },
    { action: "complete", label: "✅ Marquer comme terminée" },
    { action: "close", label: "🔒 Clôturer" },
  ],
  client: [
    { action: "confirm_payment", label: "💰 Confirmer le paiement" },
    { action: "close", label: "🔒 Clôturer" },
  ],
};

const VISIBLE_FOR_STATUS: Record<string, string[]> = {
  scheduled: ["en_route", "start"],
  artisan_en_route: ["start"],
  in_progress: ["complete"],
  completed: ["confirm_payment"],
  paid: ["close"],
};

export function BookingActions({ bookingId, status, role }: { bookingId: string; status: string; role: "client" | "artisan" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const allowedActions = VISIBLE_FOR_STATUS[status] || [];
  const actions = ACTIONS[role].filter((a) => allowedActions.includes(a.action));

  if (actions.length === 0) return null;

  function act(action: string) {
    startTransition(async () => {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {actions.map((a) => (
        <button key={a.action} onClick={() => act(a.action)} disabled={pending} className="btn-primary h-9 px-4 text-xs">
          {a.label}
        </button>
      ))}
    </div>
  );
}
