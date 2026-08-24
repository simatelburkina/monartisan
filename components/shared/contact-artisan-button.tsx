"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function ContactArtisanButton({ artisanId, isClient }: { artisanId: string; isClient: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!isClient) {
      router.push("/login");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artisanId }),
      });
      if (res.ok) {
        const { conversation } = await res.json();
        router.push(`/messages/${conversation.id}`);
      }
    });
  }

  return (
    <button onClick={handleClick} disabled={pending} className="btn-primary disabled:opacity-60">
      💬 {pending ? "..." : "Contacter"}
    </button>
  );
}
