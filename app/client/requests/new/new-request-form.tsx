"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types/database";

interface ItemDraft {
  categoryId: string;
  description: string;
}

export function NewRequestForm({
  categories,
  defaultCategorySlug,
}: {
  categories: Category[];
  defaultCategorySlug?: string;
}) {
  const router = useRouter();
  const defaultCategory = categories.find((c) => c.slug === defaultCategorySlug);
  const [items, setItems] = useState<ItemDraft[]>([{ categoryId: defaultCategory?.id || "", description: "" }]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateItem(index: number, patch: Partial<ItemDraft>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (items.some((it) => !it.categoryId)) {
      setError("Veuillez choisir une catégorie pour chaque prestation.");
      return;
    }
    setLoading(true);

    const form = new FormData(e.currentTarget);
    let mediaUrls: string[] = [];

    if (files.length > 0) {
      const supabase = createClient();
      const uploads = await Promise.all(
        files.map(async (file) => {
          const path = `${crypto.randomUUID()}-${file.name}`;
          const { error } = await supabase.storage.from("request-media").upload(path, file);
          if (error) return null;
          return supabase.storage.from("request-media").getPublicUrl(path).data.publicUrl;
        })
      );
      mediaUrls = uploads.filter((u): u is string => Boolean(u));
    }

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        description: form.get("description"),
        address: form.get("address"),
        city: form.get("city"),
        desiredDate: form.get("desiredDate") || undefined,
        desiredTime: form.get("desiredTime") || undefined,
        budgetMin: form.get("budgetMin") ? Number(form.get("budgetMin")) : undefined,
        budgetMax: form.get("budgetMax") ? Number(form.get("budgetMax")) : undefined,
        estimatedDuration: form.get("estimatedDuration"),
        urgency: form.get("urgency"),
        items: items.map((it) => ({ categoryId: it.categoryId, description: it.description })),
        mediaUrls,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Une erreur est survenue.");
      return;
    }
    const { request } = await res.json();
    router.push(`/client/requests/${request.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div>
        <label className="label">Titre de la demande *</label>
        <input name="title" required placeholder="Ex : Réparation d'une fuite d'eau" className="input" />
      </div>

      <div>
        <label className="label">Description du besoin *</label>
        <textarea
          name="description"
          required
          placeholder="Décrivez votre besoin en détail..."
          className="textarea"
        />
      </div>

      <div>
        <label className="label">Prestations demandées *</label>
        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-start">
              <select
                value={item.categoryId}
                onChange={(e) => updateItem(i, { categoryId: e.target.value })}
                className="select sm:w-48"
              >
                <option value="">Choisir un métier</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
              <input
                value={item.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
                placeholder="Précision (optionnel)"
                className="input flex-1"
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-sm text-danger"
                >
                  Retirer
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, { categoryId: "", description: "" }])}
          className="mt-2 text-sm font-medium text-primary hover:underline"
        >
          + Ajouter une autre prestation
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Ville</label>
          <input name="city" placeholder="Ouagadougou..." className="input" />
        </div>
        <div>
          <label className="label">Adresse précise</label>
          <input name="address" placeholder="Quartier, secteur..." className="input" />
        </div>
        <div>
          <label className="label">Date souhaitée</label>
          <input type="date" name="desiredDate" className="input" />
        </div>
        <div>
          <label className="label">Heure souhaitée</label>
          <input type="time" name="desiredTime" className="input" />
        </div>
        <div>
          <label className="label">Budget min (FCFA)</label>
          <input type="number" name="budgetMin" min={0} className="input" />
        </div>
        <div>
          <label className="label">Budget max (FCFA)</label>
          <input type="number" name="budgetMax" min={0} className="input" />
        </div>
        <div>
          <label className="label">Durée estimée</label>
          <input name="estimatedDuration" placeholder="Ex : 2 jours" className="input" />
        </div>
        <div>
          <label className="label">Urgence</label>
          <select name="urgency" defaultValue="normal" className="select">
            <option value="low">Pas urgent</option>
            <option value="normal">Normal</option>
            <option value="high">Urgent</option>
            <option value="urgent">Très urgent</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Photos / vidéos (optionnel)</label>
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="input py-1.5"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Publication..." : "Publier la demande"}
      </button>
    </form>
  );
}
