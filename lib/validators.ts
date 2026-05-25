import { z } from 'zod';

export const HomeDataSchema = z.object({
  hero: z.object({
    title: z.string(),
    subtitle: z.string(),
    description: z.string(),
    animationStyle: z.enum(['typewriter', 'fadeIn', 'slideUp']),
  }),
  meta: z.object({
    pageTitle: z.string(),
    description: z.string(),
  }),
});

export const AppConfigSchema = z.object({
  appName: z.string(),
  version: z.string(),
  locale: z.string(),
  theme: z.enum(['light', 'dark']),
});

export const CreateReminderRequestSchema = z.object({
  anticipationMin: z.number().min(5).max(1440), // RN-04: mín 5 min, máx 24h
  channel: z.literal('email'), // RN-05: canal obligatorio (solo email por ahora)
  customMessage: z.string().max(500).optional(),
});

export type HomeDataZod = z.infer<typeof HomeDataSchema>;
export type AppConfigZod = z.infer<typeof AppConfigSchema>;

// Shape base (sin refines de cross-field) para poder reusar en Update con .partial()
const EventRequestShape = z.object({
  title: z.string().min(1).max(200),
  startAt: z.string().refine(
    (val) => !Number.isNaN(new Date(val).getTime()),
    'Fecha de inicio inválida'
  ),
  endAt: z.string().nullish(),
  location: z.string().max(300).nullish(),
  description: z.string().nullish(),
  category: z.enum(['personal', 'trabajo', 'salud', 'educacion', 'otro']),
  priority: z.enum(['normal', 'alta', 'urgente']),
  reminders: z.array(CreateReminderRequestSchema).optional(),
});

// Cross-field: end_at debe ser estrictamente posterior a start_at (RN-02/RN-07).
const endAfterStart = (data: Record<string, unknown>): boolean => {
  const startAt = data.startAt as string | undefined;
  const endAt = data.endAt as string | null | undefined;
  if (!endAt || !startAt) return true;
  return new Date(endAt).getTime() > new Date(startAt).getTime();
};
const endAfterStartOpts: { message: string; path: (string | number)[] } = {
  message: 'La fecha de fin debe ser posterior a la de inicio',
  path: ['endAt'],
};

export const CreateEventRequestSchema = EventRequestShape.refine(endAfterStart, endAfterStartOpts);

export const UpdateEventRequestSchema = EventRequestShape.partial()
  .extend({ status: z.enum(['pendiente', 'completado', 'cancelado']).optional() })
  .refine(endAfterStart, endAfterStartOpts);

export type CreateEventRequestZod = z.infer<typeof CreateEventRequestSchema>;
export type UpdateEventRequestZod = z.infer<typeof UpdateEventRequestSchema>;
export type CreateReminderRequestZod = z.infer<typeof CreateReminderRequestSchema>;