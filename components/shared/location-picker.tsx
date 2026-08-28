"use client";

import { useState } from "react";

export function LocationPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  function capture() {
    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setStatus("idle");
      },
      () => setStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={capture} className="btn-secondary text-sm">
        {status === "loading" ? "Localisation..." : "Utiliser ma position actuelle"}
      </button>
      {lat != null && lng != null && (
        <span className="text-xs text-muted-foreground">
          Position enregistrée ({lat.toFixed(4)}, {lng.toFixed(4)})
        </span>
      )}
      {status === "error" && (
        <span className="text-xs text-destructive">Localisation indisponible.</span>
      )}
    </div>
  );
}
