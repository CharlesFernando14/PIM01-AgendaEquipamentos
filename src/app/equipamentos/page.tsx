'use client';

import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Search, Monitor, Tablet, Speaker, Laptop, Edit2, Trash2, Loader2, AlertCircle, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

interface Equipamento {
  id: string;
  nome: string;
  tipo: string;
  localizacao: string | null;
  status: string;
  quantidade: number;
  descricao: string | null;
}

const iconMap: Record<string, React.ElementType> = {
  projetor: Monitor,
  tablet: Tablet,
  som: Speaker,
  notebook: Laptop,
  chromebook: Laptop,
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  disponivel: { label: "Disponivel", variant: "default" },
  em_uso: { label: "Em uso", variant: "secondary" },
  manutencao: { label: "Manutencao", variant: "destructive" },
};

const TIPOS_PREDEFINIDOS = ["projetor", "chromebook", "tablet", "notebook", "som"];

const TIPO_LABELS: Record<string, string> = {
  projetor: "Projetor",
  chromebook: "Chromebook",
  tablet: "Tablet",
  notebook: "Notebook",
  som: "Caixa de Som",
};

function tipoLabel(tipo: string) {
  return TIPO_LABELS[tipo] || tipo.charAt(0).toUpperCase() + tipo.slice(1);
}
const emptyForm = { nome: "", tipo: "", localizacao: "", quantidade: 1, status: "disponivel", descricao: "" };

