"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const email = String(new FormData(e.currentTarget).get("email"));
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center">
        <MailCheck size={40} strokeWidth={1.5} className="mx-auto text-primary" />
        <h2 className="mt-2 font-semibold">Email envoyé</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Consultez votre boîte mail pour réinitialiser votre mot de passe.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold">Mot de passe oublié</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Recevez un lien de réinitialisation par email.
      </p>
      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
        <input name="email" type="email" required placeholder="Adresse email" className="input" />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Envoi..." : "Envoyer le lien"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link href="/login" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
          <ArrowLeft size={14} strokeWidth={2} /> Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
