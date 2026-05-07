import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from "jose"
import { createClient } from '@/utils/supabase/proxy'

const secretKey = process.env.JWT_SECRET || "default-secret-key-change-me";
const key = new TextEncoder().encode(secretKey);

async function decrypt<T = object>(input: string): Promise<T> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload as T;
}

// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard', '/admin']
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

export default async function proxy(request: NextRequest) {
  // Integrate Supabase session refreshing
  const supabaseResponse = createClient(request)

  // 2. Check if the current route is protected or public
  const path = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  // 3. Decrypt the session from the cookie
  const cookie = request.cookies.get('session')?.value
  const session = cookie ? await decrypt(cookie).catch(() => null) : null

  // 4. Redirect to /login if the user is not authenticated
  const isOnboardingRoute = path.startsWith('/onboarding')

  if ((isProtectedRoute || isOnboardingRoute) && !session) {
    const url = new URL('/login', request.nextUrl)
    url.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(url)
  }

  // 5. Enforce space creation (onboarding)
  if (isProtectedRoute && session && !session.hasSpace && !isOnboardingRoute) {
    return NextResponse.redirect(new URL('/onboarding', request.nextUrl))
  }

  // 6. Redirect to /dashboard if the user is authenticated and has a space
  if (
    (isPublicRoute || isOnboardingRoute) &&
    session &&
    session.hasSpace &&
    !path.startsWith('/dashboard')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
  }

  // Special case: if on onboarding but has space, go to dashboard
  if (isOnboardingRoute && session && session.hasSpace) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
  }

  return supabaseResponse
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
