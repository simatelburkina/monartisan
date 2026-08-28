"use client";

import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { ArtisanCardData } from "./artisan-card";

const ArtisanMap = dynamic(() => import("./artisan-map").then((m) => m.ArtisanMap), {
  ssr: false,
  loading: () => <div className="mt-8 h-[480px] w-full animate-pulse rounded-2xl border border-border bg-muted" />,
});

export function ArtisanViewToggle({
  artisans,
  center,
  defaultView,
  children,
}: {
  artisans: ArtisanCardData[];
  center: { lat: number; lng: number } | null;
  defaultView: "list" | "map";
  children: ReactNode;
}) {
  const [view, setView] = useState<"list" | "map">(defaultView);

  return (
    <div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setView("list")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${view === "list" ? "bg-primary text-primary-foreground" : "border border-border bg-background"}`}
        >
          Liste
        </button>
        <button
          type="button"
          onClick={() => setView("map")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${view === "map" ? "bg-primary text-primary-foreground" : "border border-border bg-background"}`}
        >
          Carte
        </button>
      </div>

      {view === "list" ? children : (
        <div className="mt-8">
          <ArtisanMap artisans={artisans} center={center} />
        </div>
      )}
    </div>
  );
}
