import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export type Role = 'ADMIN' | 'PROFESSOR' | 'TECNICO';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'equipa-secret-key-change-in-production'
);

const COOKIE_NAME = 'equipa-session';
const SESSION_DURATION = 8 * 60 * 60; // 8 hours in seconds

export async function createSession(user: AuthUser): Promise<string> {
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${SESSION_DURATION}s`)
    .setIssuedAt()
    .sign(SECRET);

  return token;
}

export async function verifySession(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: (payload.name as string) || null,
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function getSessionCookieConfig(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_DURATION,
  };
}

export function getDeleteSessionCookieConfig() {
  return {
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };
}

// Role-based route access configuration per spec section 11
export const roleRouteAccess: Record<Role, string[]> = {
  ADMIN: ['/dashboard', '/equipamentos', '/agendamento', '/retiradas', '/historico', '/relatorios', '/usuarios', '/feedback'],
  PROFESSOR: ['/dashboard', '/equipamentos', '/agendamento', '/historico', '/feedback'],
  TECNICO: ['/dashboard', '/equipamentos', '/agendamento', '/retiradas', '/historico', '/feedback'],
};

// Default redirect after login per spec section 8.4
export const roleDefaultRoute: Record<Role, string> = {
  ADMIN: '/dashboard',
  PROFESSOR: '/agendamento',
  TECNICO: '/equipamentos',
};

export const COOKIE_NAME_EXPORT = COOKIE_NAME;
