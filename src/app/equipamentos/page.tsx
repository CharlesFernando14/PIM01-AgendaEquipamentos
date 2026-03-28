'use client';

import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Monitor, Tablet, Speaker, Laptop, Edit2, Trash2 } from "lucide-react";

interface Equipment {
  id: number;
  name: string;
  type: string;
  location: string;
  status: "disponivel" | "em_uso" | "manutencao";
  quantity: number;
}

const iconMap: Record<string, React.ElementType> = {
  projetor: Monitor,
  tablet: Tablet,
  som: Speaker,
  notebook: Laptop,
  chromebook: Laptop,
};

const statusConfig = {
  disponivel: { label: "Disponível", variant: "default" as const },
  em_uso: { label: "Em uso", variant: "secondary" as const },
  manutencao: { label: "Manutenção", variant: "destructive" as const },
};

const initialEquipments: Equipment[] = [
  { id: 1, name: "Projetor Epson", type: "projetor", location: "Sala 1", status: "disponivel", quantity: 3 },
  { id: 2, name: "Chromebook Samsung", type: "chromebook", location: "Lab Info", status: "em_uso", quantity: 15 },
  { id: 3, name: "Tablet Educacional", type: "tablet", location: "Armário B", status: "disponivel", quantity: 10 },
  { id: 4, name: "Caixa de Som JBL", type: "som", location: "Secretaria", status: "manutencao", quantity: 2 },
  { id: 5, name: "Notebook Dell", type: "notebook", location: "Lab Info", status: "disponivel", quantity: 5 },
];

export default function Equipamentos() {
  const [equipments, setEquipments] = useState<Equipment[]>(initialEquipments);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formEquip, setFormEquip] = useState({ name: "", type: "", location: "", quantity: 1, status: "disponivel" as Equipment["status"] });

  const filtered = equipments.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenNew = () => {
    setEditingId(null);
    setFormEquip({ name: "", type: "", location: "", quantity: 1, status: "disponivel" });
    setDialogOpen(true);
  };

  const handleOpenEdit = (equipment: Equipment) => {
    setEditingId(equipment.id);
    setFormEquip({
      name: equipment.name,
      type: equipment.type,
      location: equipment.location,
      quantity: equipment.quantity,
      status: equipment.status,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formEquip.name || !formEquip.type || !formEquip.location) return;
    
    if (editingId !== null) {
      // Editar existente
      setEquipments(equipments.map(eq => 
        eq.id === editingId 
          ? { ...eq, ...formEquip }
          : eq
      ));
    } else {
      // Adicionar novo
      setEquipments([
        ...equipments,
        { ...formEquip, id: Date.now() },
      ]);
    }
    
    setFormEquip({ name: "", type: "", location: "", quantity: 1, status: "disponivel" });
    setEditingId(null);
    setDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    setEquipments(equipments.filter((e) => e.id !== id));
  };

  return (
    <AppLayout
      title="Equipamentos"
      subtitle="Gerencie os equipamentos tecnológicos da escola"
      actions={
        <>
          <Button onClick={handleOpenNew}><Plus className="mr-2 h-4 w-4" /> Novo Equipamento</Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Equipamento" : "Cadastrar Equipamento"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Nome</Label>
                  <Input value={formEquip.name} onChange={(e) => setFormEquip({ ...formEquip, name: e.target.value })} placeholder="Ex: Projetor Epson" />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={formEquip.type} onValueChange={(v) => setFormEquip({ ...formEquip, type: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="projetor">Projetor</SelectItem>
                      <SelectItem value="chromebook">Chromebook</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="notebook">Notebook</SelectItem>
                      <SelectItem value="som">Caixa de Som</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Localização</Label>
                  <Input value={formEquip.location} onChange={(e) => setFormEquip({ ...formEquip, location: e.target.value })} placeholder="Ex: Sala 1" />
                </div>
                <div>
                  <Label>Quantidade</Label>
                  <Input type="number" min={1} value={formEquip.quantity} onChange={(e) => setFormEquip({ ...formEquip, quantity: Number(e.target.value) })} />
                </div>
                {editingId && (
                  <div>
                    <Label>Status</Label>
                    <Select value={formEquip.status} onValueChange={(v) => setFormEquip({ ...formEquip, status: v as Equipment["status"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disponivel">Disponível</SelectItem>
                        <SelectItem value="em_uso">Em uso</SelectItem>
                        <SelectItem value="manutencao">Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button className="w-full" onClick={handleSave}>
                  {editingId ? "Salvar Alterações" : "Cadastrar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      }
    >
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar equipamento..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((eq) => {
          const Icon = iconMap[eq.type] || Monitor;
          const st = statusConfig[eq.status];
          return (
            <Card key={eq.id} className="shadow-card hover:shadow-card-hover transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{eq.name}</p>
                      <p className="text-xs text-muted-foreground">{eq.location} • Qtd: {eq.quantity}</p>
                    </div>
                  </div>
                  <Badge variant={st.variant}>{st.label}</Badge>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenEdit(eq)}>
                    <Edit2 className="mr-1.5 h-3 w-3" /> Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(eq.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
}
