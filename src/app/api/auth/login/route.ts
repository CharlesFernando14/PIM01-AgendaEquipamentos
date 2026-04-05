import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession, getSessionCookieConfig, roleDefaultRoute, type Role } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail ou senha incorretos.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'E-mail ou senha incorretos.' },
        { status: 401 }
      );
    }

    if (user.status === 'inativo') {
      return NextResponse.json(
        { error: 'Sua conta está desativada. Entre em contato com a administração da escola.' },
        { status: 403 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'E-mail ou senha incorretos.' },
        { status: 401 }
      );
    }

    const role = user.role as Role;
    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role,
      mustChangePassword: user.mustChangePassword,
    };

    const token = await createSession(authUser);
    const cookieConfig = getSessionCookieConfig(token);

    const redirectTo = user.mustChangePassword ? '/change-password' : roleDefaultRoute[role];

    const response = NextResponse.json({
      user: authUser,
      redirectTo,
    });

    response.cookies.set(cookieConfig);
    return response;
  } catch {
    return NextResponse.json(
      { error: 'Não foi possível conectar ao servidor. Tente novamente em instantes.' },
      { status: 500 }
    );
  }
}
