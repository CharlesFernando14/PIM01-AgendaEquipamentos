'use client';

import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function Historico() {
  return (
    <AppLayout
      title="Histórico"
      subtitle="Histórico de todas as operações"
    >
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Página em desenvolvimento</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
