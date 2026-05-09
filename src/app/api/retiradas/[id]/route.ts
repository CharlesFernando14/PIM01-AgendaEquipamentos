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

    const retirada = await prisma.retirada.findUnique({ where: { id } });
    if (!retirada) {
      return NextResponse.json({ error: 'Retirada não encontrada.' }, { status: 404 });
    }

    if (session.role === 'PROFESSOR' && retirada.userId !== session.id) {
      return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 });
    }

    const updateData: Record<string, unknown> = { status: body.status };
    if (body.status === 'EM_USO') {
      updateData.dataRetirada = new Date();
    }
    if (body.status === 'DEVOLVIDO') {
      updateData.dataDevolucao = new Date();
    }

    const updated = await prisma.retirada.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        equipamento: { select: { id: true, nome: true } },
      },
    });

    return NextResponse.json({ retirada: updated });
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar retirada.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  if (session.role === 'PROFESSOR') {
    return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.retirada.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao excluir retirada.' }, { status: 500 });
  }
}
