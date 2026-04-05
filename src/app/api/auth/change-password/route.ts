import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSessionUser, createSession, getSessionCookieConfig } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    const { newPassword } = await request.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: session.id },
      data: { password: hashedPassword, mustChangePassword: false },
    });

    // Issue a new token with mustChangePassword = false so middleware stops redirecting
    const newToken = await createSession({ ...session, mustChangePassword: false });
    const cookieConfig = getSessionCookieConfig(newToken);

    const response = NextResponse.json({ success: true });
    response.cookies.set(cookieConfig);
    return response;
  } catch {
    return NextResponse.json({ error: 'Erro ao alterar senha.' }, { status: 500 });
  }
}
