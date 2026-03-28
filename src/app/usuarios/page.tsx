'use client';

import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function Usuarios() {
  return (
    <AppLayout
      title="Usuários"
      subtitle="Gerenciamento de usuários do sistema"
    >
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Página em desenvolvimento</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
