import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

import type { NextRequest } from "next/server"

import {
  isGuestRoute,
  isProtectedRoute,
  isPublicRoute,
} from "@/lib/auth-routes"
import {
  ensureLocalizedPathname,
  getLocaleFromPathname,
  getPreferredLocale,
  isPathnameMissingLocale,
} from "@/lib/i18n"
import { ensureRedirectPathname, ensureWithoutPrefix } from "@/lib/utils"

function redirect(pathname: string, request: NextRequest) {
  const { search, hash } = request.nextUrl
  let resolvedPathname = pathname

  if (isPathnameMissingLocale(pathname)) {
    const preferredLocale = getPreferredLocale(request)
    resolvedPathname = ensureLocalizedPathname(pathname, preferredLocale)
  }
  if (search) {
    resolvedPathname += search
  }
  if (hash) {
    resolvedPathname += hash
  }

  const redirectUrl = new URL(resolvedPathname, request.url).toString()
  return NextResponse.redirect(redirectUrl)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log("Middleware - pathname:", pathname)

  // Skip middleware for API routes
  if (pathname.startsWith("/api/")) {
    console.log("Middleware - skipping API route:", pathname)
    return NextResponse.next()
  }

  const locale = getLocaleFromPathname(pathname)
  const pathnameWithoutLocale = ensureWithoutPrefix(pathname, `/${locale}`)
  const basePath = pathnameWithoutLocale === "" ? "/" : pathnameWithoutLocale
  const isNotPublic = !isPublicRoute(basePath)

  // Handle authentication for protected and guest routes
  if (isNotPublic) {
    const token = await getToken({ req: request })
    const isAuthenticated = !!token
    const isGuest = isGuestRoute(pathnameWithoutLocale)
    const isProtected = isProtectedRoute(pathnameWithoutLocale)

    console.log("Middleware - auth check:", {
      pathname: pathnameWithoutLocale,
      isAuthenticated,
      isGuest,
      isProtected,
    })

    // Redirect authenticated users away from guest routes
    if (isAuthenticated && isGuest) {
      return redirect("/dashboards/analytics", request)
    }

    // Redirect unauthenticated users from protected routes to sign-in
    if (!isAuthenticated && isProtected) {
      let redirectPathname = "/sign-in"

      // Maintain the original path for redirection
      if (pathnameWithoutLocale !== "") {
        redirectPathname = ensureRedirectPathname(redirectPathname, pathname)
      }

      return redirect(redirectPathname, request)
    }
  }

  // Redirect to localized URL if the pathname is missing a locale
  if (!locale) {
    return redirect(pathname, request)
  }

  /**
   * NOTE
   * If your homepage is not '/', you need to configure a redirect
   * in next.config.mjs using the redirects() function,
   * and set the HOME_PATHNAME environment variable accordingly.
   *
   * See https://nextjs.org/docs/app/building-your-application/routing/redirecting#redirects-in-nextconfigjs
   */

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - images folder
     * - docs
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|docs).*)",
  ],
}
