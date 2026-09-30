import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const adminCookie = request.cookies.get("wrapoura_admin_session");

  // Authorized Admin Mobile Numbers
  const ALLOWED_ADMIN_PHONES = (
    process.env.ADMIN_ALLOWED_PHONES || "7006506721,9541223100"
  )
    .split(",")
    .map((p) => p.trim().replace(/\D/g, "").slice(-10))
    .filter(Boolean);

  let isAuthenticatedAdmin = false;
  if (adminCookie?.value) {
    try {
      const session = JSON.parse(adminCookie.value);
      const sessionPhone = session.phone ? String(session.phone).replace(/\D/g, "").slice(-10) : "";
      if (session.role === "admin" && ALLOWED_ADMIN_PHONES.includes(sessionPhone)) {
        isAuthenticatedAdmin = true;
      }
    } catch {
      isAuthenticatedAdmin = false;
    }
  }

  // Handle direct /admin or /admin/ visits
  if (pathname === "/admin" || pathname === "/admin/") {
    const url = request.nextUrl.clone();
    url.pathname = isAuthenticatedAdmin ? "/admin/dashboard" : "/admin/login";
    return NextResponse.redirect(url);
  }

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!isAuthenticatedAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protect /api/admin routes
  if (pathname.startsWith("/api/admin")) {
    if (!isAuthenticatedAdmin) {
      return NextResponse.json({ ok: false, error: "Unauthorized admin access" }, { status: 401 });
    }
  }

  // If already logged in and visiting /admin/login, redirect to /admin/dashboard
  if (pathname === "/admin/login" && isAuthenticatedAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
