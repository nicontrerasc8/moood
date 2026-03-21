import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars, supabasePublishableKey, supabaseUrl } from "../utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (!hasEnvVars) {
    const publicPaths = ["/", "/auth/login", "/auth/forgot-password", "/auth/update-password"];
    if (!publicPaths.includes(request.nextUrl.pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("error", "missing-env");
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl!,
    supabasePublishableKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("[supabase.updateSession] Failed to resolve auth user from cookies", {
      pathname: request.nextUrl.pathname,
      message: error.message,
      status: error.status,
    });
  }

  const pathname = request.nextUrl.pathname;
  const isPublicRoute = pathname === "/" || pathname.startsWith("/auth");

  if (!user && !isPublicRoute) {
    console.warn("[supabase.updateSession] Missing session on protected route", {
      pathname,
    });
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("error", "session-required");
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/auth/login") {
    console.info("[supabase.updateSession] Active session detected on login route", {
      pathname,
      auth_user_id: user.id,
      email: user.email,
    });
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
