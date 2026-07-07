import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import type { Database } from "@/types/database"

const ADMIN_PREFIX = "/admin"
const PORTAL_PREFIX = "/portal"

// Runs on every request. Refreshes the auth session (must call getUser(), which
// revalidates against the Auth server — getSession() alone trusts a possibly
// stale/forged cookie) and gates /admin/* and /portal/* by role.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          supabaseResponse = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAdminRoute = pathname.startsWith(ADMIN_PREFIX)
  const isPortalRoute = pathname.startsWith(PORTAL_PREFIX)

  if (pathname === "/login" && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const url = request.nextUrl.clone()
    url.pathname = profile?.role === "admin" ? "/admin/dashboard" : "/portal/dashboard"
    return NextResponse.redirect(url)
  }

  if (isAdminRoute || isPortalRoute) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const allowed =
      (isAdminRoute && profile?.role === "admin") ||
      (isPortalRoute && profile?.role === "client_admin")

    if (!allowed) {
      const url = request.nextUrl.clone()
      url.pathname = "/403"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
