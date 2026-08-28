"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ArtisanAvailability } from "@/lib/types/database";

const WEEKDAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export function AvailabilityEditor({
  artisanId,
  initialSlots,
}: {
  artisanId: string;
  initialSlots: ArtisanAvailability[];
}) {
  const [slots, setSlots] = useState(initialSlots);
  const [weekday, setWeekday] = useState("1");
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("18:00");
  const supabase = createClient();

  async function addSlot() {
    const { data } = await supabase
      .from("artisan_availability")
      .insert({ artisan_id: artisanId, weekday: Number(weekday), start_time: start, end_time: end })
      .select()
      .single();
    if (data) setSlots((prev) => [...prev, data].sort((a, b) => a.weekday - b.weekday));
  }

  async function removeSlot(id: string) {
    await supabase.from("artisan_availability").delete().eq("id", id);
    setSlots((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-col gap-2">
        {slots.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucun créneau renseigné pour le moment.</p>
        )}
        {slots.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
            <span>
              {WEEKDAYS[s.weekday]} — {s.start_time.slice(0, 5)} à {s.end_time.slice(0, 5)}
            </span>
            <button onClick={() => removeSlot(s.id)} className="text-muted-foreground hover:text-danger">
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select value={weekday} onChange={(e) => setWeekday(e.target.value)} className="input h-10 w-32">
          {WEEKDAYS.map((d, i) => (
            <option key={i} value={i}>
              {d}
            </option>
          ))}
        </select>
        <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="input h-10 w-28" />
        <span className="text-sm text-muted-foreground">à</span>
        <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="input h-10 w-28" />
        <button onClick={addSlot} className="btn-secondary h-10 px-4 text-sm">
          + Ajouter
        </button>
      </div>
    </div>
  );
}
