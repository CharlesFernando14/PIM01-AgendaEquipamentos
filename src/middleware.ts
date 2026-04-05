import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'equipa-session';
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'equipa-secret-key-change-in-production'
);

const publicPaths = ['/login', '/api/auth/login', '/api/auth/logout'];

const roleRouteAccess: Record<string, string[]> = {
  ADMIN: ['/dashboard', '/equipamentos', '/agendamento', '/retiradas', '/historico', '/relatorios', '/usuarios', '/feedback'],
  PROFESSOR: ['/dashboard', '/equipamentos', '/agendamento', '/historico', '/feedback'],
  TECNICO: ['/dashboard', '/equipamentos', '/agendamento', '/retiradas', '/historico', '/feedback'],
};

const roleDefaultRoute: Record<string, string> = {
  ADMIN: '/dashboard',
  PROFESSOR: '/agendamento',
  TECNICO: '/equipamentos',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
  if (
    publicPaths.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  // No token — redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('expired', '1');
    }
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const role = payload.role as string;

    // Root path — redirect to role default
    if (pathname === '/') {
      return NextResponse.redirect(new URL(roleDefaultRoute[role] || '/dashboard', request.url));
    }

    // Check route access for the user's role
    const allowedRoutes = roleRouteAccess[role];
    if (allowedRoutes) {
      const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));
      if (!hasAccess) {
        // Redirect to their default route if they can't access this page
        return NextResponse.redirect(new URL(roleDefaultRoute[role] || '/dashboard', request.url));
      }
    }

    return NextResponse.next();
  } catch {
    // Invalid/expired token — redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('expired', '1');
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
