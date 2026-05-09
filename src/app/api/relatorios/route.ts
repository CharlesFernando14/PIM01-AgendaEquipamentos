import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  if (session.role === 'PROFESSOR') {
    return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || '';
  const equipamentoId = searchParams.get('equipamentoId') || '';
  const dataInicio = searchParams.get('dataInicio') || '';
  const dataFim = searchParams.get('dataFim') || '';
  const statusFiltro = searchParams.get('status') || '';
  const tipo = searchParams.get('tipo') || 'todos'; // agendamento | retirada | todos

  // Build date range
  const dateFrom = dataInicio ? new Date(`${dataInicio}T00:00:00`) : undefined;
  const dateTo = dataFim ? new Date(`${dataFim}T23:59:59`) : undefined;

  // ─── Agendamentos ───────────────────────────────────────────────────────────
  let agendamentos: {
    id: string;
    userId: string;
    equipamentoId: string;
    dataInicio: Date;
    dataFim: Date;
    status: string;
    observacoes: string | null;
    createdAt: Date;
    user: { id: string; name: string | null; email: string };
    equipamento: { id: string; nome: string; tipo: string };
  }[] = [];

  if (tipo === 'todos' || tipo === 'agendamento') {
    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (equipamentoId) where.equipamentoId = equipamentoId;
    if (statusFiltro) where.status = statusFiltro;
    if (dateFrom || dateTo) {
      where.dataInicio = {};
      if (dateFrom) (where.dataInicio as Record<string, Date>).gte = dateFrom;
      if (dateTo) (where.dataInicio as Record<string, Date>).lte = dateTo;
    }

    agendamentos = await prisma.agendamento.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        equipamento: { select: { id: true, nome: true, tipo: true } },
      },
      orderBy: { dataInicio: 'desc' },
    });
  }

  // ─── Retiradas ──────────────────────────────────────────────────────────────
  let retiradas: {
    id: string;
    userId: string;
    equipamentoId: string;
    dataRetirada: Date;
    dataDevolucao: Date | null;
    status: string;
    observacoes: string | null;
    createdAt: Date;
    user: { id: string; name: string | null; email: string };
    equipamento: { id: string; nome: string; tipo: string };
  }[] = [];

  if (tipo === 'todos' || tipo === 'retirada') {
    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (equipamentoId) where.equipamentoId = equipamentoId;
    if (statusFiltro) where.status = statusFiltro;
    if (dateFrom || dateTo) {
      where.dataRetirada = {};
      if (dateFrom) (where.dataRetirada as Record<string, Date>).gte = dateFrom;
      if (dateTo) (where.dataRetirada as Record<string, Date>).lte = dateTo;
    }

    retiradas = await prisma.retirada.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        equipamento: { select: { id: true, nome: true, tipo: true } },
      },
      orderBy: { dataRetirada: 'desc' },
    });
  }

  // ─── Lookup lists ───────────────────────────────────────────────────────────
  const [professores, equipamentos] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      where: { status: 'ativo' },
      orderBy: { name: 'asc' },
    }),
    prisma.equipamento.findMany({
      select: { id: true, nome: true, tipo: true },
      orderBy: { nome: 'asc' },
    }),
  ]);

  // ─── Summary stats ──────────────────────────────────────────────────────────
  // By professor: count agendamentos + retiradas
  const byProfessor: Record<string, { id: string; nome: string; email: string; agendamentos: number; retiradas: number; total: number }> = {};

  for (const a of agendamentos) {
    const key = a.userId;
    if (!byProfessor[key]) {
      byProfessor[key] = { id: a.user.id, nome: a.user.name || a.user.email, email: a.user.email, agendamentos: 0, retiradas: 0, total: 0 };
    }
    byProfessor[key].agendamentos++;
    byProfessor[key].total++;
  }
  for (const r of retiradas) {
    const key = r.userId;
    if (!byProfessor[key]) {
      byProfessor[key] = { id: r.user.id, nome: r.user.name || r.user.email, email: r.user.email, agendamentos: 0, retiradas: 0, total: 0 };
    }
    byProfessor[key].retiradas++;
    byProfessor[key].total++;
  }

  // By equipamento: count agendamentos + retiradas
  const byEquipamento: Record<string, { id: string; nome: string; tipo: string; agendamentos: number; retiradas: number; total: number }> = {};

  for (const a of agendamentos) {
    const key = a.equipamentoId;
    if (!byEquipamento[key]) {
      byEquipamento[key] = { id: a.equipamento.id, nome: a.equipamento.nome, tipo: a.equipamento.tipo, agendamentos: 0, retiradas: 0, total: 0 };
    }
    byEquipamento[key].agendamentos++;
    byEquipamento[key].total++;
  }
  for (const r of retiradas) {
    const key = r.equipamentoId;
    if (!byEquipamento[key]) {
      byEquipamento[key] = { id: r.equipamento.id, nome: r.equipamento.nome, tipo: r.equipamento.tipo, agendamentos: 0, retiradas: 0, total: 0 };
    }
    byEquipamento[key].retiradas++;
    byEquipamento[key].total++;
  }

  // Status summary for agendamentos
  const agendamentoStatusSummary: Record<string, number> = {};
  for (const a of agendamentos) {
    agendamentoStatusSummary[a.status] = (agendamentoStatusSummary[a.status] || 0) + 1;
  }

  // Status summary for retiradas
  const retiradaStatusSummary: Record<string, number> = {};
  for (const r of retiradas) {
    retiradaStatusSummary[r.status] = (retiradaStatusSummary[r.status] || 0) + 1;
  }

  return NextResponse.json({
    agendamentos,
    retiradas,
    professores,
    equipamentos,
    stats: {
      totalAgendamentos: agendamentos.length,
      totalRetiradas: retiradas.length,
      total: agendamentos.length + retiradas.length,
      agendamentoStatusSummary,
      retiradaStatusSummary,
    },
    byProfessor: Object.values(byProfessor).sort((a, b) => b.total - a.total),
    byEquipamento: Object.values(byEquipamento).sort((a, b) => b.total - a.total),
  });
}
