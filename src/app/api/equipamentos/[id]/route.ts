import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  if (session.role === 'PROFESSOR') {
    return NextResponse.json({ error: 'Sem permissão para editar equipamentos.' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { nome, tipo, localizacao, quantidade, descricao, status } = body;

    if (!nome || !tipo) {
      return NextResponse.json({ error: 'Campos obrigatórios: nome e tipo.' }, { status: 400 });
    }

    const equipamento = await prisma.equipamento.update({
      where: { id },
      data: {
        nome,
        tipo,
        localizacao: localizacao || null,
        quantidade: quantidade ?? 1,
        descricao: descricao || null,
        status: status || undefined,
      },
    });

    return NextResponse.json({ equipamento });
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar equipamento.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  if (session.role === 'PROFESSOR') {
    return NextResponse.json({ error: 'Sem permissão para excluir equipamentos.' }, { status: 403 });
  }

  try {
    const { id } = await params;

    await prisma.equipamento.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao excluir equipamento.' }, { status: 500 });
  }
}
