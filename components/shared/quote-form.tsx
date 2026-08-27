"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";

export function QuoteForm({ requestItemId }: { requestItemId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestItemId,
        description: form.get("description"),
        laborCost: Number(form.get("laborCost") || 0),
        materialsCost: Number(form.get("materialsCost") || 0),
        extraFees: Number(form.get("extraFees") || 0),
        delayDays: form.get("delayDays") ? Number(form.get("delayDays")) : undefined,
        proposedDate: form.get("proposedDate") || undefined,
        conditions: form.get("conditions"),
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur lors de l'envoi du devis.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary flex h-9 items-center gap-1.5 px-4 text-xs">
        <FileText size={14} strokeWidth={1.75} /> Envoyer un devis
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-3">
      <textarea name="description" required placeholder="Description de la prestation" className="textarea" />
      <div className="grid grid-cols-3 gap-2">
        <input type="number" name="laborCost" min={0} placeholder="Main d'œuvre" className="input" />
        <input type="number" name="materialsCost" min={0} placeholder="Matériaux" className="input" />
        <input type="number" name="extraFees" min={0} placeholder="Frais suppl." className="input" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input type="number" name="delayDays" min={0} placeholder="Délai (jours)" className="input" />
        <input type="date" name="proposedDate" className="input" />
      </div>
      <textarea name="conditions" placeholder="Conditions particulières (optionnel)" className="textarea" />
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="btn-primary h-9 px-4 text-xs">
          {loading ? "Envoi..." : "Envoyer le devis"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary h-9 px-4 text-xs">
          Annuler
        </button>
      </div>
    </form>
  );
}
