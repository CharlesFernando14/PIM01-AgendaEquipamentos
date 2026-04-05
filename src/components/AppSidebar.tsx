'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Monitor,
  CalendarDays,
  ClipboardList,
  History,
  Users,
  MessageSquare,
  BarChart3,
  LogOut,
  KeyRound,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth, type Role } from "@/lib/auth-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const menuItems = [
  { icon: LayoutDashboard, label: "Painel", path: "/dashboard" },
  { icon: Monitor, label: "Equipamentos", path: "/equipamentos" },
  { icon: CalendarDays, label: "Agendamento", path: "/agendamento" },
  { icon: ClipboardList, label: "Retiradas", path: "/retiradas" },
  { icon: History, label: "Histórico", path: "/historico" },
  { icon: Users, label: "Usuários", path: "/usuarios" },
  { icon: MessageSquare, label: "Feedback", path: "/feedback" },
  { icon: BarChart3, label: "Relatórios", path: "/relatorios" },
];

const roleRouteAccess: Record<Role, string[]> = {
  ADMIN: ['/dashboard', '/equipamentos', '/agendamento', '/retiradas', '/historico', '/relatorios', '/usuarios', '/feedback'],
  PROFESSOR: ['/dashboard', '/equipamentos', '/agendamento', '/historico', '/feedback'],
  TECNICO: ['/dashboard', '/equipamentos', '/agendamento', '/retiradas', '/historico', '/feedback'],
};

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  // Password change dialog state
  const [pwDialogOpen, setPwDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwFieldErrors, setPwFieldErrors] = useState<{ password?: string; confirm?: string }>({});

  const handleOpenPwDialog = () => {
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setPwError("");
    setPwFieldErrors({});
    setPwDialogOpen(true);
  };

  const handleChangePassword = async () => {
    const errors: { password?: string; confirm?: string } = {};
    if (!newPassword) {
      errors.password = "Informe a nova senha.";
    } else if (newPassword.length < 6) {
      errors.password = "A senha deve ter pelo menos 6 caracteres.";
    }
    if (!confirmPassword) {
      errors.confirm = "Confirme a nova senha.";
    } else if (newPassword !== confirmPassword) {
      errors.confirm = "As senhas não coincidem.";
    }
    setPwFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPwSaving(true);
    setPwError("");
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error || "Erro ao alterar senha.");
        return;
      }
      toast.success("Senha alterada com sucesso!");
      setPwDialogOpen(false);
    } catch {
      setPwError("Não foi possível conectar ao servidor.");
    } finally {
      setPwSaving(false);
    }
  };

  const allowedRoutes = user ? roleRouteAccess[user.role] : [];
  const visibleItems = menuItems.filter((item) =>
    allowedRoutes.some((route) => item.path.startsWith(route))
  );

  return (
    <aside
      className={cn(
        "gradient-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300 relative",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div className="flex items-center gap-3 px-5 py-6 border-b border-sidebar-border">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
          <Monitor className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-sidebar-foreground">
              Equipa
            </span>
            <span className="text-[11px] text-sidebar-foreground/60">
              Escola Municipal
            </span>
          </div>
        )}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-card border shadow-card text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-4">
        {user && !collapsed && (
          <div className="px-3 pb-3">
            <p className="text-xs font-medium text-sidebar-foreground/90 truncate">{user.name || user.email}</p>
            <p className="text-[11px] text-sidebar-foreground/50 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleOpenPwDialog}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <KeyRound className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Alterar senha</span>}
        </button>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      <Dialog open={pwDialogOpen} onOpenChange={setPwDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {pwError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{pwError}</AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="sidebar-new-pw">Nova senha</Label>
              <div className="relative">
                <Input
                  id="sidebar-new-pw"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (pwFieldErrors.password) setPwFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Mínimo 6 caracteres"
                  disabled={pwSaving}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {pwFieldErrors.password && (
                <p className="text-sm text-destructive mt-1">{pwFieldErrors.password}</p>
              )}
            </div>
            <div>
              <Label htmlFor="sidebar-confirm-pw">Confirmar nova senha</Label>
              <Input
                id="sidebar-confirm-pw"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (pwFieldErrors.confirm) setPwFieldErrors((prev) => ({ ...prev, confirm: undefined }));
                }}
                placeholder="Repita a nova senha"
                disabled={pwSaving}
              />
              {pwFieldErrors.confirm && (
                <p className="text-sm text-destructive mt-1">{pwFieldErrors.confirm}</p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setPwDialogOpen(false)} disabled={pwSaving}>
                Cancelar
              </Button>
              <Button onClick={handleChangePassword} disabled={pwSaving}>
                {pwSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
