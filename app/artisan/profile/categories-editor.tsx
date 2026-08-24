"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types/database";

interface Selection {
  category_id: string;
  hourly_rate: number | null;
}

export function CategoriesEditor({
  artisanId,
  categories,
  initialSelection,
}: {
  artisanId: string;
  categories: Category[];
  initialSelection: Selection[];
}) {
  const [selection, setSelection] = useState<Record<string, number | null | undefined>>(
    Object.fromEntries(initialSelection.map((s) => [s.category_id, s.hourly_rate]))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggle(id: string) {
    setSelection((prev) => {
      const next = { ...prev };
      if (id in next) delete next[id];
      else next[id] = null;
      return next;
    });
  }

  function setRate(id: string, value: string) {
    setSelection((prev) => ({ ...prev, [id]: value ? Number(value) : null }));
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    await supabase.from("artisan_categories").delete().eq("artisan_id", artisanId);
    const rows = Object.entries(selection).map(([category_id, hourly_rate]) => ({
      artisan_id: artisanId,
      category_id,
      hourly_rate,
    }));
    if (rows.length > 0) await supabase.from("artisan_categories").insert(rows);
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-col gap-2">
        {categories.map((c) => {
          const checked = c.id in selection;
          return (
            <div key={c.id} className="flex items-center gap-3">
              <label className="flex flex-1 items-center gap-2 text-sm">
                <input type="checkbox" checked={checked} onChange={() => toggle(c.id)} />
                {c.icon} {c.name}
              </label>
              {checked && (
                <input
                  type="number"
                  min={0}
                  placeholder="Tarif/h FCFA"
                  defaultValue={selection[c.id] ?? ""}
                  onChange={(e) => setRate(c.id, e.target.value)}
                  className="input h-9 w-32"
                />
              )}
            </div>
          );
        })}
      </div>
      {saved && <p className="mt-2 text-sm text-accent">Enregistré.</p>}
      <button onClick={save} disabled={saving} className="btn-primary mt-3 w-fit">
        {saving ? "Enregistrement..." : "Enregistrer les métiers"}
      </button>
    </div>
  );
}
