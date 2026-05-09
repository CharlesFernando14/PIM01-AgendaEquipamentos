'use client';

import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

interface Retirada {
  id: string;
  userId: string;
  equipamentoId: string;
  dataRetirada: string;
  dataDevolucao: string | null;
  status: string;
  user: { id: string; name: string | null; email: string };
  equipamento: { id: string; nome: string };
}

function formatDateTime(date: string) {
  const d = new Date(date);
  return `${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} — ${d.toLocaleDateString('pt-BR')}`;
}

const COLUMNS = [
  {
    key: 'AGUARDANDO_RETIRADA',
    title: 'Aguardando retirada',
    badge: { label: 'Aguardando', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
    emptyMessage: 'Nenhum equipamento aguardando retirada',
    action: { label: 'Retirar', nextStatus: 'EM_USO' },
  },
  {
    key: 'EM_USO',
    title: 'Em uso',
    badge: { label: 'Em uso', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
    emptyMessage: 'Nenhum equipamento em uso',
    action: { label: 'Devolver', nextStatus: 'DEVOLVIDO' },
  },
  {
    key: 'DEVOLVIDO',
    title: 'Devolvidos',
    badge: { label: 'Devolvido', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
    emptyMessage: 'Nenhuma devolução registrada',
    action: null,
  },
] as const;

export default function Retiradas() {
  const [retiradas, setRetiradas] = useState<Retirada[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'TECNICO';

  const fetchRetiradas = useCallback(async () => {
    try {
      const res = await fetch('/api/retiradas');
      if (res.ok) {
        const data = await res.json();
        setRetiradas(data.retiradas);
      }
    } catch {
      toast.error('Erro ao carregar retiradas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRetiradas();
  }, [fetchRetiradas]);

  const handleAction = async (retirada: Retirada, nextStatus: string) => {
    setActing(retirada.id);
    try {
      const res = await fetch(`/api/retiradas/${retirada.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        const messages: Record<string, string> = {
          EM_USO: 'Retirada confirmada!',
          DEVOLVIDO: 'Equipamento devolvido com sucesso!',
        };
        toast.success(messages[nextStatus] || 'Atualizado com sucesso!');
        fetchRetiradas();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erro ao atualizar.');
      }
    } catch {
      toast.error('Erro ao atualizar.');
    } finally {
      setActing(null);
    }
  };

  const canAct = (r: Retirada) => canEdit || (user?.role === 'PROFESSOR' && r.userId === user?.id);

  if (loading) {
    return (
      <AppLayout title="Retiradas & Devoluções" subtitle="Controle de retirada e devolução de equipamentos">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Retiradas & Devoluções"
      subtitle="Controle de retirada e devolução de equipamentos"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {COLUMNS.map((col) => {
          const items = retiradas.filter(r => r.status === col.key);
          return (
            <Card key={col.key} className="shadow-card hover:shadow-card-hover transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  {col.title} <span className="text-muted-foreground font-normal">({items.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-6">{col.emptyMessage}</p>
                ) : (
                  items.map(r => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-3 rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow bg-card"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{r.equipamento.nome}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {r.user.name || r.user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {col.key === 'DEVOLVIDO' && r.dataDevolucao
                            ? `${formatDateTime(r.dataRetirada)} → ${new Date(r.dataDevolucao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                            : formatDateTime(r.dataRetirada)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Badge className={col.badge.className}>{col.badge.label}</Badge>
                        {col.action && canAct(r) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 px-2"
                            disabled={acting === r.id}
                            onClick={() => handleAction(r, col.action!.nextStatus)}
                          >
                            {acting === r.id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : col.action.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
}
