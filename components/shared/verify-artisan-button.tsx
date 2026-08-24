"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function VerifyArtisanButton({ artisanId, isVerified }: { artisanId: string; isVerified: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const res = await fetch(`/api/admin/artisans/${artisanId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: !isVerified }),
      });
      if (res.ok) router.refresh();
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={isVerified ? "rounded-lg bg-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700" : "btn-primary h-8 px-3 text-xs"}
    >
      {isVerified ? "Retirer le badge vérifié" : "✅ Vérifier"}
    </button>
  );
}
