"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Variant = "navbar" | "sidebar" | "sidebar-compact";

export function LogoutButton({ variant = "navbar" }: { variant?: Variant }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (variant === "sidebar-compact") {
    return (
      <button
        onClick={handleLogout}
        title="Déconnexion"
        aria-label="Déconnexion"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-muted-foreground hover:bg-white/5 hover:text-sidebar-foreground"
      >
        <LogOut size={17} strokeWidth={1.75} />
      </button>
    );
  }

  if (variant === "sidebar") {
    return (
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-muted-foreground hover:bg-white/5 hover:text-sidebar-foreground"
      >
        <LogOut size={18} strokeWidth={1.75} />
        Déconnexion
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm font-medium text-muted-foreground hover:text-primary"
    >
      Déconnexion
    </button>
  );
}
