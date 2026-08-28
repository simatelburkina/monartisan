import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/data/auth";
import { LogoutButton } from "./logout-button";

export async function Navbar() {
  const profile = await getCurrentUser();
  const spaceHref = profile ? `/${profile.role === "admin" ? "admin" : profile.role}` : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
          <Image src="/icons/logo-mark.png" alt="" width={36} height={36} className="h-9 w-9" priority />
          <span>
            MON ARTISAN
            <span className="hidden sm:inline text-xs font-normal text-muted-foreground">
              {" "}
              — Votre artisan, à portée de main
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link href="/artisans" className="hidden text-sm font-medium hover:text-primary sm:block">
            Trouver un artisan
          </Link>
          <Link href="/categories" className="hidden text-sm font-medium hover:text-primary sm:block">
            Catégories
          </Link>

          {profile ? (
            <>
              <Link
                href={spaceHref!}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                {profile.role === "client" && "Mon espace"}
                {profile.role === "artisan" && "Mon espace pro"}
                {profile.role === "admin" && "Administration"}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium hover:text-primary">
                Connexion
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Inscription
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
