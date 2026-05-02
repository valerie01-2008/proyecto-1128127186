export interface HomeData {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    animationStyle: 'typewriter' | 'fadeIn' | 'slideUp';
  };
  meta: {
    pageTitle: string;
    description: string;
  };
}

export interface AppConfig {
  appName: string;
  version: string;
  locale: string;
  theme: 'light' | 'dark';
}

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  timezone: string;
  loginAttempts: number;
  lockedUntil: string | null;
  active: boolean;
  createdAt: string;
}

export interface SystemConfig {
  maxEventsPerUser: number;
  notificationWindow: {
    startHour: number;
    endHour: number;
  };
  defaultTimezone: string;
}

export interface DBData {
  systemConfig: SystemConfig;
  users: User[];
}

export type EventCategory = 'personal' | 'trabajo' | 'salud' | 'educacion' | 'otro';
export type EventPriority = 'normal' | 'alta' | 'urgente';
export type EventStatus = 'pendiente' | 'completado' | 'cancelado';

export interface Event {
  id: string;
  userId: string;
  title: string;
  startAt: string; // ISO string UTC
  endAt?: string; // ISO string UTC
  location?: string;
  description?: string;
  category: EventCategory;
  priority: EventPriority;
  status: EventStatus;
  isSynced: boolean;
  archivedAt?: string; // ISO string UTC
  createdAt: string; // ISO string UTC
  updatedAt: string; // ISO string UTC
}

export interface EventWithDetails extends Event {
  attachments: EventAttachment[];
  reminders: Reminder[];
  notificationHistory: NotificationLog[];
}

export interface EventAttachment {
  id: string;
  eventId: string;
  filename: string;
  blobPath: string;
  fileSize: number;
  contentType: string;
  createdAt: string; // ISO string UTC
}

export interface CreateReminderRequest {
  anticipationMin: number;
  channel: 'email';
  customMessage?: string;
}

export interface CreateEventRequest {
  title: string;
  startAt: string; // ISO string in user timezone
  endAt?: string; // ISO string in user timezone
  location?: string;
  description?: string;
  category: EventCategory;
  priority: EventPriority;
  reminders?: CreateReminderRequest[];
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  status?: EventStatus;
}

export interface Reminder {
  id: string;
  eventId: string;
  userId: string;
  anticipationMin: number;
  channel: 'email';
  customMessage?: string;
  fireAt: string; // ISO string UTC
  status: 'pendiente' | 'pendiente_horario' | 'enviado' | 'no_entregada';
  snoozeCount: number;
  createdAt: string; // ISO string UTC
}

export interface NotificationLog {
  id: string;
  reminderId: string;
  eventId: string;
  userId: string;
  channel: 'email';
  sentAt?: string; // ISO string UTC
  status: 'entregada' | 'no_entregada' | 'reintentando';
  retryCount: number;
  nextRetryAt?: string; // ISO string UTC
  errorDetail?: string;
  messageSent?: string;
  createdAt: string; // ISO string UTC
}
