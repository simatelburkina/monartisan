"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PortfolioItem } from "@/lib/types/database";

export function PortfolioEditor({ artisanId, initialItems }: { artisanId: string; initialItems: PortfolioItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setLoading(true);
    for (const file of files) {
      const path = `${artisanId}/${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from("portfolios").upload(path, file);
      if (!error) {
        const { data: url } = supabase.storage.from("portfolios").getPublicUrl(path);
        const { data } = await supabase
          .from("portfolio_items")
          .insert({ artisan_id: artisanId, image_url: url.publicUrl })
          .select()
          .single();
        if (data) setItems((prev) => [data, ...prev]);
      }
    }
    setLoading(false);
    e.target.value = "";
  }

  async function remove(id: string) {
    await supabase.from("portfolio_items").delete().eq("id", id);
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {items.map((p) => (
          <div key={p.id} className="group relative aspect-square overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image_url} alt="" className="h-full w-full object-cover" />
            <button
              onClick={() => remove(p.id)}
              className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white group-hover:flex"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <label className="btn-secondary mt-3 w-fit cursor-pointer">
        {loading ? "Envoi..." : "+ Ajouter des photos"}
        <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} disabled={loading} />
      </label>
    </div>
  );
}