export default function Equipamentos() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tipoCustom, setTipoCustom] = useState("");
  const [filtroSala, setFiltroSala] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [ordenacao, setOrdenacao] = useState<"nome_asc" | "nome_desc" | "padrao">("padrao");
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'TECNICO';

  // Merge predefined + any custom types found in loaded equipamentos
  const todosOsTipos = [
    ...TIPOS_PREDEFINIDOS,
    ...equipamentos
      .map((e) => e.tipo)
      .filter((t) => !TIPOS_PREDEFINIDOS.includes(t)),
  ].filter((v, i, arr) => arr.indexOf(v) === i).sort((a, b) => tipoLabel(a).localeCompare(tipoLabel(b), "pt-BR"));

  const fetchEquipamentos = useCallback(async () => {
    try {
      const res = await fetch('/api/equipamentos');
      if (res.ok) {
        const data = await res.json();
        setEquipamentos(data.equipamentos);
      }
    } catch {
      toast.error("Erro ao carregar equipamentos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEquipamentos(); }, [fetchEquipamentos]);

  // Unique sala options derived from loaded equipment
  const todasAsSalas = [...new Set(
    equipamentos.map((e) => e.localizacao).filter(Boolean) as string[]
  )].sort((a, b) => a.localeCompare(b, "pt-BR"));

  const filtered = equipamentos
    .filter((e) => {
      const matchSearch =
        e.nome.toLowerCase().includes(search.toLowerCase()) ||
        (e.localizacao?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchSala = filtroSala ? e.localizacao === filtroSala : true;
      const matchStatus = filtroStatus !== "todos" ? e.status === filtroStatus : true;
      return matchSearch && matchSala && matchStatus;
    })
    .sort((a, b) => {
      if (ordenacao === "nome_asc") return a.nome.localeCompare(b.nome, "pt-BR");
      if (ordenacao === "nome_desc") return b.nome.localeCompare(a.nome, "pt-BR");
      return 0;
    });

  const handleOpenNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setTipoCustom("");
    setError("");
    setDialogOpen(true);
  };

  const handleOpenEdit = (eq: Equipamento) => {
    setEditingId(eq.id);
    const isCustom = !TIPOS_PREDEFINIDOS.includes(eq.tipo);
    setForm({
      nome: eq.nome,
      tipo: isCustom ? "outro" : eq.tipo,
      localizacao: eq.localizacao || "",
      quantidade: eq.quantidade,
      status: eq.status,
      descricao: eq.descricao || "",
    });
    setTipoCustom(isCustom ? eq.tipo : "");
    setError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const tipoFinal = form.tipo === "outro" ? tipoCustom.trim() : form.tipo;
    if (!form.nome || !tipoFinal) return;
    setSaving(true);
    setError("");

    try {
      const isEditing = editingId !== null;
      const url = isEditing ? `/api/equipamentos/${editingId}` : '/api/equipamentos';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tipo: tipoFinal }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao salvar.");
        return;
      }

      if (isEditing) {
        setEquipamentos(equipamentos.map((eq) => (eq.id === editingId ? data.equipamento : eq)));
        toast.success("Equipamento atualizado.");
      } else {
        setEquipamentos([data.equipamento, ...equipamentos]);
        toast.success("Equipamento cadastrado.");
      }

      setForm(emptyForm);
      setTipoCustom("");
      setEditingId(null);
      setDialogOpen(false);
    } catch {
      setError("Erro ao salvar equipamento.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/equipamentos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEquipamentos(equipamentos.filter((e) => e.id !== id));
        toast.success("Equipamento excluido.");
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao excluir.");
      }
    } catch {
      toast.error("Erro ao excluir equipamento.");
    }
  };

  return (
    <AppLayout
      title="Equipamentos"
      subtitle="Gerencie os equipamentos tecnologicos da escola"
      actions={
        canEdit ? <Button onClick={handleOpenNew}><Plus className="mr-2 h-4 w-4" /> Novo Equipamento</Button> : undefined
      }
    >
      <div className="mb-6 flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar equipamento..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="min-w-[150px]">
          <Select value={filtroSala || "__todas__"} onValueChange={(v) => setFiltroSala(v === "__todas__" ? "" : v)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Filtrar por sala" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__todas__">Todas as salas</SelectItem>
              {todasAsSalas.map((sala) => (
                <SelectItem key={sala} value={sala}>{sala}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[160px]">
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Disponibilidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="disponivel">Disponível</SelectItem>
              <SelectItem value="em_uso">Em uso</SelectItem>
              <SelectItem value="manutencao">Manutenção</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[160px]">
          <Select value={ordenacao} onValueChange={(v) => setOrdenacao(v as typeof ordenacao)}>
            <SelectTrigger className="h-10">
              <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="padrao">Padrão (cadastro)</SelectItem>
              <SelectItem value="nome_asc">Nome A → Z</SelectItem>
              <SelectItem value="nome_desc">Nome Z → A</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(filtroSala || filtroStatus !== "todos" || ordenacao !== "padrao") && (
          <Button variant="ghost" size="sm" className="h-10 text-xs" onClick={() => { setFiltroSala(""); setFiltroStatus("todos"); setOrdenacao("padrao"); }}>
            Limpar filtros
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search ? "Nenhum equipamento encontrado." : "Nenhum equipamento cadastrado."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((eq) => {
            const Icon = iconMap[eq.tipo] || Monitor;
            const st = statusConfig[eq.status] || statusConfig.disponivel;
            return (
              <Card key={eq.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{eq.nome}</p>
                        <p className="text-xs text-muted-foreground">{eq.localizacao || "Sem local"} | Qtd: {eq.quantidade}</p>
                      </div>
                    </div>
                    <Badge variant={st.variant}>{st.label}</Badge>
                  </div>
                  {canEdit && (
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenEdit(eq)}>
                        <Edit2 className="mr-1.5 h-3 w-3" /> Editar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(eq.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Equipamento" : "Cadastrar Equipamento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div>
              <Label>Nome</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Projetor Epson" />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select
                value={form.tipo}
                onValueChange={(v) => {
                  setForm({ ...form, tipo: v });
                  if (v !== "outro") setTipoCustom("");
                }}
              >
                <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>
                  {todosOsTipos.map((t) => (
                    <SelectItem key={t} value={t}>{tipoLabel(t)}</SelectItem>
                  ))}
                  <SelectItem value="outro">Outro (digitar)...</SelectItem>
                </SelectContent>
              </Select>
              {form.tipo === "outro" && (
                <Input
                  className="mt-2"
                  placeholder="Digite o tipo do equipamento"
                  value={tipoCustom}
                  onChange={(e) => setTipoCustom(e.target.value)}
                />
              )}
            </div>
            <div>
              <Label>Localizacao</Label>
              <Input value={form.localizacao} onChange={(e) => setForm({ ...form, localizacao: e.target.value })} placeholder="Ex: Sala 1" />
            </div>
            <div>
              <Label>Quantidade</Label>
              <Input type="number" min={1} value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })} />
            </div>
            {editingId && (
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponivel">Disponivel</SelectItem>
                    <SelectItem value="em_uso">Em uso</SelectItem>
                    <SelectItem value="manutencao">Manutencao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
