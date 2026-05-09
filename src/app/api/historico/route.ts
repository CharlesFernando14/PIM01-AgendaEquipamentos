import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';

  const retiradas = await prisma.retirada.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      equipamento: { select: { id: true, nome: true, tipo: true } },
    },
    orderBy: { dataRetirada: 'desc' },
  });

  const agendamentos = await prisma.agendamento.findMany({
    where: {
      status: { in: ['confirmado', 'concluido', 'cancelado', 'pendente'] },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      equipamento: { select: { id: true, nome: true, tipo: true } },
    },
    orderBy: { dataInicio: 'desc' },
  });

  type Movimentacao = {
    id: string;
    equipamento: string;
    professor: string;
    data: string;
    horario: string;
    finalidade: string;
    status: 'devolvido' | 'atrasado' | 'em_uso' | 'agendado';
    tipo: 'retirada' | 'agendamento';
  };

  const movimentacoes: Movimentacao[] = [];

  for (const r of retiradas) {
    const dataRetirada = new Date(r.dataRetirada);
    let status: Movimentacao['status'] = 'em_uso';
    if (r.status === 'devolvida' || r.dataDevolucao) {
      status = 'devolvido';
    } else if (r.dataDevolucao === null && r.status === 'atrasada') {
      status = 'atrasado';
    } else if (r.status === 'ativa') {
      // Check if overdue (more than 24h without return)
      const now = new Date();
      const diff = now.getTime() - dataRetirada.getTime();
      if (diff > 24 * 60 * 60 * 1000) {
        status = 'atrasado';
      } else {
        status = 'em_uso';
      }
    }

    movimentacoes.push({
      id: r.id,
      equipamento: r.equipamento.nome,
      professor: r.user.name || r.user.email,
      data: dataRetirada.toLocaleDateString('pt-BR'),
      horario: dataRetirada.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      finalidade: r.observacoes || 'Uso em sala',
      status,
      tipo: 'retirada',
    });
  }

  for (const a of agendamentos) {
    const dataInicio = new Date(a.dataInicio);
    let status: Movimentacao['status'] = 'agendado';
    if (a.status === 'concluido') {
      status = 'devolvido';
    } else if (a.status === 'cancelado') {
      continue; // skip cancelled
    } else {
      const now = new Date();
      if (new Date(a.dataFim) < now && a.status !== 'concluido') {
        status = 'atrasado';
      } else {
        status = 'agendado';
      }
    }

    movimentacoes.push({
      id: a.id,
      equipamento: a.equipamento.nome,
      professor: a.user.name || a.user.email,
      data: dataInicio.toLocaleDateString('pt-BR'),
      horario: dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      finalidade: a.observacoes || 'Agendamento',
      status,
      tipo: 'agendamento',
    });
  }

  // Sort by date descending
  movimentacoes.sort((a, b) => {
    const dateA = a.data.split('/').reverse().join('-');
    const dateB = b.data.split('/').reverse().join('-');
    return dateB.localeCompare(dateA) || b.horario.localeCompare(a.horario);
  });

  // Filter by search
  const filtered = search
    ? movimentacoes.filter(
        (m) =>
          m.equipamento.toLowerCase().includes(search) ||
          m.professor.toLowerCase().includes(search) ||
          m.finalidade.toLowerCase().includes(search)
      )
    : movimentacoes;

  return NextResponse.json({ movimentacoes: filtered });
}
