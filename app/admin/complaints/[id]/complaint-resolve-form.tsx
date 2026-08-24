"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ComplaintResolveForm({ complaintId, currentStatus }: { complaintId: string; currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const res = await fetch(`/api/admin/complaints/${complaintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, resolutionNote: note }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-4">
      <label className="label">Statut</label>
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="select">
        <option value="open">Ouverte</option>
        <option value="investigating">En cours d&apos;investigation</option>
        <option value="resolved">Résolue</option>
        <option value="rejected">Rejetée</option>
      </select>
      <label className="label mt-2">Note de résolution</label>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} className="textarea" />
      <button onClick={submit} disabled={loading} className="btn-primary mt-2">
        {loading ? "Enregistrement..." : "Mettre à jour"}
      </button>
    </div>
  );
}
