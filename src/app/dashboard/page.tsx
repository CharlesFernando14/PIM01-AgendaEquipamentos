'use client';

import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { Monitor, CalendarCheck, AlertTriangle, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const recentReservations = [
  { id: 1, professor: "Maria Silva", equipment: "Projetor Sala 1", date: "28/03/2026", status: "ativo" },
  { id: 2, professor: "João Santos", equipment: "Chromebook Kit A", date: "28/03/2026", status: "pendente" },
  { id: 3, professor: "Ana Costa", equipment: "Tablet Kit B", date: "27/03/2026", status: "devolvido" },
  { id: 4, professor: "Carlos Lima", equipment: "Projetor Sala 3", date: "27/03/2026", status: "atrasado" },
];

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ativo: "default",
  pendente: "secondary",
  devolvido: "outline",
  atrasado: "destructive",
};

const statusLabel: Record<string, string> = {
  ativo: "Em uso",
  pendente: "Pendente",
  devolvido: "Devolvido",
  atrasado: "Atrasado",
};

export default function Dashboard() {
  return (
    <AppLayout title="Painel de Controle" subtitle="Visão geral do sistema de equipamentos">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total de Equipamentos" value={24} icon={Monitor} variant="primary" trend="+2 este mês" />
        <StatCard title="Reservas Hoje" value={8} icon={CalendarCheck} variant="success" trend="3 pendentes" />
        <StatCard title="Devoluções Pendentes" value={3} icon={AlertTriangle} variant="warning" trend="1 atrasada" />
        <StatCard title="Professores Ativos" value={15} icon={Users} variant="default" trend="de 22 cadastrados" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reservas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReservations.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.professor}</p>
                    <p className="text-xs text-muted-foreground">{r.equipment} • {r.date}</p>
                  </div>
                  <Badge variant={statusVariant[r.status]}>{statusLabel[r.status]}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Equipamentos Mais Utilizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Projetor Sala 1", usage: 85 },
                { name: "Chromebook Kit A", usage: 72 },
                { name: "Tablet Kit B", usage: 58 },
                { name: "Caixa de Som", usage: 45 },
                { name: "Notebook Lab", usage: 38 },
              ].map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{item.name}</span>
                    <span className="text-muted-foreground">{item.usage}%</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${item.usage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
