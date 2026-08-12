import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/core/auth/auth-cookie';

const PROTECTED_PREFIXES = [
  '/home',
  '/courses',
  '/social',
  '/leaderboard',
  '/profile',
  '/friends',
  '/roadmap',
  '/ai',
];
const DEFAULT_AFTER_AUTH_PATH = '/courses';

function isPublicSocialSharePath(pathname: string) {
  return /^\/social\/users\/[^/]+\/?$/.test(pathname) || /^\/social\/[^/]+\/?$/.test(pathname);
}

function isProtectedPath(pathname: string) {
  if (isPublicSocialSharePath(pathname)) return false;
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLoggedIn = request.cookies.has(AUTH_COOKIE_NAME);

  if (pathname === '/auth') {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_AFTER_AUTH_PATH, request.url));
    }
    return NextResponse.next();
  }

  if (isProtectedPath(pathname) && !isLoggedIn) {
    const url = new URL('/auth', request.url);
    url.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|sw\\.js|manifest\\.webmanifest|assets|icons|favicon\\.ico|file\\.svg|globe\\.svg|next\\.svg|vercel\\.svg|window\\.svg).*)',
  ],
};
