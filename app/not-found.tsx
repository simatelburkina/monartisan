import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <SearchX size={30} strokeWidth={1.5} />
      </span>
      <h1 className="text-2xl font-bold">Page introuvable</h1>
      <p className="max-w-sm text-muted-foreground">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link href="/" className="btn-primary mt-2">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
