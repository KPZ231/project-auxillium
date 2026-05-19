import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from "jose"
import { createClient } from '@/utils/supabase/proxy'
import { defaultLanguage, supportedLanguages, type Language } from '@/lib/i18n-config'

const secretKey = process.env.JWT_SECRET || "default-secret-key-change-me";
const key = new TextEncoder().encode(secretKey);

async function decrypt<T = object>(input: string): Promise<T> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload as T;
}

export interface SessionPayload {
  userId: string;
  email: string;
  hasSpace: boolean;
  name?: string;
}

function getLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get('i18next')?.value;
  if (cookieLocale && supportedLanguages.includes(cookieLocale as Language)) {
    return cookieLocale;
  }

  const pathname = request.nextUrl.pathname;
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length > 0) {
    const potentialLocale = segments[0];
    if (supportedLanguages.includes(potentialLocale as Language)) {
      return potentialLocale;
    }
  }

  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',').map((l) => l.trim().split(';')[0]);
    for (const lang of languages) {
      if (supportedLanguages.includes(lang as Language)) {
        return lang;
      }
    }
  }

  return defaultLanguage;
}

// 0. Skip paths that don't need proxying (API, static files, etc.)
const skipPaths = [
  '/api',
  '/_next',
  '/favicon.ico',
  '/images',
  '/videos',
  '/robots.txt',
  '/sitemap.xml',
]

// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard', '/admin']
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

/**
 * Main proxy handler for authentication and i18n routing
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 1. Skip paths that don't need proxying (API, static files, etc.)
  if (skipPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // 2. Initial response for Supabase session management
  const supabaseResponse = createClient(request)

  // 3. Extract locale and normalized path
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0] as Language | undefined
  const hasLocalePrefix = firstSegment && supportedLanguages.includes(firstSegment)
  
  const currentLocale = getLocale(request)
  const path = hasLocalePrefix ? `/${segments.slice(1).join('/')}` : pathname
  
  // 4. Route classification
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))
  const isOnboardingRoute = path.startsWith('/onboarding')

  // 5. Authentication check
  const cookie = request.cookies.get('session')?.value
  const session = cookie ? await decrypt<SessionPayload>(cookie).catch(() => null) : null

  // 6. Access Control Logic
  
  // A. Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !session) {
    const loginUrl = new URL(`/${currentLocale}/login`, request.nextUrl)
    // Use the full pathname for callback to preserve locale
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // B. Redirect authenticated users with a space to dashboard if they are at public routes or onboarding
  if (session && session.hasSpace && (isPublicRoute || isOnboardingRoute)) {
    return NextResponse.redirect(new URL(`/${currentLocale}/dashboard`, request.nextUrl))
  }

  // C. Redirect authenticated users without a space to onboarding (unless already there)
  if (isProtectedRoute && session && !session.hasSpace && !isOnboardingRoute) {
    return NextResponse.redirect(new URL(`/${currentLocale}/onboarding`, request.nextUrl))
  }

  // 7. Final check for i18n redirection
  // If the path doesn't have a locale prefix, redirect to the version with the locale
  if (!hasLocalePrefix) {
    const localizedUrl = new URL(`/${currentLocale}${pathname}`, request.nextUrl)
    return NextResponse.redirect(localizedUrl)
  }

  return supabaseResponse
}

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
};
