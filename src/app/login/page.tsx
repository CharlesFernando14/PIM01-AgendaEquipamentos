'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Monitor, AlertCircle, Eye, EyeOff, Loader2, Info } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const sessionExpired = searchParams.get("expired") === "1";
  const loggedOut = searchParams.get("logout") === "1";

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = "Informe seu e-mail.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Informe um e-mail válido.";
    }

    if (!password) {
      errors.password = "Informe sua senha.";
    } else if (password.length < 6) {
      errors.password = "A senha deve ter pelo menos 6 caracteres.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const result = await login(email.trim().toLowerCase(), password);

      if (result.success && result.redirectTo) {
        router.replace(result.redirectTo);
      } else if (result.error) {
        setError(result.error);
      }
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente em instantes.");
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
            <h1 className="text-xl font-bold text-foreground">Equipa</h1>
            <p className="text-sm text-muted-foreground">Sistema de Equipamentos Escolares</p>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-4">
          {sessionExpired && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>Sua sessão expirou. Faça login novamente.</AlertDescription>
            </Alert>
          )}

          {loggedOut && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>Você saiu do sistema.</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="seu@email.edu.br"
                autoComplete="email"
                autoFocus
                disabled={loading}
              />
              {fieldErrors.email && (
                <p className="text-sm text-destructive mt-1">{fieldErrors.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Esqueceu a senha? Contate o administrador.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
