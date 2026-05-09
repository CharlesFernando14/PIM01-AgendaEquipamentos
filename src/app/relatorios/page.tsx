'use client';

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Download,
  Filter,
  BarChart3,
  Users,
  Monitor,
  CalendarDays,
  CalendarIcon,
  ClipboardList,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Agendamento {
  id: string;
  userId: string;
  equipamentoId: string;
  dataInicio: string;
  dataFim: string;
  status: string;
  observacoes: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  equipamento: { id: string; nome: string; tipo: string };
}

interface Retirada {
  id: string;
  userId: string;
  equipamentoId: string;
  dataRetirada: string;
  dataDevolucao: string | null;
  status: string;
  observacoes: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  equipamento: { id: string; nome: string; tipo: string };
}

interface Professor {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface EquipamentoItem {
  id: string;
  nome: string;
  tipo: string;
}

interface ByProfessor {
  id: string;
  nome: string;
  email: string;
  agendamentos: number;
  retiradas: number;
  total: number;
}

interface ByEquipamento {
  id: string;
  nome: string;
  tipo: string;
  agendamentos: number;
  retiradas: number;
  total: number;
}

interface Stats {
  totalAgendamentos: number;
  totalRetiradas: number;
  total: number;
  agendamentoStatusSummary: Record<string, number>;
  retiradaStatusSummary: Record<string, number>;
}

interface RelatorioData {
  agendamentos: Agendamento[];
  retiradas: Retirada[];
  professores: Professor[];
  equipamentos: EquipamentoItem[];
  stats: Stats;
  byProfessor: ByProfessor[];
  byEquipamento: ByEquipamento[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const agendamentoStatusConfig: Record<string, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  confirmado: { label: "Confirmado", className: "bg-blue-100 text-blue-700 border-blue-200" },
  concluido: { label: "Concluído", className: "bg-green-100 text-green-700 border-green-200" },
  cancelado: { label: "Cancelado", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

const retiradaStatusConfig: Record<string, { label: string; className: string }> = {
  AGUARDANDO_RETIRADA: { label: "Aguardando", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  EM_USO: { label: "Em uso", className: "bg-green-100 text-green-700 border-green-200" },
  RETIRADO: { label: "Retirado", className: "bg-blue-100 text-blue-700 border-blue-200" },
  DEVOLVIDO: { label: "Devolvido", className: "bg-gray-100 text-gray-600 border-gray-200" },
  CANCELADO: { label: "Cancelado", className: "bg-gray-100 text-gray-600 border-gray-200" },
  ativa: { label: "Ativa", className: "bg-blue-100 text-blue-700 border-blue-200" },
  devolvida: { label: "Devolvida", className: "bg-gray-100 text-gray-600 border-gray-200" },
  atrasada: { label: "Atrasada", className: "bg-red-100 text-red-700 border-red-200" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function userName(u: { name: string | null; email: string }) {
  return u.name || u.email;
}

// ─── CSV Export ───────────────────────────────────────────────────────────────

function exportCSV(rows: string[][], filename: string) {
  const content = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Relatorios() {
  const { user } = useAuth();
  const [data, setData] = useState<RelatorioData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filtroUsuario, setFiltroUsuario] = useState("todos");
  const [filtroEquipamento, setFiltroEquipamento] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroDataInicio, setFiltroDataInicio] = useState<Date | undefined>(undefined);
  const [filtroDataFim, setFiltroDataFim] = useState<Date | undefined>(undefined);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (filtroUsuario && filtroUsuario !== "todos") params.set("userId", filtroUsuario);
    if (filtroEquipamento && filtroEquipamento !== "todos") params.set("equipamentoId", filtroEquipamento);
    if (filtroTipo && filtroTipo !== "todos") params.set("tipo", filtroTipo);
    if (filtroStatus && filtroStatus !== "todos") params.set("status", filtroStatus);
    if (filtroDataInicio) params.set("dataInicio", format(filtroDataInicio, "yyyy-MM-dd"));
    if (filtroDataFim) params.set("dataFim", format(filtroDataFim, "yyyy-MM-dd"));
    return params.toString();
  }, [filtroUsuario, filtroEquipamento, filtroTipo, filtroStatus, filtroDataInicio, filtroDataFim]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const qs = buildQuery();
      const res = await fetch(`/api/relatorios${qs ? `?${qs}` : ""}`);
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Erro ao carregar relatórios.");
        return;
      }
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Erro ao carregar relatórios.");
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleClearFilters = () => {
    setFiltroUsuario("todos");
    setFiltroEquipamento("todos");
    setFiltroTipo("todos");
    setFiltroStatus("todos");
    setFiltroDataInicio(undefined);
    setFiltroDataFim(undefined);
  };

  const handleExportAgendamentos = () => {
    if (!data) return;
    const rows = [
      ["Professor", "E-mail", "Equipamento", "Tipo Equip.", "Início", "Fim", "Status", "Observações", "Criado em"],
      ...data.agendamentos.map((a) => [
        userName(a.user),
        a.user.email,
        a.equipamento.nome,
        a.equipamento.tipo,
        formatDateTime(a.dataInicio),
        formatDateTime(a.dataFim),
        agendamentoStatusConfig[a.status]?.label || a.status,
        a.observacoes || "",
        formatDate(a.createdAt),
      ]),
    ];
    exportCSV(rows, `relatorio-agendamentos-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportRetiradas = () => {
    if (!data) return;
    const rows = [
      ["Professor", "E-mail", "Equipamento", "Tipo Equip.", "Data Retirada", "Data Devolução", "Status", "Observações", "Criado em"],
      ...data.retiradas.map((r) => [
        userName(r.user),
        r.user.email,
        r.equipamento.nome,
        r.equipamento.tipo,
        formatDateTime(r.dataRetirada),
        r.dataDevolucao ? formatDateTime(r.dataDevolucao) : "—",
        retiradaStatusConfig[r.status]?.label || r.status,
        r.observacoes || "",
        formatDate(r.createdAt),
      ]),
    ];
    exportCSV(rows, `relatorio-retiradas-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportPorProfessor = () => {
    if (!data) return;
    const rows = [
      ["Professor", "E-mail", "Agendamentos", "Retiradas", "Total"],
      ...data.byProfessor.map((p) => [p.nome, p.email, String(p.agendamentos), String(p.retiradas), String(p.total)]),
    ];
    exportCSV(rows, `relatorio-professores-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportPorEquipamento = () => {
    if (!data) return;
    const rows = [
      ["Equipamento", "Tipo", "Agendamentos", "Retiradas", "Total"],
      ...data.byEquipamento.map((e) => [e.nome, e.tipo, String(e.agendamentos), String(e.retiradas), String(e.total)]),
    ];
    exportCSV(rows, `relatorio-equipamentos-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  if (user?.role === "PROFESSOR") {
    return (
      <AppLayout title="Relatórios" subtitle="Acesso restrito a administradores e técnicos">
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Relatórios"
      subtitle="Análise completa de agendamentos e retiradas de equipamentos"
      actions={
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      }
    >
      {/* ── Filters ── */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Tipo */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Tipo</Label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="agendamento">Agendamentos</SelectItem>
                  <SelectItem value="retirada">Retiradas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Professor */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Professor</Label>
              <Select value={filtroUsuario} onValueChange={setFiltroUsuario}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {data?.professores.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name || p.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Equipamento */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Equipamento</Label>
              <Select value={filtroEquipamento} onValueChange={setFiltroEquipamento}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {data?.equipamentos.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data início */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Data início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-9 w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className={filtroDataInicio ? undefined : "text-muted-foreground text-sm"}>
                      {filtroDataInicio ? format(filtroDataInicio, "dd/MM/yyyy") : "Selecionar"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filtroDataInicio}
                    onSelect={setFiltroDataInicio}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Data fim */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Data fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-9 w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className={filtroDataFim ? undefined : "text-muted-foreground text-sm"}>
                      {filtroDataFim ? format(filtroDataFim, "dd/MM/yyyy") : "Selecionar"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filtroDataFim}
                    onSelect={setFiltroDataFim}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Actions */}
            <div className="space-y-1 flex flex-col justify-end gap-2">
              <Button size="sm" onClick={fetchData} disabled={loading} className="h-9">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Filter className="h-4 w-4 mr-2" />}
                Filtrar
              </Button>
              <Button size="sm" variant="ghost" onClick={handleClearFilters} className="h-9 text-xs">
                Limpar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && !data ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !data ? null : (
        <>
          {/* ── Stats Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data.stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total de registros</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data.stats.totalAgendamentos}</p>
                    <p className="text-xs text-muted-foreground">Agendamentos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <ClipboardList className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data.stats.totalRetiradas}</p>
                    <p className="text-xs text-muted-foreground">Retiradas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data.byProfessor.length}</p>
                    <p className="text-xs text-muted-foreground">Professores ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Status Summary Row ── */}
          {(data.stats.totalAgendamentos > 0 || data.stats.totalRetiradas > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {data.stats.totalAgendamentos > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Status dos Agendamentos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {Object.entries(data.stats.agendamentoStatusSummary).map(([status, count]) => (
                      <div
                        key={status}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${agendamentoStatusConfig[status]?.className || "bg-gray-100 text-gray-600"}`}
                      >
                        <span>{agendamentoStatusConfig[status]?.label || status}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {data.stats.totalRetiradas > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <ClipboardList className="h-4 w-4" />
                      Status das Retiradas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {Object.entries(data.stats.retiradaStatusSummary).map(([status, count]) => (
                      <div
                        key={status}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${retiradaStatusConfig[status]?.className || "bg-gray-100 text-gray-600"}`}
                      >
                        <span>{retiradaStatusConfig[status]?.label || status}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ── Tabs ── */}
          <Tabs defaultValue="agendamentos">
            <TabsList className="mb-4">
              <TabsTrigger value="agendamentos" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Agendamentos
                <Badge variant="secondary" className="ml-1">{data.agendamentos.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="retiradas" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Retiradas
                <Badge variant="secondary" className="ml-1">{data.retiradas.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="por-professor" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Por Professor
              </TabsTrigger>
              <TabsTrigger value="por-equipamento" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Por Equipamento
              </TabsTrigger>
            </TabsList>

            {/* ── Tab: Agendamentos ── */}
            <TabsContent value="agendamentos">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-base">Histórico de Agendamentos</CardTitle>
                  <Button size="sm" variant="outline" onClick={handleExportAgendamentos} disabled={data.agendamentos.length === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {data.agendamentos.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">
                      Nenhum agendamento encontrado para os filtros selecionados.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Professor</TableHead>
                            <TableHead>Equipamento</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Início</TableHead>
                            <TableHead>Fim</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Observações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.agendamentos.map((a) => {
                            const sc = agendamentoStatusConfig[a.status];
                            return (
                              <TableRow key={a.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{userName(a.user)}</p>
                                    <p className="text-xs text-muted-foreground">{a.user.email}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">{a.equipamento.nome}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">{a.equipamento.tipo}</Badge>
                                </TableCell>
                                <TableCell className="whitespace-nowrap text-sm">{formatDateTime(a.dataInicio)}</TableCell>
                                <TableCell className="whitespace-nowrap text-sm">{formatDateTime(a.dataFim)}</TableCell>
                                <TableCell>
                                  <Badge className={`${sc?.className || "bg-gray-100 text-gray-600"} border text-xs`} variant="outline">
                                    {sc?.label || a.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                                  {a.observacoes || "—"}
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
            </TabsContent>

            {/* ── Tab: Retiradas ── */}
            <TabsContent value="retiradas">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-base">Histórico de Retiradas</CardTitle>
                  <Button size="sm" variant="outline" onClick={handleExportRetiradas} disabled={data.retiradas.length === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {data.retiradas.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">
                      Nenhuma retirada encontrada para os filtros selecionados.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Professor</TableHead>
                            <TableHead>Equipamento</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Retirada em</TableHead>
                            <TableHead>Devolução</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Observações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.retiradas.map((r) => {
                            const sc = retiradaStatusConfig[r.status];
                            return (
                              <TableRow key={r.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{userName(r.user)}</p>
                                    <p className="text-xs text-muted-foreground">{r.user.email}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">{r.equipamento.nome}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">{r.equipamento.tipo}</Badge>
                                </TableCell>
                                <TableCell className="whitespace-nowrap text-sm">{formatDateTime(r.dataRetirada)}</TableCell>
                                <TableCell className="whitespace-nowrap text-sm">
                                  {r.dataDevolucao ? formatDateTime(r.dataDevolucao) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge className={`${sc?.className || "bg-gray-100 text-gray-600"} border text-xs`} variant="outline">
                                    {sc?.label || r.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                                  {r.observacoes || "—"}
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
            </TabsContent>

            {/* ── Tab: Por Professor ── */}
            <TabsContent value="por-professor">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-base">Uso por Professor</CardTitle>
                  <Button size="sm" variant="outline" onClick={handleExportPorProfessor} disabled={data.byProfessor.length === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {data.byProfessor.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">Nenhum dado disponível.</p>
                  ) : (
                    <>
                      {/* Bar chart visual */}
                      <div className="px-6 py-4 space-y-3">
                        {data.byProfessor.map((p) => {
                          const maxTotal = data.byProfessor[0]?.total || 1;
                          const pct = Math.round((p.total / maxTotal) * 100);
                          return (
                            <div key={p.id} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <div>
                                  <span className="font-medium">{p.nome}</span>
                                  <span className="text-muted-foreground ml-2 text-xs">{p.email}</span>
                                </div>
                                <span className="font-semibold text-primary">{p.total}</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <div className="flex gap-3 text-xs text-muted-foreground">
                                <span>{p.agendamentos} agendamento{p.agendamentos !== 1 ? "s" : ""}</span>
                                <span>·</span>
                                <span>{p.retiradas} retirada{p.retiradas !== 1 ? "s" : ""}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <Separator />
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>#</TableHead>
                              <TableHead>Professor</TableHead>
                              <TableHead className="text-center">Agendamentos</TableHead>
                              <TableHead className="text-center">Retiradas</TableHead>
                              <TableHead className="text-center">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.byProfessor.map((p, i) => (
                              <TableRow key={p.id}>
                                <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{p.nome}</p>
                                    <p className="text-xs text-muted-foreground">{p.email}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{p.agendamentos}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">{p.retiradas}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold">{p.total}</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Tab: Por Equipamento ── */}
            <TabsContent value="por-equipamento">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-base">Uso por Equipamento</CardTitle>
                  <Button size="sm" variant="outline" onClick={handleExportPorEquipamento} disabled={data.byEquipamento.length === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {data.byEquipamento.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">Nenhum dado disponível.</p>
                  ) : (
                    <>
                      {/* Bar chart visual */}
                      <div className="px-6 py-4 space-y-3">
                        {data.byEquipamento.map((e) => {
                          const maxTotal = data.byEquipamento[0]?.total || 1;
                          const pct = Math.round((e.total / maxTotal) * 100);
                          return (
                            <div key={e.id} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{e.nome}</span>
                                  <Badge variant="outline" className="text-xs">{e.tipo}</Badge>
                                </div>
                                <span className="font-semibold text-primary">{e.total}</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-orange-500 rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <div className="flex gap-3 text-xs text-muted-foreground">
                                <span>{e.agendamentos} agendamento{e.agendamentos !== 1 ? "s" : ""}</span>
                                <span>·</span>
                                <span>{e.retiradas} retirada{e.retiradas !== 1 ? "s" : ""}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <Separator />
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>#</TableHead>
                              <TableHead>Equipamento</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead className="text-center">Agendamentos</TableHead>
                              <TableHead className="text-center">Retiradas</TableHead>
                              <TableHead className="text-center">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.byEquipamento.map((e, i) => (
                              <TableRow key={e.id}>
                                <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                                <TableCell className="font-medium">{e.nome}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">{e.tipo}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{e.agendamentos}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">{e.retiradas}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold">{e.total}</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </AppLayout>
  );
}
