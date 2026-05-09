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

// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard', '/admin']
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 0. Skip middleware for static assets and API
  const skipPaths = [
    '/api',
    '/_next',
    '/favicon.ico',
    '/images',
    '/videos',
    '/robots.txt',
    '/sitemap.xml',
  ]

  if (skipPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // 1. Get current locale
  const currentLocale = getLocale(request)
  const segments = pathname.split('/').filter(Boolean)
  const hasLocalePrefix = segments.length > 0 && supportedLanguages.includes(segments[0] as Language)

  // Integrate Supabase session refreshing
  const supabaseResponse = createClient(request)

  // 2. Check if the current route is protected or public
  const path = hasLocalePrefix ? `/${segments.slice(1).join('/')}` : pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  // 3. Decrypt the session from the cookie
  const cookie = request.cookies.get('session')?.value
  const session = cookie ? await decrypt<SessionPayload>(cookie).catch(() => null) : null

  // 4. Redirect to /login if the user is not authenticated
  const isOnboardingRoute = path.startsWith('/onboarding')

  if ((isProtectedRoute || isOnboardingRoute) && !session) {
    const url = new URL(`/${currentLocale}/login`, request.nextUrl)
    url.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(url)
  }

  // 5. Enforce space creation (onboarding)
  if (isProtectedRoute && session && !session.hasSpace && !isOnboardingRoute) {
    return NextResponse.redirect(new URL(`/${currentLocale}/onboarding`, request.nextUrl))
  }

  // 6. Redirect to /dashboard if the user is authenticated and has a space
  if (
    (isPublicRoute || isOnboardingRoute) &&
    session &&
    session.hasSpace &&
    !path.startsWith('/dashboard')
  ) {
    return NextResponse.redirect(new URL(`/${currentLocale}/dashboard`, request.nextUrl))
  }

  // Special case: if on onboarding but has space, go to dashboard
  if (isOnboardingRoute && session && session.hasSpace) {
    return NextResponse.redirect(new URL(`/${currentLocale}/dashboard`, request.nextUrl))
  }

  // 7. Finally, check for i18n redirection if no locale prefix is present
  if (!hasLocalePrefix) {
    const newUrl = request.nextUrl.clone()
    newUrl.pathname = `/${currentLocale}${pathname}`
    return NextResponse.redirect(newUrl)
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
