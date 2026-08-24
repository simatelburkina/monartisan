import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="text-5xl">🔍</span>
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
