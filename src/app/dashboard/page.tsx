'use client';

import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { Monitor, CalendarCheck, AlertTriangle, Users, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Stats {
  totalEquipamentos: number;
  reservasHoje: number;
  reservasPendentesHoje: number;
  devolucoesPendentes: number;
  totalUsuariosAtivos: number;
  totalUsuarios: number;
}

interface RecentAgendamento {
  id: string;
  usuario: string;
  equipamento: string;
  dataInicio: string;
  status: string;
}

interface TopEquipamento {
  nome: string;
  count: number;
  pct: number;
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  confirmado: "default",
  pendente: "secondary",
  cancelado: "destructive",
};

const statusLabel: Record<string, string> = {
  confirmado: "Confirmado",
  pendente: "Pendente",
  cancelado: "Cancelado",
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentes, setRecentes] = useState<RecentAgendamento[]>([]);
  const [topEquipamentos, setTopEquipamentos] = useState<TopEquipamento[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentes(data.recentesAgendamentos);
        setTopEquipamentos(data.topEquipamentos);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <AppLayout title="Painel de Controle" subtitle="Visao geral do sistema de equipamentos">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Painel de Controle" subtitle="Visao geral do sistema de equipamentos">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total de Equipamentos" value={stats?.totalEquipamentos ?? 0} icon={Monitor} variant="primary" />
        <StatCard title="Reservas Hoje" value={stats?.reservasHoje ?? 0} icon={CalendarCheck} variant="success" trend={String(stats?.reservasPendentesHoje ?? 0) + ' pendentes'} />
        <StatCard title="Devolucoes Pendentes" value={stats?.devolucoesPendentes ?? 0} icon={AlertTriangle} variant="warning" />
        <StatCard title="Usuarios Ativos" value={stats?.totalUsuariosAtivos ?? 0} icon={Users} variant="default" trend={'de ' + String(stats?.totalUsuarios ?? 0) + ' cadastrados'} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reservas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhuma reserva registrada.</p>
            ) : (
              <div className="space-y-3">
                {recentes.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.usuario}</p>
                      <p className="text-xs text-muted-foreground">{r.equipamento} - {new Date(r.dataInicio).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <Badge variant={statusVariant[r.status] ?? 'outline'}>{statusLabel[r.status] ?? r.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Equipamentos Mais Utilizados</CardTitle>
          </CardHeader>
          <CardContent>
            {topEquipamentos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhuma retirada registrada.</p>
            ) : (
              <div className="space-y-4">
                {topEquipamentos.map((item) => (
                  <div key={item.nome}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{item.nome}</span>
                      <span className="text-muted-foreground">{item.count}x</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: item.pct + '%' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
