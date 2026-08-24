"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const identifier = String(form.get("identifier")).trim();
    const password = String(form.get("password"));

    const supabase = createClient();
    let email = identifier;

    if (!identifier.includes("@")) {
      const { data } = await supabase.from("profiles").select("email").eq("phone", identifier).maybeSingle();
      if (!data?.email) {
        setError("Aucun compte associé à ce numéro de téléphone.");
        setLoading(false);
        return;
      }
      email = data.email;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Identifiants incorrects.");
      return;
    }
    router.push(searchParams.get("next") || "/");
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-xl font-bold">Connexion</h1>
      <p className="mt-1 text-sm text-muted-foreground">Accédez à votre espace MON ARTISAN.</p>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
        <input name="identifier" required placeholder="Email ou numéro de téléphone" className="input" />
        <input name="password" type="password" required placeholder="Mot de passe" className="input" />

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="text-right">
          <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}
