import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const feedbacks = await prisma.feedback.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      equipamento: { select: { id: true, nome: true } },
    },
  });

  return NextResponse.json({ feedbacks });
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { equipamentoId, rating, mensagem } = body;

    if (!equipamentoId) {
      return NextResponse.json({ error: 'Selecione um equipamento.' }, { status: 400 });
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Informe uma avaliação de 1 a 5 estrelas.' }, { status: 400 });
    }
    if (!mensagem || !String(mensagem).trim()) {
      return NextResponse.json({ error: 'Informe um comentário.' }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: session.id,
        equipamentoId,
        rating: Number(rating),
        mensagem: String(mensagem).trim(),
        tipo: 'equipamento',
        status: 'novo',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        equipamento: { select: { id: true, nome: true } },
      },
    });

    return NextResponse.json({ feedback }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao enviar feedback.' }, { status: 500 });
  }
}
