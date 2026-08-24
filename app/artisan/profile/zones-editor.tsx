"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ArtisanZone } from "@/lib/types/database";

export function ZonesEditor({ artisanId, initialZones }: { artisanId: string; initialZones: ArtisanZone[] }) {
  const [zones, setZones] = useState(initialZones);
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const supabase = createClient();

  async function addZone() {
    if (!city) return;
    const { data } = await supabase
      .from("artisan_zones")
      .insert({ artisan_id: artisanId, city, district: district || null })
      .select()
      .single();
    if (data) {
      setZones((prev) => [...prev, data]);
      setCity("");
      setDistrict("");
    }
  }

  async function removeZone(id: string) {
    await supabase.from("artisan_zones").delete().eq("id", id);
    setZones((prev) => prev.filter((z) => z.id !== id));
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap gap-2">
        {zones.map((z) => (
          <span key={z.id} className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm">
            {z.city}
            {z.district ? ` (${z.district})` : ""}
            <button onClick={() => removeZone(z.id)} className="text-muted-foreground hover:text-danger">
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ville" className="input h-10 w-36" />
        <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Quartier (optionnel)" className="input h-10 w-44" />
        <button onClick={addZone} className="btn-secondary h-10 px-4 text-sm">
          + Ajouter
        </button>
      </div>
    </div>
  );
}
