"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Car, PlayCircle, CheckCircle2, Lock, Wallet, type LucideIcon } from "lucide-react";

const ACTIONS: Record<string, { action: string; label: string; icon: LucideIcon }[]> = {
  artisan: [
    { action: "en_route", label: "Je suis en route", icon: Car },
    { action: "start", label: "Démarrer la prestation", icon: PlayCircle },
    { action: "complete", label: "Marquer comme terminée", icon: CheckCircle2 },
    { action: "close", label: "Clôturer", icon: Lock },
  ],
  client: [
    { action: "confirm_payment", label: "Confirmer le paiement", icon: Wallet },
    { action: "close", label: "Clôturer", icon: Lock },
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
        <button key={a.action} onClick={() => act(a.action)} disabled={pending} className="btn-primary flex h-9 items-center gap-1.5 px-4 text-xs">
          <a.icon size={14} strokeWidth={1.75} /> {a.label}
        </button>
      ))}
    </div>
  );
}
