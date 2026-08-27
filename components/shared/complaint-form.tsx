"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import type { ComplaintReason } from "@/lib/types/database";

const REASONS: { value: ComplaintReason; label: string }[] = [
  { value: "not_done", label: "Prestation non réalisée" },
  { value: "not_compliant", label: "Travail non conforme" },
  { value: "payment_dispute", label: "Paiement contesté" },
  { value: "bad_behavior", label: "Comportement inapproprié" },
  { value: "fraud", label: "Fraude" },
  { value: "fake_profile", label: "Faux profil" },
  { value: "other", label: "Autre" },
];

export function ComplaintForm({ bookingId, againstId }: { bookingId?: string; againstId?: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ComplaintReason>("other");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, againstId, reason, description }),
    });
    setLoading(false);
    if (res.ok) setSent(true);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-2 flex items-center gap-1 text-xs font-medium text-danger hover:underline">
        <Flag size={13} strokeWidth={1.75} /> Signaler un problème
      </button>
    );
  }

  if (sent) {
    return <p className="mt-2 text-sm text-muted-foreground">Votre réclamation a été transmise à l&apos;administration.</p>;
  }

  return (
    <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3">
      <p className="text-sm font-semibold">Signaler un problème</p>
      <select value={reason} onChange={(e) => setReason(e.target.value as ComplaintReason)} className="select mt-2">
        {REASONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Décrivez le problème..."
        className="textarea mt-2"
      />
      <div className="mt-2 flex gap-2">
        <button onClick={submit} disabled={loading || !description} className="btn-primary h-9 px-4 text-xs">
          {loading ? "Envoi..." : "Envoyer"}
        </button>
        <button onClick={() => setOpen(false)} className="btn-secondary h-9 px-4 text-xs">
          Annuler
        </button>
      </div>
    </div>
  );
}
