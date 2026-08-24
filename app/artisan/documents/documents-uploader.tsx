"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils/format";
import type { DocumentRow } from "@/lib/types/database";

const DOC_TYPES = [
  { value: "cni", label: "Carte d'identité (CNI)" },
  { value: "registre_commerce", label: "Registre de commerce" },
  { value: "diplome", label: "Diplôme / certification" },
  { value: "autre", label: "Autre document" },
];

const STATUS_LABELS: Record<string, string> = { pending: "En attente", approved: "Approuvé", rejected: "Rejeté" };
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

export function DocumentsUploader({ artisanId, documents }: { artisanId: string; documents: DocumentRow[] }) {
  const router = useRouter();
  const [docType, setDocType] = useState("cni");
  const [loading, setLoading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const supabase = createClient();
    const path = `${artisanId}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("documents").upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from("documents").getPublicUrl(path);
      await supabase.from("documents").insert({ artisan_id: artisanId, doc_type: docType, file_url: data.publicUrl });
      router.refresh();
    }
    setLoading(false);
    e.target.value = "";
  }

  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-border bg-card p-4">
        <label className="label">Type de document</label>
        <select value={docType} onChange={(e) => setDocType(e.target.value)} className="select">
          {DOC_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <label className="btn-primary mt-3 w-fit cursor-pointer">
          {loading ? "Envoi..." : "📎 Choisir un fichier"}
          <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleUpload} disabled={loading} />
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {documents.map((d) => (
          <div key={d.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-sm">
            <div>
              <p className="font-medium">{DOC_TYPES.find((t) => t.value === d.doc_type)?.label || d.doc_type}</p>
              <p className="text-xs text-muted-foreground">{formatDate(d.created_at)}</p>
              {d.status === "rejected" && d.rejection_reason && (
                <p className="mt-1 text-xs text-danger">Motif : {d.rejection_reason}</p>
              )}
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[d.status]}`}>
              {STATUS_LABELS[d.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
