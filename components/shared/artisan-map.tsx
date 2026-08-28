"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { ArtisanCardData } from "./artisan-card";

const DEFAULT_CENTER: [number, number] = [12.3714, -1.5197]; // Ouagadougou

export function ArtisanMap({
  artisans,
  center,
}: {
  artisans: ArtisanCardData[];
  center?: { lat: number; lng: number } | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapRef.current) return;

      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      const startCenter: [number, number] = center ? [center.lat, center.lng] : DEFAULT_CENTER;
      const map = L.map(mapRef.current).setView(startCenter, center ? 12 : 7);
      leafletMapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      if (center) {
        L.marker([center.lat, center.lng], { icon })
          .addTo(map)
          .bindPopup("Votre position");
      }

      const located = artisans.filter((a) => a.lat != null && a.lng != null);
      const bounds: [number, number][] = center ? [[center.lat, center.lng]] : [];
      located.forEach((a) => {
        const name = a.company_name || a.display_name || "Artisan";
        L.marker([a.lat as number, a.lng as number], { icon })
          .addTo(map)
          .bindPopup(`<a href="/artisans/${a.id}">${name}</a>`);
        bounds.push([a.lat as number, a.lng as number]);
      });

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    }

    init();

    return () => {
      cancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [artisans, center]);

  const anyLocated = artisans.some((a) => a.lat != null && a.lng != null);

  return (
    <div>
      {!anyLocated && (
        <p className="mb-2 text-sm text-muted-foreground">
          Aucun artisan géolocalisé à afficher pour ces filtres.
        </p>
      )}
      <div ref={mapRef} className="h-[480px] w-full rounded-2xl border border-border" />
    </div>
  );
}
