'use client';

import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type Role = "ADMIN" | "PROFESSOR" | "TECNICO";
type Status = "ativo" | "inativo";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  mustChangePassword: boolean;
}

const perfilConfig: Record<Role, { label: string; className: string }> = {
  ADMIN: { label: "Admin", className: "bg-blue-600 text-white hover:bg-blue-600" },
  PROFESSOR: { label: "Professor", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  TECNICO: { label: "Técnico", className: "bg-gray-200 text-gray-700 hover:bg-gray-200" },
};

const statusConfig: Record<Status, { label: string; className: string }> = {
  ativo: { label: "Ativo", className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50" },
  inativo: { label: "Inativo", className: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100" },
};

const emptyForm = { name: "", email: "", role: "PROFESSOR" as Role, status: "ativo" as Status };

export default function Usuarios() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch {
      toast.error("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleOpenNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingId(user.id);
    setForm({ name: user.name || "", email: user.email, role: user.role, status: user.status as Status });
    setError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return;
    setSaving(true);
    setError("");

    try {
      const isEditing = editingId !== null;
      const url = isEditing ? `/api/users/${editingId}` : '/api/users';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao salvar.");
        return;
      }

      if (isEditing) {
        setUsers(users.map((u) => (u.id === editingId ? data.user : u)));
        toast.success("Usuário atualizado.");
      } else {
        setUsers([...users, data.user]);
        toast.success("Usuário criado com senha padrão: 123456");
      }

      setForm(emptyForm);
      setEditingId(null);
      setDialogOpen(false);
    } catch {
      setError("Erro ao salvar usuário.");
    } finally {
      setSaving(false);
    }
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
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
                    <Badge className={perfilConfig[user.role].className}>
                      {perfilConfig[user.role].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusConfig[user.status as Status].className}>
                      {statusConfig[user.status as Status].label}
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
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {!editingId && (
              <Alert>
                <AlertDescription>
                  O usuário será criado com a senha padrão <strong>123456</strong> e deverá alterá-la no primeiro login.
                </AlertDescription>
              </Alert>
            )}
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
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="PROFESSOR">Professor</SelectItem>
                  <SelectItem value="TECNICO">Técnico</SelectItem>
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
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingId ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
