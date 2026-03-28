'use client';

import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function Relatorios() {
  return (
    <AppLayout
      title="Relatórios"
      subtitle="Relatórios e métricas do sistema"
    >
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Página em desenvolvimento</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
