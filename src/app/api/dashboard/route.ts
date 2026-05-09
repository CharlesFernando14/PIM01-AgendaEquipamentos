import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  const [
    totalEquipamentos,
    reservasHoje,
    reservasPendentesHoje,
    retiradaEmUso,
    retiradaAguardando,
    totalUsuariosAtivos,
    totalUsuarios,
    recentesAgendamentos,
    equipamentosMaisUsados,
  ] = await Promise.all([
    prisma.equipamento.count(),

    prisma.agendamento.count({
      where: {
        dataInicio: { gte: startOfDay, lte: endOfDay },
        status: { not: 'cancelado' },
      },
    }),

    prisma.agendamento.count({
      where: {
        dataInicio: { gte: startOfDay, lte: endOfDay },
        status: 'pendente',
      },
    }),

    prisma.retirada.count({ where: { status: 'EM_USO' } }),

    prisma.retirada.count({ where: { status: 'AGUARDANDO_RETIRADA' } }),

    prisma.user.count({ where: { status: 'ativo' } }),

    prisma.user.count(),

    prisma.agendamento.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        equipamento: { select: { nome: true } },
      },
    }),

    prisma.retirada.groupBy({
      by: ['equipamentoId'],
      _count: { equipamentoId: true },
      orderBy: { _count: { equipamentoId: 'desc' } },
      take: 5,
    }),
  ]);

  // Fetch equipment names for top used
  const equipIds = equipamentosMaisUsados.map(e => e.equipamentoId);
  const equipamentos = await prisma.equipamento.findMany({
    where: { id: { in: equipIds } },
    select: { id: true, nome: true },
  });
  const equipMap = Object.fromEntries(equipamentos.map(e => [e.id, e.nome]));

  const maxUso = equipamentosMaisUsados[0]?._count.equipamentoId || 1;
  const topEquipamentos = equipamentosMaisUsados.map(e => ({
    nome: equipMap[e.equipamentoId] || 'Desconhecido',
    count: e._count.equipamentoId,
    pct: Math.round((e._count.equipamentoId / maxUso) * 100),
  }));

  return NextResponse.json({
    stats: {
      totalEquipamentos,
      reservasHoje,
      reservasPendentesHoje,
      devolucoesPendentes: retiradaEmUso + retiradaAguardando,
      totalUsuariosAtivos,
      totalUsuarios,
    },
    recentesAgendamentos: recentesAgendamentos.map(a => ({
      id: a.id,
      usuario: a.user.name || a.user.email,
      equipamento: a.equipamento.nome,
      dataInicio: a.dataInicio,
      status: a.status,
    })),
    topEquipamentos,
  });
}
