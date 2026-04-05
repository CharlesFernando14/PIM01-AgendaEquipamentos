import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, role, status } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Campos obrigatórios: nome, e-mail e perfil.' }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { email: email.toLowerCase().trim(), NOT: { id } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Já existe outro usuário com este e-mail.' }, { status: 409 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { name, email: email.toLowerCase().trim(), role, status },
      select: { id: true, name: true, email: true, role: true, status: true, mustChangePassword: true },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar usuário.' }, { status: 500 });
  }
}
