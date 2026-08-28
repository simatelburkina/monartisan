import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rafraîchit la session Supabase à chaque requête et protège les espaces privés.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const path = request.nextUrl.pathname;
  const startsWithSegment = (prefix: string) => path === prefix || path.startsWith(`${prefix}/`);
  const isPrivate =
    startsWithSegment("/client") || startsWithSegment("/artisan") || startsWithSegment("/admin");
  const isAuthPage = startsWithSegment("/login") || startsWithSegment("/register");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sans variables d'environnement, on ne peut pas vérifier la session : ne jamais planter
  // le middleware (ça fait tomber toute l'app), on laisse simplement passer la requête.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase env vars missing in middleware — auth checks skipped.");
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isPrivate && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }

    const isHome = path === "/";

    if (user && (isAuthPage || isHome)) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      // Un utilisateur connecté est automatiquement redirigé vers son espace pro/client/admin.
      const url = request.nextUrl.clone();
      url.pathname = `/${profile?.role || "client"}`;
      return NextResponse.redirect(url);
    }

    if (startsWithSegment("/admin") && user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }

    return response;
  } catch (err) {
    // Une erreur réseau/Supabase ici ne doit jamais faire planter le middleware :
    // ça renvoie une réponse invalide au navigateur (page blanche "server error").
    console.error("Supabase middleware error:", err);
    if (isPrivate) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
    return response;
  }
}
