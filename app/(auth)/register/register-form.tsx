"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, User, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<"client" | "artisan">(
    (searchParams.get("role") as "client" | "artisan") || "client"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const phone = String(form.get("phone"));
    const password = String(form.get("password"));
    const firstName = String(form.get("firstName"));
    const lastName = String(form.get("lastName"));
    const companyName = String(form.get("companyName") || "");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          first_name: firstName,
          last_name: lastName,
          phone,
          company_name: role === "artisan" ? companyName : undefined,
        },
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/login"), 1800);
  }

  if (success) {
    return (
      <div className="text-center">
        <CheckCircle2 size={40} strokeWidth={1.5} className="mx-auto text-accent" />
        <h2 className="mt-2 font-semibold">Compte créé !</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Vérifiez votre email pour confirmer votre compte. Redirection vers la connexion...
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold">Créer un compte</h1>
      <p className="mt-1 text-sm text-muted-foreground">Rejoignez MON ARTISAN en quelques secondes.</p>

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
        <button
          type="button"
          onClick={() => setRole("client")}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition ${
            role === "client" ? "bg-card shadow-sm" : "text-muted-foreground"
          }`}
        >
          <User size={16} strokeWidth={1.75} /> Je suis client
        </button>
        <button
          type="button"
          onClick={() => setRole("artisan")}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition ${
            role === "artisan" ? "bg-card shadow-sm" : "text-muted-foreground"
          }`}
        >
          <Wrench size={16} strokeWidth={1.75} /> Je suis artisan
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <input name="firstName" required placeholder="Prénom" className="input" />
          <input name="lastName" required placeholder="Nom" className="input" />
        </div>
        {role === "artisan" && (
          <input name="companyName" placeholder="Nom commercial (optionnel)" className="input" />
        )}
        <input name="phone" required placeholder="Numéro de téléphone" className="input" />
        <input name="email" type="email" required placeholder="Adresse email" className="input" />
        <input name="password" type="password" required minLength={6} placeholder="Mot de passe" className="input" />

        {error && <p className="text-sm text-danger">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary mt-2">
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
