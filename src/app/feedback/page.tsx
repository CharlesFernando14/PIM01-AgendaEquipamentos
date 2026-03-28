'use client';

import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function Feedback() {
  return (
    <AppLayout
      title="Feedback"
      subtitle="Feedbacks e sugestões dos usuários"
    >
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Página em desenvolvimento</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
