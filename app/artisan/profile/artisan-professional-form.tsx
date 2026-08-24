"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Artisan } from "@/lib/types/database";

export function ArtisanProfessionalForm({ artisan }: { artisan: Artisan }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error } = await supabase
      .from("artisans")
      .update({
        headline: form.get("headline"),
        description: form.get("description"),
        years_experience: Number(form.get("yearsExperience") || 0),
        service_radius_km: Number(form.get("serviceRadius") || 15),
        is_available: form.get("isAvailable") === "on",
      })
      .eq("id", artisan.id);

    setLoading(false);
    if (!error) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div>
        <label className="label">Titre professionnel</label>
        <input name="headline" defaultValue={artisan.headline || ""} placeholder="Ex : Plombier chauffagiste expérimenté" className="input" />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea name="description" defaultValue={artisan.description || ""} placeholder="Présentez votre activité..." className="textarea" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Années d&apos;expérience</label>
          <input type="number" name="yearsExperience" min={0} defaultValue={artisan.years_experience} className="input" />
        </div>
        <div>
          <label className="label">Rayon d&apos;intervention (km)</label>
          <input type="number" name="serviceRadius" min={1} defaultValue={artisan.service_radius_km} className="input" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isAvailable" defaultChecked={artisan.is_available} />
        Je suis actuellement disponible pour de nouvelles demandes
      </label>
      {saved && <p className="text-sm text-accent">Enregistré.</p>}
      <button type="submit" disabled={loading} className="btn-primary w-fit">
        {loading ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
