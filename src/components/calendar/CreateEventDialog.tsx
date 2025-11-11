'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCalendar } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateEventDialog({ open, onOpenChange, onSuccess }: CreateEventDialogProps) {
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createEvent } = useCalendar();
  const { toast } = useToast();

  // Set default times when dialog opens
  React.useEffect(() => {
    if (open && !startTime) {
      const now = new Date();
      now.setMinutes(0, 0, 0);
      now.setHours(now.getHours() + 1);

      const end = new Date(now);
      end.setHours(end.getHours() + 1);

      setStartTime(formatDateTimeLocal(now));
      setEndTime(formatDateTimeLocal(end));
    }
  }, [open]);

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate that end time is after start time
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      if (end <= start) {
        setError('A data de término deve ser posterior à data de início.');
        setIsSubmitting(false);
        return;
      }

      const eventData: any = {
        summary,
        description: description || undefined,
        location: location || undefined,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      };

      if (isRecurring && recurrence.trim()) {
        eventData.recurrence = recurrence.trim();
      }

      await createEvent(eventData);

      toast({
        title: 'Evento criado!',
        description: 'O evento foi adicionado ao seu Google Calendar.',
      });

      // Reset form
      setSummary('');
      setDescription('');
      setLocation('');
      setIsRecurring(false);
      setRecurrence('');

      onSuccess();
    } catch (err: any) {
      console.error('Failed to create event:', err);
      setError(err.message || 'Falha ao criar evento. Verifique os campos e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Evento</DialogTitle>
          <DialogDescription>
            Crie um novo evento no seu Google Calendar
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="summary">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Ex: Reunião com cliente"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes do evento (opcional)"
              rows={3}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Local</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Sala de reuniões"
            />
          </div>

          {/* Start Time */}
          <div className="space-y-2">
            <Label htmlFor="startTime">
              Data e Hora de Início <span className="text-destructive">*</span>
            </Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <Label htmlFor="endTime">
              Data e Hora de Término <span className="text-destructive">*</span>
            </Label>
            <Input
              id="endTime"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          {/* Recurring */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRecurring"
              checked={isRecurring}
              onCheckedChange={(checked) => setIsRecurring(checked === true)}
            />
            <Label htmlFor="isRecurring" className="cursor-pointer font-normal">
              Evento Recorrente
            </Label>
          </div>

          {/* Recurrence Rule */}
          {isRecurring && (
            <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
              <Label htmlFor="recurrence">Regra de Recorrência (RRULE)</Label>
              <Input
                id="recurrence"
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
                placeholder="Ex: RRULE:FREQ=DAILY;COUNT=5"
              />
              <p className="text-xs text-muted-foreground">
                <strong>Exemplos:</strong><br />
                • Diário por 5 dias: RRULE:FREQ=DAILY;COUNT=5<br />
                • Semanal: RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR<br />
                • Mensal: RRULE:FREQ=MONTHLY;BYMONTHDAY=15
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar Evento
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

