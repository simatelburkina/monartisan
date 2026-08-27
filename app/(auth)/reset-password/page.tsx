"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    const confirm = String(form.get("confirm"));

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  if (success) {
    return (
      <div className="text-center">
        <CheckCircle2 size={40} strokeWidth={1.5} className="mx-auto text-accent" />
        <h2 className="mt-2 font-semibold">Mot de passe mis à jour</h2>
        <p className="mt-1 text-sm text-muted-foreground">Redirection vers la connexion...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold">Nouveau mot de passe</h1>
      <p className="mt-1 text-sm text-muted-foreground">Choisissez un nouveau mot de passe.</p>
      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
        <input name="password" type="password" required minLength={6} placeholder="Nouveau mot de passe" className="input" />
        <input name="confirm" type="password" required minLength={6} placeholder="Confirmer le mot de passe" className="input" />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Enregistrement..." : "Réinitialiser"}
        </button>
      </form>
    </div>
  );
}
