import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const equipamentos = await prisma.equipamento.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ equipamentos });
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  if (session.role === 'PROFESSOR') {
    return NextResponse.json({ error: 'Sem permissão para cadastrar equipamentos.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { nome, tipo, localizacao, quantidade, descricao } = body;

    if (!nome || !tipo) {
      return NextResponse.json({ error: 'Campos obrigatórios: nome e tipo.' }, { status: 400 });
    }

    const equipamento = await prisma.equipamento.create({
      data: {
        nome,
        tipo,
        localizacao: localizacao || null,
        quantidade: quantidade ?? 1,
        descricao: descricao || null,
        status: 'disponivel',
      },
    });

    return NextResponse.json({ equipamento }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao cadastrar equipamento.' }, { status: 500 });
  }
}
