"use client";

import { useState } from "react";
import type { Category } from "@/lib/types/database";

export function CategoriesAdmin({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);

  async function addCategory() {
    if (!name) return;
    setLoading(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, icon }),
    });
    setLoading(false);
    if (res.ok) {
      const { category } = await res.json();
      setCategories((prev) => [...prev, category]);
      setName("");
      setIcon("");
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, is_active: !isActive } : c)));
    await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
  }

  async function remove(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
  }

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label">Nom de la catégorie</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Plomberie" className="input" />
        </div>
        <div className="w-24">
          <label className="label">Icône</label>
          <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🔧" className="input" />
        </div>
        <button onClick={addCategory} disabled={loading || !name} className="btn-primary">
          + Ajouter
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
            <span className="flex items-center gap-2 text-sm">
              <span className="text-lg">{c.icon}</span>
              {c.name}
              {!c.is_active && <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs">Inactive</span>}
            </span>
            <div className="flex gap-2">
              <button onClick={() => toggleActive(c.id, c.is_active)} className="btn-secondary h-8 px-3 text-xs">
                {c.is_active ? "Désactiver" : "Activer"}
              </button>
              <button onClick={() => remove(c.id)} className="h-8 rounded-lg border border-danger px-3 text-xs font-medium text-danger">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
