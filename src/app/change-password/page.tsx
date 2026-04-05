'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Monitor, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function AlterarSenha() {
  const router = useRouter();
  const { user } = useAuth();
  const isForced = user?.mustChangePassword ?? false;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({});

  const validate = (): boolean => {
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

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao alterar senha.");
        return;
      }

      // Redirecionar para a rota padrão do perfil
      const roleDefaultRoute: Record<string, string> = {
        ADMIN: '/dashboard',
        PROFESSOR: '/agendamento',
        TECNICO: '/equipamentos',
      };
      router.replace(roleDefaultRoute[user?.role || 'ADMIN'] || '/dashboard');
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="flex flex-col items-center gap-3 pb-2 pt-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
            <Monitor className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">Alterar Senha</h1>
            <p className="text-sm text-muted-foreground">
              {isForced
                ? "Defina uma nova senha para continuar usando o sistema"
                : "Defina uma nova senha para sua conta"}
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-4">
          {isForced && (
            <Alert className="mb-4">
              <AlertDescription>
                Este é seu primeiro acesso ou sua senha foi redefinida. Crie uma nova senha pessoal.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="newPassword">Nova senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Mínimo 6 caracteres"
                  autoFocus
                  disabled={loading}
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
              {fieldErrors.password && (
                <p className="text-sm text-destructive mt-1">{fieldErrors.password}</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirm) setFieldErrors((prev) => ({ ...prev, confirm: undefined }));
                }}
                placeholder="Repita a nova senha"
                disabled={loading}
              />
              {fieldErrors.confirm && (
                <p className="text-sm text-destructive mt-1">{fieldErrors.confirm}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar nova senha"
              )}
            </Button>
            {!isForced && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => router.back()}
                disabled={loading}
              >
                Voltar
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
