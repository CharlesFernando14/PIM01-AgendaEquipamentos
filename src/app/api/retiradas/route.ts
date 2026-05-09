import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const where = session.role === 'PROFESSOR' ? { userId: session.id } : {};

  const retiradas = await prisma.retirada.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      equipamento: { select: { id: true, nome: true } },
    },
  });

  return NextResponse.json({ retiradas });
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  if (session.role === 'PROFESSOR') {
    return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { equipamentoId, userId, observacoes } = body;

    if (!equipamentoId || !userId) {
      return NextResponse.json({ error: 'Equipamento e usuário são obrigatórios.' }, { status: 400 });
    }

    const retirada = await prisma.retirada.create({
      data: {
        equipamentoId,
        userId,
        dataRetirada: new Date(),
        status: 'EM_USO',
        observacoes: observacoes || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        equipamento: { select: { id: true, nome: true } },
      },
    });

    return NextResponse.json({ retirada }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao criar retirada.' }, { status: 500 });
  }
}
