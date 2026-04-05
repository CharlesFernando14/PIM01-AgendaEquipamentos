import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

const DEFAULT_PASSWORD = '123456';

export async function GET() {
  const session = await getSessionUser();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, status: true, mustChangePassword: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, email, role, status } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Campos obrigatórios: nome, e-mail e perfil.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return NextResponse.json({ error: 'Já existe um usuário com este e-mail.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role,
        status: status || 'ativo',
        mustChangePassword: true,
      },
      select: { id: true, name: true, email: true, role: true, status: true, mustChangePassword: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao criar usuário.' }, { status: 500 });
  }
}
