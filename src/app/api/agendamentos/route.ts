import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  const where: Record<string, unknown> = {};
  if (date) {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);
    where.dataInicio = { gte: start, lte: end };
  }

  const agendamentos = await prisma.agendamento.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      equipamento: { select: { id: true, nome: true, tipo: true } },
    },
    orderBy: { dataInicio: 'asc' },
  });

  return NextResponse.json({ agendamentos });
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { equipamentoId, dataInicio, dataFim, observacoes, userId } = body;

    if (!equipamentoId || !dataInicio || !dataFim) {
      return NextResponse.json({ error: 'Campos obrigatórios: equipamento, data início e data fim.' }, { status: 400 });
    }

    // Admin/Técnico can assign to other users; Professors can only create for themselves
    let targetUserId = session.id;
    if (userId && userId !== session.id) {
      if (session.role === 'PROFESSOR') {
        return NextResponse.json({ error: 'Sem permissão para atribuir agendamentos a outros usuários.' }, { status: 403 });
      }
      targetUserId = userId;
    }

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    if (fim <= inicio) {
      return NextResponse.json({ error: 'O horário de término deve ser após o de início.' }, { status: 400 });
    }

    // Check for conflicts
    const conflict = await prisma.agendamento.findFirst({
      where: {
        equipamentoId,
        status: { not: 'cancelado' },
        dataInicio: { lt: fim },
        dataFim: { gt: inicio },
      },
    });

    if (conflict) {
      return NextResponse.json({ error: 'Conflito de horário! Este equipamento já está reservado neste período.' }, { status: 409 });
    }

    const agendamento = await prisma.agendamento.create({
      data: {
        userId: targetUserId,
        equipamentoId,
        dataInicio: inicio,
        dataFim: fim,
        observacoes: observacoes || null,
        status: 'pendente',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        equipamento: { select: { id: true, nome: true, tipo: true } },
      },
    });

    return NextResponse.json({ agendamento }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao criar agendamento.' }, { status: 500 });
  }
}
