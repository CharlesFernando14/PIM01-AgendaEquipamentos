'use client';

import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";

type Perfil = "admin" | "professor" | "tecnico";
type Status = "ativo" | "inativo";

interface User {
  id: number;
  name: string;
  email: string;
  perfil: Perfil;
  status: Status;
}

const perfilConfig: Record<Perfil, { label: string; className: string }> = {
  admin: { label: "Admin", className: "bg-blue-600 text-white hover:bg-blue-600" },
  professor: { label: "Professor", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  tecnico: { label: "Técnico", className: "bg-gray-200 text-gray-700 hover:bg-gray-200" },
};

const statusConfig: Record<Status, { label: string; className: string }> = {
  ativo: { label: "Ativo", className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50" },
  inativo: { label: "Inativo", className: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100" },
};

const initialUsers: User[] = [
  { id: 1, name: "Admin Escola", email: "admin@escola.edu.br", perfil: "admin", status: "ativo" },
  { id: 2, name: "Maria Silva", email: "maria@escola.edu.br", perfil: "professor", status: "ativo" },
  { id: 3, name: "João Santos", email: "joao@escola.edu.br", perfil: "professor", status: "ativo" },
  { id: 4, name: "Ana Costa", email: "ana@escola.edu.br", perfil: "professor", status: "ativo" },
  { id: 5, name: "Carlos Lima", email: "carlos@escola.edu.br", perfil: "professor", status: "inativo" },
  { id: 6, name: "Tech Support", email: "tech@escola.edu.br", perfil: "tecnico", status: "ativo" },
];

const emptyForm = { name: "", email: "", perfil: "professor" as Perfil, status: "ativo" as Status };

export default function Usuarios() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const handleOpenNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, perfil: user.perfil, status: user.status });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) return;

    if (editingId !== null) {
      setUsers(users.map((u) => (u.id === editingId ? { ...u, ...form } : u)));
    } else {
      setUsers([...users, { ...form, id: Date.now() }]);
    }

    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(false);
  };

  return (
    <AppLayout
      title="Usuários"
      subtitle="Gerencie os acessos ao sistema"
      actions={
        <Button onClick={handleOpenNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo Usuário
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usuários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge className={perfilConfig[user.perfil].className}>
                      {perfilConfig[user.perfil].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusConfig[user.status].className}>
                      {statusConfig[user.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
                    >
                      Editar
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="usuario@escola.edu.br"
              />
            </div>
            <div>
              <Label>Perfil</Label>
              <Select value={form.perfil} onValueChange={(v) => setForm({ ...form, perfil: v as Perfil })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="professor">Professor</SelectItem>
                  <SelectItem value="tecnico">Técnico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Status })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingId ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
