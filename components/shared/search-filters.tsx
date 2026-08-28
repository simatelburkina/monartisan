"use client";

import { useState } from "react";
import type { Category } from "@/lib/types/database";

export function SearchFilters({
  categories,
  sp,
}: {
  categories: Category[];
  sp: {
    q?: string;
    category?: string;
    city?: string;
    verified?: string;
    available?: string;
    maxPrice?: string;
    minExperience?: string;
    sort?: string;
    lat?: string;
    lng?: string;
    maxDistance?: string;
  };
}) {
  const [locating, setLocating] = useState(false);
  const [lat, setLat] = useState(sp.lat || "");
  const [lng, setLng] = useState(sp.lng || "");

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude));
        setLng(String(pos.coords.longitude));
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <form className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-4">
      <input
        type="text"
        name="q"
        defaultValue={sp.q}
        placeholder="Métier, nom..."
        className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <select
        name="category"
        defaultValue={sp.category || ""}
        className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Toutes les catégories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <input
        type="text"
        name="city"
        defaultValue={sp.city}
        placeholder="Ville / quartier"
        className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <select
        name="sort"
        defaultValue={sp.sort || "rating"}
        className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="rating">Trier par note</option>
        <option value="distance">Trier par distance</option>
        <option value="price">Trier par prix</option>
        <option value="experience">Trier par expérience</option>
      </select>

      <input
        type="number"
        name="maxPrice"
        min={0}
        defaultValue={sp.maxPrice}
        placeholder="Tarif max (FCFA/h)"
        className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <input
        type="number"
        name="minExperience"
        min={0}
        defaultValue={sp.minExperience}
        placeholder="Expérience min (années)"
        className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <input
        type="number"
        name="maxDistance"
        min={1}
        defaultValue={sp.maxDistance}
        placeholder="Distance max (km)"
        className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <button
        type="button"
        onClick={useMyLocation}
        className="h-11 rounded-lg border border-border bg-background px-3 text-sm hover:bg-muted"
      >
        {locating ? "Localisation..." : lat ? "Position enregistrée ✓" : "📍 Près de moi"}
      </button>
      <input type="hidden" name="lat" value={lat} />
      <input type="hidden" name="lng" value={lng} />

      <label className="flex h-11 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm">
        <input type="checkbox" name="verified" value="1" defaultChecked={sp.verified === "1"} />
        Artisans vérifiés uniquement
      </label>
      <label className="flex h-11 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm">
        <input type="checkbox" name="available" value="1" defaultChecked={sp.available === "1"} />
        Disponibles maintenant
      </label>

      <button
        type="submit"
        className="h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 sm:col-span-2"
      >
        Filtrer
      </button>
    </form>
  );
}
