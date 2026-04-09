import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status é obrigatório.' }, { status: 400 });
    }

    const agendamento = await prisma.agendamento.findUnique({ where: { id } });
    if (!agendamento) {
      return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });
    }

    // Only the owner or ADMIN/TECNICO can update
    if (agendamento.userId !== session.id && session.role === 'PROFESSOR') {
      return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 });
    }

    const updated = await prisma.agendamento.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        equipamento: { select: { id: true, nome: true, tipo: true } },
      },
    });

    return NextResponse.json({ agendamento: updated });
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar agendamento.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const agendamento = await prisma.agendamento.findUnique({ where: { id } });
    if (!agendamento) {
      return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });
    }

    if (agendamento.userId !== session.id && session.role === 'PROFESSOR') {
      return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 });
    }

    await prisma.agendamento.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao excluir agendamento.' }, { status: 500 });
  }
}
