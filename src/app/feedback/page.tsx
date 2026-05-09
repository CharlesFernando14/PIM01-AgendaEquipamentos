'use client';

import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Star } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Equipamento {
  id: string;
  nome: string;
}

interface FeedbackItem {
  id: string;
  mensagem: string;
  rating: number | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  equipamento: { id: string; nome: string } | null;
}

function StarRating({
  value,
  onChange,
  readOnly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={`focus:outline-none transition-colors ${readOnly ? "cursor-default" : "cursor-pointer"}`}
          aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              star <= (hovered || value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loadingEquipamentos, setLoadingEquipamentos] = useState(true);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [equipamentoId, setEquipamentoId] = useState("");
  const [rating, setRating] = useState(0);
  const [mensagem, setMensagem] = useState("");

  const fetchEquipamentos = useCallback(async () => {
    setLoadingEquipamentos(true);
    try {
      const res = await fetch("/api/equipamentos");
      const data = await res.json();
      setEquipamentos(data.equipamentos ?? []);
    } catch {
      // silently fail — select will be empty
    } finally {
      setLoadingEquipamentos(false);
    }
  }, []);

  const fetchFeedbacks = useCallback(async () => {
    setLoadingFeedbacks(true);
    try {
      const res = await fetch("/api/feedback");
      const data = await res.json();
      setFeedbacks(data.feedbacks ?? []);
    } catch {
      // silently fail
    } finally {
      setLoadingFeedbacks(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipamentos();
    fetchFeedbacks();
  }, [fetchEquipamentos, fetchFeedbacks]);

  const handleSubmit = async () => {
    setError("");

    if (!equipamentoId) {
      setError("Selecione um equipamento.");
      return;
    }
    if (rating < 1) {
      setError("Selecione uma avaliação de 1 a 5 estrelas.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipamentoId, rating, mensagem }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao enviar feedback.");
        return;
      }
      toast.success("Feedback enviado com sucesso!");
      setEquipamentoId("");
      setRating(0);
      setMensagem("");
      await fetchFeedbacks();
    } catch {
      setError("Erro ao enviar feedback. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout
      title="Feedback"
      subtitle="Avalie os equipamentos utilizados"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left column — New Feedback form */}
        <Card>
          <CardHeader>
            <CardTitle>Novo Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Equipment select */}
            <div className="space-y-2">
              <Label>Equipamento</Label>
              <Select
                value={equipamentoId}
                onValueChange={setEquipamentoId}
                disabled={loadingEquipamentos}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {equipamentos.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Star rating */}
            <div className="space-y-2">
              <Label>Avaliação</Label>
              <StarRating value={rating} onChange={setRating} />
            </div>

            {/* Comment textarea */}
            <div className="space-y-2">
              <Label>Comentário</Label>
              <Textarea
                placeholder="Descreva sua experiência..."
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Feedback"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Right column — Recent feedbacks */}
        <Card>
          <CardHeader>
            <CardTitle>Feedbacks Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingFeedbacks ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : feedbacks.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">
                Nenhum feedback registrado ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {feedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="border rounded-lg p-4 flex gap-3 items-start"
                  >
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm leading-tight">
                        {fb.user.name ?? fb.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {fb.equipamento?.nome ?? "Equipamento desconhecido"}
                        {" • "}
                        {format(new Date(fb.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                      {fb.mensagem && (
                        <p className="text-sm mt-2 text-foreground/80 break-words">
                          {fb.mensagem}
                        </p>
                      )}
                    </div>

                    {/* Star rating (read-only) */}
                    {fb.rating != null && (
                      <div className="shrink-0">
                        <StarRating value={fb.rating} readOnly />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

