'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Event, EventCategory, EventPriority, CreateReminderRequest } from '@/lib/types';
import {
  IconClock,
  IconLocation,
  IconTag,
  IconFlag,
  IconArrowRight,
  IconBell,
  IconPlus,
  IconClose,
  IconMail,
} from '@/components/icons';

interface SubmitData {
  title: string;
  startAt: string;
  endAt?: string;
  location?: string;
  description?: string;
  category: EventCategory;
  priority: EventPriority;
  reminders?: CreateReminderRequest[];
}

interface EventFormProps {
  event?: Event;
  initialReminders?: CreateReminderRequest[];
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

// Anticipaciones soportadas por el motor (RF-10)
const ANTICIPATIONS: [number, string][] = [
  [5, '5 min antes'],
  [15, '15 min antes'],
  [30, '30 min antes'],
  [60, '1 hora antes'],
  [180, '3 horas antes'],
  [1440, '1 día antes'],
  [2880, '2 días antes'],
  [10080, '1 semana antes'],
];

const MAX_REMINDERS = 5;

export default function EventForm({
  event,
  initialReminders = [],
  onSubmit,
  isLoading = false,
}: EventFormProps) {
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

  const [reminders, setReminders] = useState<CreateReminderRequest[]>(initialReminders);

  const handle = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const addReminder = () => {
    if (reminders.length >= MAX_REMINDERS) return;
    setReminders((p) => [
      ...p,
      { anticipationMin: 60, channel: 'email', customMessage: '' },
    ]);
  };

  const updateReminder = (i: number, patch: Partial<CreateReminderRequest>) =>
    setReminders((p) => p.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const removeReminder = (i: number) =>
    setReminders((p) => p.filter((_, idx) => idx !== i));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const payload: SubmitData = {
      ...form,
      startAt: new Date(form.startAt).toISOString(),
      endAt: form.endAt ? new Date(form.endAt).toISOString() : undefined,
      reminders: reminders.length
        ? reminders.map((r) => ({
            anticipationMin: r.anticipationMin,
            channel: 'email',
            customMessage: r.customMessage?.trim() || undefined,
          }))
        : undefined,
    };
    await onSubmit(payload);
  }

  return (
    <form onSubmit={submit} className="space-y-10">
      {/* Title */}
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

      <Section eyebrow="04 · Detalle" hint="Notas, agenda, links de referencia.">
        <textarea
          value={form.description}
          onChange={(e) => handle('description', e.target.value)}
          rows={5}
          placeholder="¿Qué hay que recordar de este evento?"
          className="w-full bg-ink-1 border border-ink-3 rounded p-4 text-bone-0 placeholder:text-bone-3 outline-none text-[15px] leading-relaxed focus:border-lime/60 transition-colors resize-y"
        />
      </Section>

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

      <Section
        eyebrow="07 · Recordatorios"
        hint={`Hasta ${MAX_REMINDERS} recordatorios por evento. El motor evalúa cada 5 min y envía correo respetando tu ventana 06:00–22:00.`}
      >
        {reminders.length === 0 ? (
          <div className="border border-dashed border-ink-3 rounded-lg p-6 bg-ink-1/40 text-center">
            <p className="text-bone-2 text-sm mb-4">
              Sin recordatorios todavía. Sin ellos, el evento no notifica.
            </p>
            <button
              type="button"
              onClick={addReminder}
              className="inline-flex items-center gap-2 h-10 px-4 rounded border border-ink-3 text-bone-1 hover:text-bone-0 hover:border-ink-4 hover:bg-ink-2 transition-colors text-sm"
            >
              <IconPlus size={16} /> Añadir recordatorio
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {reminders.map((r, i) => (
              <li
                key={i}
                className="ap-fade-up bg-ink-1 border border-ink-3 rounded-lg p-4"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-bone-3">
                      <IconBell size={16} />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-ticker text-bone-3">
                      Recordatorio · {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeReminder(i)}
                    className="text-bone-3 hover:text-crimson p-1.5 rounded hover:bg-ink-2 transition-colors"
                    aria-label="Eliminar recordatorio"
                  >
                    <IconClose size={16} />
                  </button>
                </div>

                <div className="grid md:grid-cols-[1fr_1.4fr] gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-ticker text-bone-3 mb-1">
                      Anticipación
                    </p>
                    <select
                      value={r.anticipationMin}
                      onChange={(e) =>
                        updateReminder(i, { anticipationMin: parseInt(e.target.value, 10) })
                      }
                      className="w-full h-10 px-3 bg-ink-2 border border-ink-3 rounded text-sm text-bone-0 outline-none focus:border-lime/60 cursor-pointer"
                    >
                      {ANTICIPATIONS.map(([v, l]) => (
                        <option key={v} value={v} className="bg-ink-1">
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-ticker text-bone-3 mb-1">
                      Mensaje (opcional)
                    </p>
                    <div className="bg-ink-2 border border-ink-3 rounded h-10 px-3 flex items-center gap-2 focus-within:border-lime/60 transition-colors">
                      <IconMail size={14} className="text-bone-3 shrink-0" />
                      <input
                        type="text"
                        value={r.customMessage || ''}
                        onChange={(e) => updateReminder(i, { customMessage: e.target.value })}
                        placeholder="Texto del correo"
                        maxLength={500}
                        className="w-full bg-transparent text-bone-0 placeholder:text-bone-3 outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}

            {reminders.length < MAX_REMINDERS && (
              <li>
                <button
                  type="button"
                  onClick={addReminder}
                  className="w-full inline-flex items-center justify-center gap-2 h-11 rounded border border-dashed border-ink-3 text-bone-2 hover:text-bone-0 hover:border-ink-4 hover:bg-ink-1 transition-colors text-sm"
                >
                  <IconPlus size={16} /> Añadir otro ({reminders.length}/{MAX_REMINDERS})
                </button>
              </li>
            )}
          </ul>
        )}
      </Section>

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
