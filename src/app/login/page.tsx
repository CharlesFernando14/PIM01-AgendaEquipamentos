'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Monitor } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with auth
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="flex flex-col items-center gap-3 pb-2 pt-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
            <Monitor className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">GestãoTec</h1>
            <p className="text-sm text-muted-foreground">Sistema de Equipamentos Escolares</p>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.edu.br" required />
            </div>
            <div>
              <Label>Senha</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full">Entrar</Button>
            <p className="text-center text-xs text-muted-foreground">
              Esqueceu a senha? Contate o administrador.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
