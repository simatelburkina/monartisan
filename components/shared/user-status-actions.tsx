"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

interface EditableUser {
  id: string;
  display_name: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
}

export function UserStatusActions({ userId, status }: { userId: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function act(action: "suspend" | "activate" | "ban") {
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) router.refresh();
    });
  }

  function remove() {
    if (!window.confirm("Supprimer définitivement ce compte et toutes ses données (demandes, prestations, messages, avis) ? Cette action est irréversible.")) {
      return;
    }
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {status !== "active" && (
        <button onClick={() => act("activate")} disabled={pending} className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
          Activer
        </button>
      )}
      {status !== "suspended" && (
        <button onClick={() => act("suspend")} disabled={pending} className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
          Suspendre
        </button>
      )}
      {status !== "banned" && (
        <button onClick={() => act("ban")} disabled={pending} className="rounded-lg bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800">
          Bannir
        </button>
      )}
      <button
        onClick={remove}
        disabled={pending}
        aria-label="Supprimer le compte"
        className="flex items-center rounded-lg bg-stone-200 px-2 py-1 text-xs font-medium text-stone-700 hover:bg-red-100 hover:text-red-800"
      >
        <Trash2 size={13} strokeWidth={1.75} />
      </button>
    </div>
  );
}

export function UserEditButton({ user }: { user: EditableUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState(user.display_name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [city, setCity] = useState(user.city || "");
  const [address, setAddress] = useState(user.address || "");

  function save() {
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "edit", displayName, phone, city, address }),
      });
      if (res.ok) {
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Modifier"
        className="flex items-center rounded-lg bg-stone-200 px-2 py-1 text-xs font-medium text-stone-700 hover:bg-stone-300"
      >
        <Pencil size={13} strokeWidth={1.75} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-4 shadow-lg">
            <p className="text-sm font-semibold">Modifier l&apos;utilisateur</p>
            <div className="mt-3 flex flex-col gap-2">
              <input className="input" placeholder="Nom affiché" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              <input className="input" placeholder="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <input className="input" placeholder="Ville" value={city} onChange={(e) => setCity(e.target.value)} />
              <input className="input" placeholder="Adresse" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="btn-secondary h-9 px-3 text-xs">
                Annuler
              </button>
              <button onClick={save} disabled={pending} className="btn-primary h-9 px-3 text-xs">
                {pending ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
