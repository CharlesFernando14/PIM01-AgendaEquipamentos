'use client';

import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Movimentacao {
  id: string;
  equipamento: string;
  professor: string;
  data: string;
  horario: string;
  finalidade: string;
  status: 'devolvido' | 'atrasado' | 'em_uso' | 'agendado';
  tipo: 'retirada' | 'agendamento';
}

const statusConfig: Record<string, { label: string; className: string }> = {
  devolvido: { label: "Devolvido", className: "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100" },
  atrasado: { label: "Atrasado", className: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100" },
  em_uso: { label: "Em uso", className: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100" },
  agendado: { label: "Agendado", className: "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100" },
};

export default function Historico() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchMovimentacoes = useCallback(async () => {
    try {
      const res = await fetch('/api/historico');
      if (res.ok) {
        const data = await res.json();
        setMovimentacoes(data.movimentacoes);
      }
    } catch {
      toast.error("Erro ao carregar histórico.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMovimentacoes(); }, [fetchMovimentacoes]);

  const filtered = search
    ? movimentacoes.filter(
        (m) =>
          m.equipamento.toLowerCase().includes(search.toLowerCase()) ||
          m.professor.toLowerCase().includes(search.toLowerCase()) ||
          m.finalidade.toLowerCase().includes(search.toLowerCase())
      )
    : movimentacoes;

  return (
    <AppLayout
      title="Histórico de Uso"
      subtitle="Registro de todas as movimentações de equipamentos"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Movimentações</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {search ? "Nenhuma movimentação encontrada." : "Nenhuma movimentação registrada."}
            </div>
          ) : (
            <div className="overflow-auto max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Professor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Finalidade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((mov) => {
                    const st = statusConfig[mov.status] || statusConfig.devolvido;
                    return (
                      <TableRow key={`${mov.tipo}-${mov.id}`}>
                        <TableCell className="font-medium">{mov.equipamento}</TableCell>
                        <TableCell className="text-muted-foreground">{mov.professor}</TableCell>
                        <TableCell>{mov.data}</TableCell>
                        <TableCell>{mov.horario}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{mov.finalidade}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={st.className}>
                            {st.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
