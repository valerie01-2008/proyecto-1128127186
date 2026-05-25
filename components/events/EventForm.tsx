'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Event, EventCategory, EventPriority } from '@/lib/types';
import {
  IconClock,
  IconLocation,
  IconTag,
  IconFlag,
  IconArrowRight,
} from '@/components/icons';

interface SubmitData {
  title: string;
  startAt: string;
  endAt?: string;
  location?: string;
  description?: string;
  category: EventCategory;
  priority: EventPriority;
}

interface EventFormProps {
  event?: Event;
  onSubmit: (data: SubmitData) => Promise<void>;
  isLoading?: boolean;
}

const CATEGORIES: [EventCategory, string][] = [
  ['personal', 'Personal'],
  ['trabajo', 'Trabajo'],
  ['salud', 'Salud'],
  ['educacion', 'Educación'],
  ['otro', 'Otro'],
];

const PRIORITIES: [EventPriority, string, string][] = [
  ['normal', 'Normal', 'var(--prio-normal)'],
  ['alta', 'Alta', 'var(--prio-alta)'],
  ['urgente', 'Urgente', 'var(--prio-urgente)'],
];

export default function EventForm({ event, onSubmit, isLoading = false }: EventFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<{
    title: string;
    startAt: string;
    endAt: string;
    location: string;
    description: string;
    category: EventCategory;
    priority: EventPriority;
  }>({
    title: event?.title || '',
    startAt: event?.startAt ? new Date(event.startAt).toISOString().slice(0, 16) : '',
    endAt: event?.endAt ? new Date(event.endAt).toISOString().slice(0, 16) : '',
    location: event?.location || '',
    description: event?.description || '',
    category: (event?.category as EventCategory) || 'otro',
    priority: (event?.priority as EventPriority) || 'normal',
  });

  const handle = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const payload: SubmitData = {
      ...form,
      startAt: new Date(form.startAt).toISOString(),
      endAt: form.endAt ? new Date(form.endAt).toISOString() : undefined,
    };
    await onSubmit(payload);
  }

  return (
    <form onSubmit={submit} className="space-y-10">
      {/* Title — big editorial */}
      <Section eyebrow="01 · Título" hint="Cómo se llamará tu evento.">
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => handle('title', e.target.value)}
          placeholder="p. ej. Reunión con el equipo de diseño"
          maxLength={200}
          className="w-full font-display text-3xl tracking-editorial bg-transparent text-bone-0 placeholder:text-bone-3 outline-none border-b border-ink-3 focus:border-lime/60 pb-3 transition-colors"
        />
        <p className="font-mono text-[11px] text-bone-3 mt-2">{form.title.length}/200</p>
      </Section>

      {/* Date / time */}
      <Section eyebrow="02 · Cuándo" hint="Las fechas se guardan en UTC y se muestran en tu zona horaria.">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Inicio" icon={<IconClock size={14} />}>
            <input
              type="datetime-local"
              required
              value={form.startAt}
              onChange={(e) => handle('startAt', e.target.value)}
              className="w-full bg-transparent text-bone-0 outline-none text-[15px] [color-scheme:dark]"
            />
          </Field>
          <Field label="Fin (opcional)" icon={<IconClock size={14} />}>
            <input
              type="datetime-local"
              value={form.endAt}
              onChange={(e) => handle('endAt', e.target.value)}
              className="w-full bg-transparent text-bone-0 outline-none text-[15px] [color-scheme:dark]"
            />
          </Field>
        </div>
      </Section>

      {/* Location */}
      <Section eyebrow="03 · Dónde" hint="Ubicación física, URL de meeting o lugar.">
        <Field label="Lugar" icon={<IconLocation size={14} />}>
          <input
            type="text"
            value={form.location}
            onChange={(e) => handle('location', e.target.value)}
            placeholder="Sala B · Oficina central · meet.google.com/abc"
            className="w-full bg-transparent text-bone-0 placeholder:text-bone-3 outline-none text-[15px]"
          />
        </Field>
      </Section>

      {/* Description */}
      <Section eyebrow="04 · Detalle" hint="Notas, agenda, links de referencia.">
        <textarea
          value={form.description}
          onChange={(e) => handle('description', e.target.value)}
          rows={5}
          placeholder="¿Qué hay que recordar de este evento?"
          className="w-full bg-ink-1 border border-ink-3 rounded p-4 text-bone-0 placeholder:text-bone-3 outline-none text-[15px] leading-relaxed focus:border-lime/60 transition-colors resize-y"
        />
      </Section>

      {/* Category */}
      <Section eyebrow="05 · Categoría" hint="Color y etiqueta que verás en el calendario.">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => handle('category', v)}
              className={`group inline-flex items-center gap-2 h-10 px-4 rounded border text-sm transition-colors ${
                form.category === v
                  ? 'bg-ink-2 border-bone-2 text-bone-0'
                  : 'bg-ink-1 border-ink-3 text-bone-2 hover:text-bone-0 hover:border-ink-4'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full bg-cat-${v === 'educacion' ? 'educacion' : v}`}
              />
              <IconTag size={14} className="opacity-60" />
              {l}
            </button>
          ))}
        </div>
      </Section>

      {/* Priority */}
      <Section eyebrow="06 · Prioridad" hint="Solo afecta el color de la etiqueta y el orden.">
        <div className="flex gap-2">
          {PRIORITIES.map(([v, l, color]) => {
            const selected = form.priority === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => handle('priority', v)}
                className={`flex-1 inline-flex items-center justify-center gap-2 h-11 rounded border text-sm transition-colors ${
                  selected
                    ? 'border-bone-2 text-bone-0 bg-ink-2'
                    : 'border-ink-3 text-bone-2 hover:text-bone-0 hover:border-ink-4 bg-ink-1'
                }`}
              >
                <IconFlag size={14} style={{ color: selected ? color : undefined }} />
                {l}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-ink-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="sm:flex-none h-11 px-5 rounded border border-ink-3 text-bone-1 hover:text-bone-0 hover:border-ink-4 hover:bg-ink-2 transition-colors text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="group sm:flex-1 h-11 px-5 rounded bg-lime text-ink-0 font-medium hover:bg-bone-0 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {isLoading ? 'Guardando…' : event ? 'Actualizar evento' : 'Crear evento'}
          <span className="transition-transform group-hover:translate-x-0.5">
            <IconArrowRight size={18} />
          </span>
        </button>
      </div>
    </form>
  );
}

function Section({
  eyebrow,
  hint,
  children,
}: {
  eyebrow: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid md:grid-cols-[220px_1fr] gap-4 md:gap-10">
      <header>
        <p className="eyebrow mb-1">{eyebrow}</p>
        {hint && <p className="text-bone-3 text-[13px] leading-relaxed">{hint}</p>}
      </header>
      <div>{children}</div>
    </section>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-center gap-1.5 mb-1.5 text-bone-3">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-ticker">{label}</span>
      </div>
      <div className="bg-ink-1 border border-ink-3 rounded h-12 px-3.5 flex items-center transition-colors focus-within:border-lime/60">
        {children}
      </div>
    </label>
  );
}
