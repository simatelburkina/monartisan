"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function UserStatusActions({ userId, status }: { userId: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function act(action: "suspend" | "activate" | "ban") {
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="flex gap-1.5">
      {status !== "active" && (
        <button onClick={() => act("activate")} disabled={pending} className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
          Activer
        </button>
      )}
      {status !== "suspended" && (
        <button onClick={() => act("suspend")} disabled={pending} className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
          Suspendre
        </button>
      )}
      {status !== "banned" && (
        <button onClick={() => act("ban")} disabled={pending} className="rounded-lg bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800">
          Bannir
        </button>
      )}
    </div>
  );
}
