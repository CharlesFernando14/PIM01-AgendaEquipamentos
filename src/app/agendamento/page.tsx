'use client';

import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Reservation {
  id: number;
  professor: string;
  equipment: string;
  date: Date;
  startTime: string;
  endTime: string;
  purpose: string;
  status: "confirmada" | "pendente" | "cancelada";
}

const initialReservations: Reservation[] = [
  { id: 1, professor: "Maria Silva", equipment: "Projetor Sala 1", date: new Date(2026, 2, 28), startTime: "08:00", endTime: "10:00", purpose: "Aula de Ciências", status: "confirmada" },
  { id: 2, professor: "João Santos", equipment: "Chromebook Kit A", date: new Date(2026, 2, 28), startTime: "10:00", endTime: "12:00", purpose: "Pesquisa em grupo", status: "pendente" },
  { id: 3, professor: "Ana Costa", equipment: "Tablet Kit B", date: new Date(2026, 2, 30), startTime: "14:00", endTime: "16:00", purpose: "Atividade interativa", status: "confirmada" },
];

const statusConfig = {
  confirmada: { label: "Confirmada", variant: "default" as const },
  pendente: { label: "Pendente", variant: "secondary" as const },
  cancelada: { label: "Cancelada", variant: "destructive" as const },
};

export default function Agendamento() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ professor: "", equipment: "", startTime: "", endTime: "", purpose: "" });

  const dayReservations = reservations.filter(
    (r) => r.date.toDateString() === selectedDate.toDateString()
  );

  const reservedDates = reservations.map((r) => r.date);

  const handleAdd = () => {
    if (!form.professor || !form.equipment || !form.startTime || !form.endTime) return;
    const conflict = reservations.some(
      (r) =>
        r.equipment === form.equipment &&
        r.date.toDateString() === selectedDate.toDateString() &&
        r.startTime < form.endTime &&
        r.endTime > form.startTime
    );
    if (conflict) {
      toast.error("Conflito de horário! Este equipamento já está reservado neste período.");
      return;
    }
    setReservations([
      ...reservations,
      { ...form, id: Date.now(), date: selectedDate, status: "pendente" },
    ]);
    setForm({ professor: "", equipment: "", startTime: "", endTime: "", purpose: "" });
    setDialogOpen(false);
  };

  return (
    <AppLayout
      title="Agendamento"
      subtitle="Reserve equipamentos para suas aulas"
      actions={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Nova Reserva</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Reserva</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Professor</Label>
                <Input value={form.professor} onChange={(e) => setForm({ ...form, professor: e.target.value })} placeholder="Nome do professor" />
              </div>
              <div>
                <Label>Equipamento</Label>
                <Select value={form.equipment} onValueChange={(v) => setForm({ ...form, equipment: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Projetor Sala 1">Projetor Sala 1</SelectItem>
                    <SelectItem value="Chromebook Kit A">Chromebook Kit A</SelectItem>
                    <SelectItem value="Tablet Kit B">Tablet Kit B</SelectItem>
                    <SelectItem value="Caixa de Som">Caixa de Som</SelectItem>
                    <SelectItem value="Notebook Lab">Notebook Lab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Início</Label>
                  <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                </div>
                <div>
                  <Label>Término</Label>
                  <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Finalidade</Label>
                <Input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="Ex: Aula de Ciências" />
              </div>
              <p className="text-sm text-muted-foreground">
                Data selecionada: <strong>{format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}</strong>
              </p>
              <Button className="w-full" onClick={handleAdd}>Confirmar Reserva</Button>
            </div>
          </DialogContent>
        </Dialog>
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
              Reservas — {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dayReservations.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Nenhuma reserva para esta data.
              </p>
            ) : (
              <div className="space-y-3">
                {dayReservations.map((r) => {
                  const st = statusConfig[r.status];
                  return (
                    <div key={r.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-sm font-medium text-primary">
                          <Clock className="h-4 w-4" />
                          {r.startTime} - {r.endTime}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{r.equipment}</p>
                          <p className="text-xs text-muted-foreground">{r.professor} • {r.purpose}</p>
                        </div>
                      </div>
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
