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

    // Bloquear cancelamento se já existe retirada ativa (EM_USO ou DEVOLVIDO)
    if (status === 'cancelado') {
      const retiradaAtiva = await prisma.retirada.findFirst({
        where: { id: `ag-${id}`, status: { in: ['EM_USO', 'DEVOLVIDO'] } },
      });
      if (retiradaAtiva) {
        return NextResponse.json(
          { error: 'Não é possível cancelar: o equipamento já foi retirado.' },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.agendamento.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        equipamento: { select: { id: true, nome: true, tipo: true } },
      },
    });

    // Ao confirmar agendamento, criar retirada automaticamente
    if (status === 'confirmado') {
      await prisma.retirada.upsert({
        where: { id: `ag-${id}` },
        create: {
          id: `ag-${id}`,
          userId: agendamento.userId,
          equipamentoId: agendamento.equipamentoId,
          dataRetirada: agendamento.dataInicio,
          status: 'AGUARDANDO_RETIRADA',
        },
        update: {},
      });
    }

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
