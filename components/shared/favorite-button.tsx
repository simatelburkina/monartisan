"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

export function FavoriteButton({ artisanId, initialFavorited, isClient }: { artisanId: string; initialFavorited: boolean; isClient: boolean }) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();

  function toggle() {
    if (!isClient) {
      router.push("/login");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artisanId }),
      });
      if (res.ok) {
        const data = await res.json();
        setFavorited(data.favorited);
      }
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60"
    >
      <Heart size={16} strokeWidth={1.75} className={favorited ? "fill-danger text-danger" : ""} />
      {favorited ? "Dans vos favoris" : "Ajouter aux favoris"}
    </button>
  );
}
