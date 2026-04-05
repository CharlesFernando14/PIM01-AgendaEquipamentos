'use client';

import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Clock, Loader2, AlertCircle, X, CalendarIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/lib/auth-context";

interface Equipamento {
  id: string;
  nome: string;
  tipo: string;
}

interface UserOption {
  id: string;
  name: string | null;
  email: string;
}

interface Agendamento {
  id: string;
  dataInicio: string;
  dataFim: string;
  status: string;
  observacoes: string | null;
  user: { id: string; name: string | null; email: string };
  equipamento: { id: string; nome: string; tipo: string };
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  confirmado: { label: "Confirmado", variant: "default" },
  pendente: { label: "Pendente", variant: "secondary" },
  cancelado: { label: "Cancelado", variant: "destructive" },
};

export default function Agendamento() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [allAgendamentos, setAllAgendamentos] = useState<Agendamento[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ equipamentoId: "", startTime: "", endTime: "", observacoes: "", userId: "" });
  const [formDate, setFormDate] = useState<Date>(new Date());

  const canManage = user?.role === 'ADMIN' || user?.role === 'TECNICO';

  const fetchEquipamentos = useCallback(async () => {
    try {
      const res = await fetch('/api/equipamentos');
      if (res.ok) {
        const data = await res.json();
        setEquipamentos(data.equipamentos);
      }
    } catch { /* ignore */ }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users?.filter((u: { status: string }) => u.status === 'ativo') || []);
      }
    } catch { /* ignore */ }
  }, []);

  const fetchAllAgendamentos = useCallback(async () => {
    try {
      const res = await fetch('/api/agendamentos');
      if (res.ok) {
        const data = await res.json();
        setAllAgendamentos(data.agendamentos);
      }
    } catch { /* ignore */ }
  }, []);

  const fetchDayAgendamentos = useCallback(async (date: Date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const res = await fetch(`/api/agendamentos?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        setAgendamentos(data.agendamentos);
      }
    } catch {
      toast.error("Erro ao carregar agendamentos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipamentos();
    fetchAllAgendamentos();
    if (canManage) fetchUsers();
  }, [fetchEquipamentos, fetchAllAgendamentos, fetchUsers, canManage]);

  useEffect(() => {
    setLoading(true);
    fetchDayAgendamentos(selectedDate);
  }, [selectedDate, fetchDayAgendamentos]);

  const reservedDates = allAgendamentos
    .filter((a) => a.status !== 'cancelado')
    .map((a) => new Date(a.dataInicio));

  const handleOpenNew = () => {
    setForm({ equipamentoId: "", startTime: "", endTime: "", observacoes: "", userId: "" });
    setFormDate(selectedDate);
    setError("");
    setDialogOpen(true);
  };

  const handleAdd = async () => {
    if (!form.equipamentoId || !form.startTime || !form.endTime) return;
    setSaving(true);
    setError("");

    const dateStr = format(formDate, 'yyyy-MM-dd');
    const dataInicio = new Date(`${dateStr}T${form.startTime}:00`);
    const dataFim = new Date(`${dateStr}T${form.endTime}:00`);

    try {
      const res = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipamentoId: form.equipamentoId,
          dataInicio: dataInicio.toISOString(),
          dataFim: dataFim.toISOString(),
          observacoes: form.observacoes || null,
          ...(form.userId && { userId: form.userId }),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar agendamento.");
        return;
      }

      setAgendamentos([...agendamentos, data.agendamento]);
      setAllAgendamentos([...allAgendamentos, data.agendamento]);
      toast.success("Reserva criada com sucesso!");
      setDialogOpen(false);
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const res = await fetch(`/api/agendamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelado' }),
      });
      if (res.ok) {
        setAgendamentos(agendamentos.map((a) => a.id === id ? { ...a, status: 'cancelado' } : a));
        setAllAgendamentos(allAgendamentos.map((a) => a.id === id ? { ...a, status: 'cancelado' } : a));
        toast.success("Reserva cancelada.");
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao cancelar.");
      }
    } catch {
      toast.error("Erro ao cancelar reserva.");
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      const res = await fetch(`/api/agendamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmado' }),
      });
      if (res.ok) {
        setAgendamentos(agendamentos.map((a) => a.id === id ? { ...a, status: 'confirmado' } : a));
        setAllAgendamentos(allAgendamentos.map((a) => a.id === id ? { ...a, status: 'confirmado' } : a));
        toast.success("Reserva confirmada.");
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao confirmar.");
      }
    } catch {
      toast.error("Erro ao confirmar reserva.");
    }
  };

  return (
    <AppLayout
      title="Agendamento"
      subtitle="Reserve equipamentos para suas aulas"
      actions={
        <Button onClick={handleOpenNew}><Plus className="mr-2 h-4 w-4" /> Nova Reserva</Button>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        <Card>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              locale={ptBR}
              modifiers={{ reserved: reservedDates }}
              modifiersClassNames={{ reserved: "bg-primary/20 font-bold" }}
              className="w-full"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Reservas - {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : agendamentos.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Nenhuma reserva para esta data.
              </p>
            ) : (
              <div className="space-y-3">
                {agendamentos.map((a) => {
                  const st = statusConfig[a.status] || statusConfig.pendente;
                  const inicio = new Date(a.dataInicio);
                  const fim = new Date(a.dataFim);
                  const isOwner = a.user.id === user?.id;
                  return (
                    <div key={a.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-sm font-medium text-primary">
                          <Clock className="h-4 w-4" />
                          {format(inicio, 'HH:mm')} - {format(fim, 'HH:mm')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{a.equipamento.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {a.user.name || a.user.email}
                            {a.observacoes ? ` - ${a.observacoes}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={st.variant}>{st.label}</Badge>
                        {a.status === 'pendente' && canManage && (
                          <Button variant="outline" size="sm" onClick={() => handleConfirm(a.id)}>
                            Confirmar
                          </Button>
                        )}
                        {a.status !== 'cancelado' && (isOwner || canManage) && (
                          <Button variant="ghost" size="sm" onClick={() => handleCancel(a.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Reserva</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div>
              <Label>Equipamento</Label>
              <Select value={form.equipamentoId} onValueChange={(v) => setForm({ ...form, equipamentoId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione o equipamento" /></SelectTrigger>
                <SelectContent>
                  {equipamentos.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>{eq.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {canManage && (
              <div>
                <Label>Atribuir a</Label>
                <Select value={form.userId} onValueChange={(v) => setForm({ ...form, userId: v })}>
                  <SelectTrigger><SelectValue placeholder="Eu mesmo (padrão)" /></SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formDate, "dd/MM/yyyy", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formDate}
                    onSelect={(d) => d && setFormDate(d)}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Inicio</Label>
                <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              </div>
              <div>
                <Label>Termino</Label>
                <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Observacoes</Label>
              <Input value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Ex: Aula de Ciencias" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleAdd} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Reserva
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
