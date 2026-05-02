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

export const CreateEventRequestSchema = z.object({
  title: z.string().min(1).max(200),
  startAt: z.string().refine((val) => {
    const date = new Date(val);
    return date > new Date(); // RN-02: fecha futura
  }, 'La fecha debe ser futura'),
  endAt: z.string().optional().refine((val) => {
    if (!val) return true;
    const start = new Date(val);
    const end = new Date(val);
    return end > start; // end_at debe ser después de start_at
  }, 'La fecha de fin debe ser posterior a la de inicio'),
  location: z.string().max(300).optional(),
  description: z.string().optional(),
  category: z.enum(['personal', 'trabajo', 'salud', 'educacion', 'otro']),
  priority: z.enum(['normal', 'alta', 'urgente']),
  reminders: z.array(CreateReminderRequestSchema).optional(),
});

export const UpdateEventRequestSchema = CreateEventRequestSchema.partial().extend({
  status: z.enum(['pendiente', 'completado', 'cancelado']).optional(),
});

export type CreateEventRequestZod = z.infer<typeof CreateEventRequestSchema>;
export type UpdateEventRequestZod = z.infer<typeof UpdateEventRequestSchema>;
export type CreateReminderRequestZod = z.infer<typeof CreateReminderRequestSchema>;