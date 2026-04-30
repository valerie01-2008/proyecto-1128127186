# AgendaPro — Plan Maestro del Sistema
> Sistema de Agenda y Recordatorio Automático | Versión 1.0
> Proyecto Fullstack Individual | Mayo 2026
> Stack: Next.js + TypeScript + Supabase Postgres + Vercel Blob + Vercel Cron + Resend
> Estudiante: Valerie Samper | Doc: 1128127186

---

## Índice General

1. [Definición del sistema](#1-definición-del-sistema)
2. [Alcance de la v1 y trabajo futuro](#2-alcance-de-la-v1-y-trabajo-futuro)
3. [Actores del sistema](#3-actores-del-sistema)
4. [Roles y permisos](#4-roles-y-permisos)
5. [Casos de uso](#5-casos-de-uso)
6. [Requerimientos funcionales](#6-requerimientos-funcionales)
7. [Reglas de negocio](#7-reglas-de-negocio)
8. [Stack tecnológico](#8-stack-tecnológico)
9. [Arquitectura de persistencia](#9-arquitectura-de-persistencia)
10. [Bootstrap y migrations](#10-bootstrap-y-migrations)
11. [Capa de datos unificada (dataService)](#11-capa-de-datos-unificada)
12. [Modelo de datos — Supabase Postgres](#12-modelo-de-datos--supabase-postgres)
13. [Motor de notificaciones — Vercel Cron + Resend](#13-motor-de-notificaciones)
14. [Auditoría en Vercel Blob](#14-auditoría-en-vercel-blob)
15. [Arquitectura de rutas](#15-arquitectura-de-rutas)
16. [Requerimientos no funcionales](#16-requerimientos-no-funcionales)
17. [Flujos de usuario y de trabajo](#17-flujos-de-usuario-y-de-trabajo)
18. [Diseño de interfaz](#18-diseño-de-interfaz)
19. [Plan de fases de implementación](#19-plan-de-fases-de-implementación)
20. [Estrategia de seguridad](#20-estrategia-de-seguridad)
21. [Restricciones y trabajo futuro](#21-restricciones-y-trabajo-futuro)
22. [Glosario](#22-glosario)

---

## 1. Definición del sistema

**AgendaPro** es una plataforma web de productividad personal que permite centralizar, gestionar y hacer seguimiento de compromisos, citas y eventos con un motor de recordatorios automáticos por correo electrónico. El sistema opera bajo el principio de "cero olvidos": el motor de notificaciones evalúa automáticamente los recordatorios pendientes cada 5 minutos y despacha los correos sin intervención del usuario.

El sistema opera completamente desde el navegador con Next.js App Router en Vercel. Persiste los datos en Supabase Postgres, ejecuta el motor de notificaciones con Vercel Cron Jobs, envía los correos con Resend y registra la auditoría de operaciones en Vercel Blob.

---

## 2. Alcance de la v1 y trabajo futuro

### Lo que incluye la v1

| Módulo | Descripción |
|---|---|
| **Autenticación** | Registro con correo y contraseña. Login con JWT. Cambio de contraseña. Sin verificación de correo en v1 (cuenta activa inmediatamente). |
| **Gestión de eventos** | CRUD completo de eventos con todos los campos: título, fechas, lugar, descripción, categoría, prioridad. Archivos adjuntos en Vercel Blob (hasta 3, máx 5 MB c/u). |
| **Calendario** | Tres vistas: diaria, semanal y mensual. Navegación libre entre fechas. Indicadores visuales de densidad y prioridad. |
| **Recordatorios** | Hasta 5 recordatorios por evento. Canal: correo electrónico. Anticipaciones configurables (5 min, 15 min, 30 min, 1h, 3h, 1 día, 2 días, 1 semana). |
| **Motor de notificaciones** | Vercel Cron Job que evalúa recordatorios pendientes cada 5 minutos. Envío de correos con Resend. Reintentos automáticos (hasta 3 veces, 2 min entre intentos). Respeto de ventana horaria 06:00–22:00 en zona horaria del usuario. Historial de notificaciones enviadas. |
| **Snooze** | El usuario puede posponer un recordatorio activo por 5, 10, 15 o 30 minutos adicionales. |
| **Búsqueda y filtros** | Búsqueda por texto en título y descripción. Filtros por categoría, prioridad, estado y rango de fechas. |
| **Reportes** | Reporte personal del usuario: eventos creados, completados, cancelados, recordatorios enviados, tasa de cumplimiento. Exportable en CSV. |
| **Administración** | Panel admin: gestión de usuarios, configuración de parámetros globales, reportes globales y visualización del log de notificaciones. |
| **Auditoría** | Registro de operaciones críticas en Vercel Blob. |

### Lo que queda para versiones futuras

- Verificación de cuenta por correo electrónico (requiere flujo de activation token con expiración).
- Notificaciones por SMS (requiere Twilio u otro proveedor de SMS de pago).
- Notificaciones push (requiere Firebase Cloud Messaging y Service Workers).
- Sincronización con Google Calendar o Microsoft Outlook (requiere OAuth y gestión de tokens de terceros).
- Modo offline con sincronización (Service Worker y caché local).
- Cierre de sesión automático por inactividad con temporizador visible en UI (JWT expiración de 30 min ya lo maneja, pero el banner de "2 min antes" es UX adicional compleja).
- Reporte en formato PDF (solo CSV en v1).
- Recuperación de contraseña por correo (requiere el mismo flujo de email que la verificación).
- Motor de notificaciones con granularidad de 1 minuto (requiere plan Vercel Pro para crons frecuentes; v1 usa 5 minutos que es suficiente para demostración).

---

## 3. Actores del sistema

| Actor | Tipo | Descripción |
|---|---|---|
| **Usuario registrado** | Externo | Crea y gestiona sus propios eventos y recordatorios. |
| **Administrador** | Interno | Gestiona usuarios, configura parámetros globales del sistema y supervisa métricas. |
| **Motor de notificaciones** | Interno — Cron | Proceso automatizado que evalúa recordatorios pendientes y despacha correos cada 5 minutos. |

---

## 4. Roles y permisos

### Matriz de permisos

| Recurso / Acción | Usuario | Admin |
|---|:-:|:-:|
| Login / cambiar contraseña propia | ✅ | ✅ |
| Registrarse | ✅ | N/A |
| Acceder a `/admin/db-setup` | ❌ | ✅ |
| **EVENTOS** | | |
| Crear / editar / eliminar sus propios eventos | ✅ | ✅ |
| Ver sus propios eventos | ✅ | ✅ |
| Marcar evento como completado | ✅ | ✅ |
| Subir archivos adjuntos a Blob | ✅ | ✅ |
| Ver eventos de otros usuarios | ❌ | ❌ |
| **RECORDATORIOS** | | |
| Configurar recordatorios en sus eventos | ✅ | ✅ |
| Ver historial de notificaciones propias | ✅ | ✅ |
| Posponer recordatorio activo (snooze) | ✅ | ✅ |
| **REPORTES** | | |
| Ver y exportar reporte personal | ✅ | ✅ |
| Ver reportes globales del sistema | ❌ | ✅ |
| **ADMINISTRACIÓN** | | |
| Gestionar usuarios | ❌ | ✅ |
| Configurar parámetros globales | ❌ | ✅ |
| Ver log de notificaciones globales | ❌ | ✅ |
| **AUDITORÍA** | | |
| Ver bitácora de auditoría | ❌ | ✅ |

### Comportamiento importante

**El administrador no puede ver el contenido privado de los eventos de los usuarios** (título, descripción, lugar, archivos adjuntos). Solo accede a métricas agregadas: total de eventos por usuario, tasas de cumplimiento, volumen de notificaciones. Esta restricción está documentada en RN-12 y debe implementarse a nivel de API.

---

## 5. Casos de uso

### Módulo de Autenticación

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-01 | Registrarse | Usuario nuevo | Crea cuenta con nombre, correo, contraseña, zona horaria y canal preferido. Cuenta activa inmediatamente en v1. |
| CU-02 | Iniciar sesión | Todos | Ingresa correo y contraseña. El sistema genera JWT. Tras 5 intentos fallidos bloquea la cuenta por 15 minutos. |
| CU-03 | Cambiar contraseña | Todos | Actualiza contraseña verificando la actual. |

### Módulo de Eventos

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-04 | Crear evento | Usuario / Admin | Crea evento con título, fecha/hora, lugar, descripción, categoría, prioridad, adjuntos y recordatorios. |
| CU-05 | Editar evento | Usuario / Admin | Modifica cualquier campo. Si cambia la fecha/hora, el sistema recalcula automáticamente los `fire_at` de todos los recordatorios. |
| CU-06 | Eliminar evento | Usuario / Admin | Elimina evento con todos sus recordatorios y adjuntos. Requiere confirmación modal. |
| CU-07 | Marcar como completado | Usuario / Admin | Archiva el evento. Sale de las vistas activas y queda disponible en historial 90 días. |
| CU-08 | Ver detalle de evento | Usuario / Admin | Abre el detalle completo con campos, adjuntos, recordatorios y estado de notificaciones. |

### Módulo de Calendario y Búsqueda

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-09 | Ver agenda en vista diaria | Usuario / Admin | Línea de tiempo por horas del día seleccionado. |
| CU-10 | Ver agenda en vista semanal | Usuario / Admin | Cuadrícula de 7 días con eventos. |
| CU-11 | Ver agenda en vista mensual | Usuario / Admin | Calendario clásico con indicadores de densidad. |
| CU-12 | Buscar y filtrar eventos | Usuario / Admin | Búsqueda por texto libre y filtros por categoría, prioridad, estado y rango de fechas. |

### Módulo de Recordatorios

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-13 | Configurar recordatorio | Usuario / Admin | Agrega un recordatorio a un evento con anticipación, canal (email en v1) y mensaje opcional. |
| CU-14 | Posponer recordatorio (snooze) | Usuario / Admin | Desde el historial de notificaciones, pospone un recordatorio activo si el evento aún no comenzó. |
| CU-15 | Ver historial de notificaciones | Usuario / Admin | Lista de notificaciones enviadas con estado (entregada, fallida, reintentando), canal y timestamp. |
| CU-16 | Motor procesa recordatorios | Motor (Cron) | Cada 5 minutos evalúa recordatorios pendientes con `fire_at <= NOW()` y los despacha. |

### Módulo de Reportes y Administración

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-17 | Ver reporte personal | Usuario / Admin | Reporte del período seleccionado con métricas propias. Exportable en CSV. |
| CU-18 | Ver reporte global | Admin | Métricas de todo el sistema. |
| CU-19 | Gestionar usuarios | Admin | Lista, activa/desactiva, crea usuarios y restablece contraseñas. |
| CU-20 | Configurar parámetros globales | Admin | Ajusta límites y configuraciones del sistema. |

---

## 6. Requerimientos funcionales

### Bootstrap

| ID | Requerimiento |
|---|---|
| RF-B1 | El sistema debe poder ejecutarse sin Supabase configurado, sirviendo el seed de `data/` para login inicial del admin. |
| RF-B2 | El sistema debe ofrecer `/admin/db-setup` para diagnóstico, migrations y seed. |

### Autenticación y Usuarios

| ID | Requerimiento |
|---|---|
| RF-01 | El sistema debe permitir registro con: nombre, correo, contraseña (mínimo 8 chars, 1 mayúscula, 1 número), zona horaria y canal preferido. |
| RF-02 | El sistema debe autenticar con JWT. Tras 5 intentos fallidos, bloquear la cuenta 15 minutos. |
| RF-03 | El sistema debe permitir cambiar la contraseña verificando la actual. |

### Eventos

| ID | Requerimiento |
|---|---|
| RF-04 | El sistema debe permitir crear eventos con: título (obligatorio), fecha/hora inicio (obligatoria), hora fin (opcional), lugar, descripción, categoría, prioridad y archivos adjuntos (hasta 3, máx 5 MB c/u en Blob). |
| RF-05 | Al editar la fecha u hora de un evento, el sistema debe recalcular automáticamente los `fire_at` de todos sus recordatorios. |
| RF-06 | La eliminación de un evento debe borrar todos sus recordatorios y adjuntos en Blob, previa confirmación. |
| RF-07 | El sistema debe permitir marcar eventos como completados, archivándolos durante 90 días. |

### Calendario

| ID | Requerimiento |
|---|---|
| RF-08 | El sistema debe ofrecer tres vistas de agenda: diaria (línea de tiempo), semanal (cuadrícula) y mensual (calendario con indicadores). |
| RF-09 | El sistema debe permitir buscar eventos por texto y filtrar por categoría, prioridad, estado y rango de fechas. |

### Recordatorios y Motor

| ID | Requerimiento |
|---|---|
| RF-10 | El sistema debe permitir configurar hasta 5 recordatorios por evento, cada uno con anticipación, canal (email en v1) y mensaje personalizado opcional. |
| RF-11 | El motor de notificaciones debe ejecutarse cada 5 minutos (Vercel Cron), evaluar recordatorios con `fire_at <= NOW()` y despachar los correos con Resend. |
| RF-12 | El sistema debe reintentar hasta 3 veces (intervalos de 2 min) si el correo falla antes de marcar la notificación como "no_entregada". |
| RF-13 | El sistema debe respetar la ventana horaria 06:00–22:00 en la zona horaria del usuario para correo. Las notificaciones fuera de este horario se encolan con estado `pendiente_horario` y se despachan al inicio de la siguiente ventana válida. |
| RF-14 | El sistema debe permitir posponer un recordatorio activo (snooze) por 5, 10, 15 o 30 minutos si el evento aún no ha comenzado. |
| RF-15 | El sistema debe mantener un historial de notificaciones por 30 días con: evento, canal, timestamp, estado y mensaje. |

### Reportes y Admin

| ID | Requerimiento |
|---|---|
| RF-16 | El sistema debe generar reporte personal por período: eventos creados, completados, cancelados, recordatorios enviados, tasa de cumplimiento. Exportable en CSV. |
| RF-17 | El administrador debe poder gestionar usuarios: ver, crear, activar/desactivar, restablecer contraseña. Sin acceso al contenido privado de los eventos. |
| RF-18 | El administrador debe poder configurar: límite máximo de eventos por usuario, canales habilitados, ventana horaria y máximo de reintentos. |

---

## 7. Reglas de negocio

| ID | Regla | Implementación técnica |
|---|---|---|
| RN-01 | Un correo electrónico no puede estar registrado dos veces. | UNIQUE en `users.email`. Zod valida formato. Si Supabase retorna error de unicidad, el servidor retorna 409. |
| RN-02 | Un evento solo puede programarse para fecha igual o posterior al momento actual. | Validación Zod en el servidor: `start_at >= NOW()` en zona horaria UTC. |
| RN-03 | Máximo 5 recordatorios por evento. | `COUNT WHERE event_id = ?` antes de insertar. Si >= 5, retornar 403. |
| RN-04 | Un recordatorio debe configurarse con al menos 5 minutos de anticipación. | Validar que `event.start_at - anticipation_minutes >= 5` al insertar el recordatorio. |
| RN-05 | Cada recordatorio debe tener al menos un canal seleccionado. | Validación Zod: `channels` es array no vacío. |
| RN-06 | Eliminar un evento elimina también sus recordatorios, adjuntos en Blob y el historial de notificaciones. | Cascade en Postgres para recordatorios y notificaciones. Los archivos en Blob se eliminan manualmente desde `dataService` antes del DELETE del evento. |
| RN-07 | Si dos eventos se solapan en horario, el sistema muestra una advertencia pero permite la creación. | Query para verificar solapamiento antes de guardar. Retornar el nombre del evento conflictivo en la respuesta. El frontend muestra la advertencia pero el usuario puede confirmar igualmente. |
| RN-08 | El snooze solo está disponible si el evento aún no comenzó (`start_at > NOW()`). | Verificar en el endpoint de snooze. Retornar 409 si el evento ya comenzó. |
| RN-09 | Los eventos completados se conservan 90 días. | Campo `archived_at` en `events`. Un cron (o query en el diagnóstico del admin) puede limpiar los que tengan `archived_at < NOW() - 90 days`. |
| RN-10 | Las notificaciones por correo solo se envían entre 06:00 y 22:00 en la zona horaria del usuario. | El motor verifica `hora_local_usuario(fire_at, user.timezone)` antes de despachar. Si está fuera de la ventana, actualiza el estado a `pendiente_horario` y recalcula `fire_at` para las 06:00 del día siguiente. |
| RN-11 | Los eventos de tipo `sincronizado` (importados desde calendarios externos) no son editables. | Campo `is_synced` en `events`. En el endpoint de edición, verificar `is_synced = false`. Retornar 403 con mensaje. En v1 no hay sincronización real, pero el campo existe para cuando se implemente. |
| RN-12 | El administrador no puede ver el contenido privado de los eventos (título, descripción, lugar, adjuntos). | Los endpoints de admin nunca devuelven esos campos. Las queries de admin usan `SELECT id, user_id, start_at, status, category` — nunca `title, description, location, attachment_path`. |
| RN-13 | La sesión expira a los 30 minutos de inactividad. | JWT con `expiresIn: '30m'`. En v1 sin el banner de advertencia de UI (trabajo futuro). |
| RN-14 | Todas las fechas se almacenan en UTC. Se presentan en la zona horaria del usuario. | Guardar siempre en UTC en Postgres (TIMESTAMPTZ). `dateUtils.ts` convierte para presentación usando `user.timezone`. |
| RN-15 | Máximo 500 eventos activos por usuario. Al llegar al 90% (450), el sistema muestra alerta en el dashboard. | `COUNT WHERE user_id = ? AND status = 'pendiente'` antes de crear. La alerta del 90% se calcula en `/api/dashboard`. |
| RN-16 | El motor reintenta hasta 3 veces con 2 minutos de intervalo si el envío falla. | Campo `retry_count` en `notification_log`. Si `retry_count >= 3`, marcar como `no_entregada`. El cron reprocesa los `reintentando` cuyo `next_retry_at <= NOW()`. |
| RN-17 | Las contraseñas deben tener mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número. | Validación Zod con `regex`. Hash con bcrypt 10 salt rounds. |

---

## 8. Stack tecnológico

| Capa | Tecnología | Versión | Propósito |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | Rutas, server components, API routes, Cron Jobs |
| Lenguaje | TypeScript | 5.x | Tipado estático |
| UI | React | 19.x | Componentes del cliente |
| Estilos | Tailwind CSS | 4.x | Utilidades y responsive |
| Animaciones | Framer Motion | 12.x | Transiciones y calendario |
| Validación | Zod | 4.x | Validación servidor y cliente |
| Autenticación | JWT (jose) + bcryptjs | — | Sesiones HttpOnly |
| Base de datos | Supabase Postgres | — | Datos estructurados |
| Cliente DB (migrations) | `pg` (node-postgres) | 8.x | SQL crudo desde bootstrap |
| Cliente DB (queries) | `@supabase/supabase-js` | 2.x | Queries del día a día |
| Motor de notificaciones | Vercel Cron Jobs | — | Ejecuta `/api/cron/process-reminders` cada 5 minutos |
| Envío de correos | Resend | — | API de email transaccional |
| Archivos adjuntos | `@vercel/blob` | — | Almacena adjuntos + auditoría |
| Iconos | Lucide React | — | Iconografía |
| Deploy | Vercel | — | Hosting serverless con Cron Jobs |

### Variables de entorno requeridas

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# Vercel Blob
BLOB_READ_WRITE_TOKEN=

# Auth
JWT_SECRET=
ADMIN_BOOTSTRAP_SECRET=

# Resend (correo transaccional)
RESEND_API_KEY=
RESEND_FROM_EMAIL=agenda@resend.agendapro.app  # o el dominio configurado

# Cron (proteger el endpoint del motor)
CRON_SECRET=   # string aleatorio para autorizar llamadas al cron
```

---

## 9. Arquitectura de persistencia

### 9.1 Destinos de persistencia

| Destino | Qué guarda | Por qué |
|---|---|---|
| **Supabase Postgres** | Usuarios, eventos, recordatorios, log de notificaciones, configuración global. | Todo el dominio requiere SQL: queries de recordatorios pendientes, cálculo de tasa de cumplimiento, verificación de solapamientos. |
| **Vercel Blob** | Archivos adjuntos de eventos (`attachments/<userId>/<eventId>/<filename>`). Auditoría de operaciones (`audit/<YYYYMM>.json`). | Archivos binarios y logs append-only no van en Postgres. |
| **`data/` en el repo** | Seed inicial: admin + configuración global por defecto. | Read-only. Solo para arrancar antes del bootstrap. |

### 9.2 Reglas de oro

1. **`dataService.ts` es el ÚNICO punto de acceso a datos.** Nadie importa `supabase.ts`, `blobAudit.ts` ni `blobFiles.ts` directamente.
2. **CERO caché en memoria** para datos transaccionales.
3. **CERO CDN cache** en `/api/:path*`. Headers `no-store` desde `next.config.ts`.
4. **`get()` del SDK de Blob, nunca `fetch(url)`** — blobs privados fallan silenciosamente con `fetch`.
5. **Token de Blob accedido con función lazy** (`getBlobToken()`), nunca constante de módulo.
6. **El endpoint del cron está protegido** con el header `Authorization: Bearer ${CRON_SECRET}`. Vercel lo llama automáticamente con ese header cuando configura el cron en `vercel.json`.
7. **Fechas siempre en UTC en Postgres.** La conversión a zona horaria local se hace en `dateUtils.ts` al presentar al usuario.

---

## 10. Bootstrap y migrations

### 10.1 Estructura de `data/` (solo semilla)

```
data/
  config.json       ← { "version": "1.0", "system_name": "AgendaPro" }
  seed.json         ← {
                        "users": [{
                          email: "admin@agendapro.app",
                          password_hash: "<bcrypt de admin123>",
                          name: "Administrador",
                          role: "admin",
                          timezone: "America/Bogota"
                        }],
                        "system_config": {
                          "max_events_per_user": 500,
                          "email_notifications_enabled": true,
                          "notification_window_start": "06:00",
                          "notification_window_end": "22:00",
                          "max_retry_attempts": 3
                        }
                      }
  README.md
```

### 10.2 Estructura de `supabase/migrations/`

```
supabase/migrations/
  0001_init_users.sql           ← Fase 1: users + system_config + _migrations
  0002_init_events.sql          ← Fase 3: events, event_attachments
  0003_init_reminders.sql       ← Fase 5: reminders, notification_log
```

### 10.3 Tabla de control `_migrations`

```sql
CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);
```

### 10.4 Configuración del Cron en `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/process-reminders",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

> **Nota importante:** Los cron jobs de Vercel requieren el **plan Pro** para ejecuciones con granularidad menor a 1 vez al día. En el plan gratuito (Hobby), solo se permite 1 cron por día. Para demostración en el proyecto académico, el motor también puede dispararse manualmente llamando a `/api/cron/process-reminders` desde el panel de admin.

### 10.5 Página `/admin/db-setup`

Tab **Diagnóstico**: estado de Supabase, Blob, Resend (ping de test), migrations, conteos por tabla.
Tab **Bootstrap**: migrations pendientes + botón ejecutar con confirmación. El bootstrap también inserta la `system_config` del seed.

---

## 11. Capa de datos unificada

`lib/dataService.ts` es el **único punto de acceso a datos** desde el resto de la aplicación.

### 11.1 Modos de operación

| Modo | Cuándo | Lecturas | Escrituras |
|---|---|---|---|
| **`seed`** | Sin migrations | `data/*.json` | Bloqueadas — solo login admin. |
| **`live`** | Con migrations | Supabase Postgres | Postgres + Blob (adjuntos y auditoría). |

### 11.2 Estructura interna de `lib/`

```
lib/
  dataService.ts         ← ÚNICO punto de acceso
  supabase.ts            ← Solo lo importa dataService
  blobAudit.ts           ← Solo lo importa dataService
  blobFiles.ts           ← Solo lo importa dataService (archivos adjuntos)
  pgMigrate.ts           ← Solo lo importa /api/system/bootstrap
  seedReader.ts          ← Solo lo importa dataService en modo seed
  reminderEngine.ts      ← Lógica del motor: selectPendingReminders,
                           processReminder, handleRetry, buildEmailContent
  eventService.ts        ← detectOverlap, recalculateReminders, archiveOldCompleted
  reportService.ts       ← buildUserReport, generateCSV
  emailService.ts        ← sendReminderEmail (Resend), sendAdminAlert
  auth.ts
  withAuth.ts
  withRole.ts
  types.ts
  schemas.ts
  dateUtils.ts           ← UTC ↔ zona horaria local, formateo en DD/MM/AAAA HH:MM
```

### 11.3 API pública del `dataService`

```typescript
// Sistema
export async function getSystemMode(): Promise<'seed' | 'live'>
export async function getSystemConfig(): Promise<SystemConfig>
export async function updateSystemConfig(data: UpdateSystemConfigRequest): Promise<SystemConfig>

// Auth y usuarios
export async function getUserByEmail(email: string): Promise<User | null>
export async function getUserById(id: string): Promise<User | null>
export async function createUser(data: CreateUserRequest): Promise<User>
export async function updateUser(id: string, data: UpdateUserRequest): Promise<User>
export async function listUsers(filters?: UserFilters): Promise<SafeUser[]>
export async function incrementLoginAttempts(userId: string): Promise<void>
export async function resetLoginAttempts(userId: string): Promise<void>

// Eventos
export async function getEvents(userId: string, filters?: EventFilters): Promise<Event[]>
export async function getEventById(id: string, userId: string): Promise<EventWithDetails | null>
export async function createEvent(userId: string, data: CreateEventRequest): Promise<Event>
export async function updateEvent(id: string, userId: string, data: UpdateEventRequest): Promise<Event>
export async function deleteEvent(id: string, userId: string): Promise<void>
export async function completeEvent(id: string, userId: string): Promise<Event>
export async function getActiveEventCount(userId: string): Promise<number>
export async function uploadAttachment(eventId: string, userId: string, file: Buffer, filename: string, contentType: string): Promise<EventAttachment>
export async function deleteAttachment(attachmentId: string, userId: string): Promise<void>

// Recordatorios
export async function getReminders(eventId: string, userId: string): Promise<Reminder[]>
export async function createReminder(userId: string, data: CreateReminderRequest): Promise<Reminder>
export async function updateReminder(id: string, userId: string, data: UpdateReminderRequest): Promise<Reminder>
export async function deleteReminder(id: string, userId: string): Promise<void>
export async function snoozeReminder(id: string, userId: string, minutes: number): Promise<Reminder>
export async function getNotificationHistory(userId: string, days?: number): Promise<NotificationLog[]>

// Motor de notificaciones (solo lo llama el cron)
export async function getPendingReminders(): Promise<ReminderWithUser[]>
export async function markReminderSent(id: string): Promise<void>
export async function scheduleRetry(id: string, logId: string): Promise<void>
export async function markReminderFailed(id: string, logId: string): Promise<void>
export async function getPendingRetries(): Promise<NotificationLog[]>

// Reportes
export async function getUserReport(userId: string, from: string, to: string): Promise<UserReportData>
export async function getGlobalReport(from: string, to: string): Promise<GlobalReportData>

// Auditoría
export async function recordAudit(entry: AuditEntry): Promise<void>
export async function readAuditMonth(yyyymm: string): Promise<AuditEntry[]>
```

### 11.4 Lógica crítica en servicios de dominio

**`lib/reminderEngine.ts`**

```typescript
// Selecciona recordatorios cuyo fire_at <= NOW() y status = 'pendiente' o 'pendiente_horario'.
// Para 'pendiente_horario', verifica que la hora local del usuario esté en la ventana válida.
export async function selectPendingReminders(): Promise<ReminderWithUser[]>

// Procesa un recordatorio: verifica ventana horaria, llama emailService.sendReminderEmail,
// crea entrada en notification_log, actualiza el estado del recordatorio a 'enviado'.
// Si falla, llama scheduleRetry.
export async function processReminder(reminder: ReminderWithUser, config: SystemConfig): Promise<void>

// Construye el contenido del correo usando la plantilla o el mensaje personalizado.
export function buildEmailContent(reminder: ReminderWithUser): { subject: string; html: string }

// Recalcula fire_at para todos los recordatorios de un evento cuando cambia la fecha del evento.
// fire_at_nuevo = new_start_at - reminder.anticipation_minutes
export async function recalculateRemindersForEvent(eventId: string, newStartAt: Date): Promise<void>
```

**`lib/eventService.ts`**

```typescript
// Verifica si hay eventos del mismo usuario que se solapan con el nuevo evento.
// Retorna los eventos solapados (puede ser un array vacío).
export async function detectOverlap(userId: string, startAt: Date, endAt: Date | null, excludeEventId?: string): Promise<EventOverlap[]>
```

**`lib/emailService.ts`**

```typescript
import { Resend } from 'resend';

// Envía el correo de recordatorio usando Resend.
// Retorna { success: boolean, error?: string }.
export async function sendReminderEmail(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }>
```

---

## 12. Modelo de datos — Supabase Postgres

### Diagrama de entidades

```
users ──< events ──< reminders ──< notification_log
      │         └──< event_attachments
      │
system_config (tabla única, 1 fila — parámetros globales)
```

### Migration `0001_init_users.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
  id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name                 VARCHAR(100) NOT NULL,
  email                VARCHAR(255) UNIQUE NOT NULL,
  password_hash        TEXT         NOT NULL,
  role                 VARCHAR(10)  NOT NULL DEFAULT 'user'
                       CHECK (role IN ('user', 'admin')),
  timezone             VARCHAR(50)  NOT NULL DEFAULT 'America/Bogota',
  preferred_channel    VARCHAR(10)  NOT NULL DEFAULT 'email'
                       CHECK (preferred_channel IN ('email')),  -- SMS y push en v2
  is_active            BOOLEAN      DEFAULT true,
  login_attempts       INTEGER      DEFAULT 0,
  locked_until         TIMESTAMPTZ,
  must_change_password BOOLEAN      DEFAULT false,
  last_login_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Parámetros globales del sistema (1 sola fila)
CREATE TABLE IF NOT EXISTS system_config (
  id                            SERIAL       PRIMARY KEY,
  max_events_per_user           INTEGER      NOT NULL DEFAULT 500,
  email_notifications_enabled   BOOLEAN      DEFAULT true,
  notification_window_start     TIME         DEFAULT '06:00',
  notification_window_end       TIME         DEFAULT '22:00',
  max_retry_attempts            INTEGER      DEFAULT 3,
  retry_interval_minutes        INTEGER      DEFAULT 2,
  updated_at                    TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);
```

### Migration `0002_init_events.sql`

```sql
CREATE TABLE IF NOT EXISTS events (
  id           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        VARCHAR(200) NOT NULL,
  start_at     TIMESTAMPTZ  NOT NULL,             -- siempre UTC
  end_at       TIMESTAMPTZ,
  location     VARCHAR(300),
  description  TEXT,
  category     VARCHAR(15)  NOT NULL DEFAULT 'otro'
               CHECK (category IN ('personal','trabajo','salud','educacion','otro')),
  priority     VARCHAR(10)  NOT NULL DEFAULT 'normal'
               CHECK (priority IN ('normal','alta','urgente')),
  status       VARCHAR(15)  NOT NULL DEFAULT 'pendiente'
               CHECK (status IN ('pendiente','completado','cancelado')),
  is_synced    BOOLEAN      DEFAULT false,        -- para futura sincronización externa
  archived_at  TIMESTAMPTZ,                       -- para eventos completados (retención 90 días)
  created_at   TIMESTAMPTZ  DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_attachments (
  id           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id     UUID         NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  filename     VARCHAR(255) NOT NULL,
  blob_path    TEXT         NOT NULL,             -- path en Vercel Blob
  file_size    INTEGER      NOT NULL,             -- bytes
  content_type VARCHAR(100) NOT NULL,
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_user        ON events(user_id, start_at);
CREATE INDEX IF NOT EXISTS idx_events_status      ON events(user_id, status);
CREATE INDEX IF NOT EXISTS idx_events_start       ON events(start_at);
CREATE INDEX IF NOT EXISTS idx_attachments_event  ON event_attachments(event_id);
```

### Migration `0003_init_reminders.sql`

```sql
CREATE TABLE IF NOT EXISTS reminders (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id            UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  anticipation_min    INTEGER     NOT NULL,  -- 5, 15, 30, 60, 180, 1440, 2880, 10080
  channel             VARCHAR(10) NOT NULL DEFAULT 'email'
                      CHECK (channel IN ('email')),  -- SMS y push en v2
  custom_message      TEXT,                  -- null = usar plantilla automática
  fire_at             TIMESTAMPTZ NOT NULL,  -- calculado: event.start_at - anticipation_min
  status              VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                      CHECK (status IN ('pendiente','pendiente_horario','enviado','no_entregada')),
  snooze_count        INTEGER     DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_log (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  reminder_id   UUID        NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
  event_id      UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel       VARCHAR(10) NOT NULL DEFAULT 'email',
  sent_at       TIMESTAMPTZ,
  status        VARCHAR(20) NOT NULL DEFAULT 'reintentando'
                CHECK (status IN ('entregada','no_entregada','reintentando')),
  retry_count   INTEGER     DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  error_detail  TEXT,
  message_sent  TEXT,                        -- snapshot del mensaje enviado
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminders_fire_at  ON reminders(fire_at, status);
CREATE INDEX IF NOT EXISTS idx_reminders_user     ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_log_user     ON notification_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_log_retry    ON notification_log(next_retry_at, status)
  WHERE status = 'reintentando';
```

---

## 13. Motor de notificaciones

### 13.1 Arquitectura del motor

```
Vercel Cron (cada 5 min)
        │
        ▼
POST /api/cron/process-reminders
  (Header: Authorization: Bearer ${CRON_SECRET})
        │
        ▼
reminderEngine.selectPendingReminders()
  → SELECT reminders WHERE fire_at <= NOW()
    AND status IN ('pendiente', 'pendiente_horario')
        │
        ├── Para cada recordatorio pendiente:
        │     1. Verificar ventana horaria del usuario (RN-10)
        │     2. Si fuera de ventana → UPDATE status = 'pendiente_horario',
        │           fire_at = siguiente_06:00_en_tz_usuario
        │     3. Si dentro de ventana:
        │           a. buildEmailContent (plantilla o custom_message)
        │           b. emailService.sendReminderEmail (Resend)
        │           c. Si success → INSERT notification_log (entregada)
        │                           UPDATE reminder status = 'enviado'
        │           d. Si error → INSERT notification_log (reintentando,
        │                           next_retry_at = NOW + 2 min)
        │
        └── Para cada notificación en estado 'reintentando'
              con next_retry_at <= NOW():
                  Si retry_count < max_retry_attempts → reintentar
                  Si retry_count >= max_retry_attempts →
                      UPDATE notification_log status = 'no_entregada'
                      UPDATE reminder status = 'no_entregada'
```

### 13.2 Endpoint del cron

```typescript
// app/api/cron/process-reminders/route.ts
// POST — llamado por Vercel Cron cada 5 minutos

export async function POST(request: Request) {
  // Verificar que la petición viene de Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = await dataService.getSystemConfig();
  const pending = await dataService.getPendingReminders();

  let sent = 0, skipped = 0, failed = 0;

  for (const reminder of pending) {
    await reminderEngine.processReminder(reminder, config);
    // ... conteo de resultados
  }

  // También procesar reintentos pendientes
  const retries = await dataService.getPendingRetries();
  // ... misma lógica de reintento

  return Response.json({ processed: pending.length, sent, skipped, failed });
}
```

### 13.3 Plantilla de correo (Resend)

```html
<h2>Recordatorio: {{event.title}}</h2>
<p>Tu evento comienza {{anticipation_label}} ({{event.start_at_formatted}}).</p>
<p><strong>Lugar:</strong> {{event.location || 'No especificado'}}</p>
<p><strong>Descripción:</strong> {{event.description || '—'}}</p>
<p>— AgendaPro</p>
```

El mensaje personalizado del usuario reemplaza el cuerpo de la plantilla si está definido.

### 13.4 Disparo manual desde el admin

Para el plan gratuito de Vercel, el admin puede disparar el motor manualmente desde `/admin/db-setup` con un botón "Procesar recordatorios ahora" que llama al endpoint del cron con el `CRON_SECRET` en el header. Útil para demo sin plan Pro.

---

## 14. Auditoría en Vercel Blob

### 14.1 Estructura de cada entrada

```typescript
type AuditEntry = {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  user_role: 'user' | 'admin';
  action:
    | 'login' | 'logout' | 'register'
    | 'create_event' | 'update_event' | 'delete_event' | 'complete_event'
    | 'create_reminder' | 'snooze_reminder'
    | 'upload_attachment' | 'delete_attachment'
    | 'update_system_config' | 'create_user' | 'toggle_user'
    | 'bootstrap';
  entity: 'event' | 'reminder' | 'user' | 'attachment' | 'system';
  entity_id?: string;
  summary: string;  // "Evento 'Reunión con cliente' creado para 15/06/2026 09:00"
  metadata?: Record<string, unknown>;
};
```

### 14.2 Implementación de `lib/blobAudit.ts`

Idéntica al patrón de los demás proyectos del curso:
- `getBlobToken()` lazy — nunca constante de módulo.
- `get()` del SDK de Blob — nunca `fetch(url)` para blobs privados.
- `withFileLock()` para serializar read-modify-write al mismo archivo mensual.

### 14.3 Implementación de `lib/blobFiles.ts`

Para archivos adjuntos de eventos:

```typescript
// Path: attachments/<userId>/<eventId>/<filename>
// Validaciones antes de subir: tipo MIME (imagen, PDF, doc), tamaño máx 5 MB
export async function uploadAttachment(path: string, content: Buffer, contentType: string): Promise<string>
export async function deleteAttachment(path: string): Promise<void>
export async function getAttachmentUrl(path: string): Promise<string | null>
```

---

## 15. Arquitectura de rutas

### Estructura de carpetas

```
app/
  layout.tsx
  page.tsx                         ← Redirige a /dashboard o /login
  login/page.tsx
  register/page.tsx
  dashboard/page.tsx               ← Panel del día: próximos eventos, alertas de cuota
  calendar/
    page.tsx                       ← Vista mensual (default)
    day/page.tsx                   ← Vista diaria
    week/page.tsx                  ← Vista semanal
  events/
    page.tsx                       ← Lista / búsqueda de eventos
    new/page.tsx                   ← Crear evento con recordatorios
    [id]/page.tsx                  ← Detalle del evento
    [id]/edit/page.tsx             ← Editar evento
  notifications/page.tsx           ← Historial de notificaciones enviadas
  reports/page.tsx                 ← Reporte personal
  profile/page.tsx                 ← Preferencias y cambio de contraseña
  admin/
    db-setup/page.tsx
    users/page.tsx
    reports/page.tsx               ← Reporte global
    config/page.tsx                ← Configuración de parámetros globales
    audit/page.tsx

  api/
    system/bootstrap | diagnose | mode
    auth/login | logout | register | me | change-password
    events/
      route.ts                     ← GET lista + búsqueda | POST crear
      [id]/route.ts                ← GET | PUT | DELETE
      [id]/complete/route.ts       ← POST completar
      [id]/attachments/route.ts    ← POST subir adjunto | DELETE borrar
    reminders/
      route.ts                     ← GET de un evento | POST crear
      [id]/route.ts                ← PUT | DELETE
      [id]/snooze/route.ts         ← POST posponer
    notifications/route.ts         ← GET historial del usuario
    calendar/route.ts              ← GET eventos del período para el calendario
    reports/
      my/route.ts                  ← GET reporte personal
      global/route.ts              ← GET reporte global (admin)
      export/route.ts              ← GET CSV
    dashboard/route.ts
    users/route.ts | [id]/route.ts
    admin/config/route.ts
    audit/route.ts
    cron/process-reminders/route.ts ← POST ejecutado por Vercel Cron

components/
  ui/
  layout/                          ← AppLayout, Sidebar, SeedModeBanner, QuotaAlert
  calendar/                        ← MonthView, WeekView, DayView, EventDot, EventCard
  events/                          ← EventForm, ReminderForm, AttachmentUpload, OverlapWarning
  notifications/                   ← NotificationCard, SnoozePanel
  reports/                         ← ReportSummary, CategoryChart, CSVButton
  admin/                           ← DiagnosticPanel, BootstrapPanel, AuditViewer, CronTrigger

lib/
  dataService.ts | supabase.ts | blobAudit.ts | blobFiles.ts
  pgMigrate.ts | seedReader.ts
  reminderEngine.ts | eventService.ts | reportService.ts | emailService.ts
  auth.ts | withAuth.ts | withRole.ts | types.ts | schemas.ts | dateUtils.ts
```

---

## 16. Requerimientos no funcionales

| ID | Requerimiento |
|---|---|
| RNF-01 | El dashboard y el calendario deben cargar en menos de 2 segundos. |
| RNF-02 | La creación de un evento con recordatorios debe completarse en menos de 2 segundos. |
| RNF-03 | El motor de notificaciones no debe bloquear la experiencia del usuario — corre en background vía Cron. |
| RNF-04 | Las fechas y horas se presentan siempre en la zona horaria del usuario, en formato `DD/MM/AAAA HH:MM`. |
| RNF-05 | La interfaz debe ser completamente funcional en celulares (agenda personal se usa en cualquier momento). |
| RNF-06 | Las contraseñas deben cumplir RN-17 y hashearse con bcrypt. |
| RNF-07 | Las sesiones se gestionan con JWT en cookie HttpOnly. |
| RNF-08 | Los archivos adjuntos se sirven desde Blob — nunca se expone la URL directa de Blob al cliente sin verificar la sesión. |

---

## 17. Flujos de usuario y de trabajo

### Flujo de bootstrap (primera vez del admin)

Igual que todos los proyectos del curso: login con admin del seed → banner modo seed → `/admin/db-setup` → ejecutar bootstrap → modo live activo. El bootstrap inserta también la `system_config` con los parámetros por defecto.

### Flujo de creación de evento con recordatorio

| Paso | Pantalla | Acción |
|---|---|---|
| 1 | Dashboard / Calendario | El usuario toca "+ Nuevo Evento". |
| 2 | Formulario | Completa: título, fecha y hora de inicio. Opcionalmente agrega fin, lugar, descripción, categoría y prioridad. |
| 3 | Formulario | El sistema verifica solapamiento en tiempo real. Si hay conflicto, muestra advertencia con el nombre del evento solapado (RN-07). El usuario puede continuar de todas formas. |
| 4 | Recordatorios | El usuario agrega 1 recordatorio: anticipación "1 hora antes", canal "Email", sin mensaje personalizado. |
| 5 | Guardar | El sistema calcula `fire_at = start_at - 60 minutos` y guarda en `reminders`. Retorna los datos del evento. |
| 6 | Calendario | El evento aparece en la cuadrícula. |
| 7 | Cron | 55 minutos después, el cron evalúa los recordatorios. Encuentra el de esta usuaria. |
| 8 | Motor | Verifica ventana horaria. Si está dentro, llama `emailService.sendReminderEmail` con Resend. |
| 9 | Resend | Entrega el correo al usuario. |
| 10 | Motor | Registra en `notification_log` con status `entregada`. Actualiza `reminders.status = 'enviado'`. |
| 11 | Usuario | Recibe el correo con el recordatorio. |

---

## 18. Diseño de interfaz

### Identidad visual del Login / Registro

AgendaPro es una plataforma de productividad personal con un carácter cálido y moderno. La paleta refleja las notas de diseño del documento original: violetas y rosas vibrantes pero refinados.

| Elemento | Especificación |
|---|---|
| **Layout** | Pantalla dividida: mitad izquierda con gradiente violeta-rosa (`from-violet-500 to-pink-400`), mitad derecha con el formulario. En mobile, solo el formulario sobre fondo blanco. |
| **Panel izquierdo** | Gradiente vertical, nombre "AgendaPro" en blanco Bold 36px, tagline "Cero olvidos. Cero estrés." en blanco regular 16px, y tres íconos de features con descripción (Recordatorios automáticos, Múltiples vistas, Motor inteligente). |
| **Panel derecho / formulario** | Fondo blanco puro, centrado. Formulario con ancho máx 400px. |
| **Logo** | SVG inline de un calendario con un símbolo de rayo de energía superpuesto, en violeta `#7C3AED`, 44×44px. |
| **Nombre** | "AgendaPro" en Inter Bold 26px, violeta oscuro (`#4C1D95`). |
| **Campos** | Borde `#E5E7EB`, focus en violeta `#7C3AED`, labels en slate. |
| **Botón principal** | Gradiente `from-violet-500 to-pink-400`, texto blanco, `border-radius: 10px`, hover más oscuro. |
| **Link alternativo** | "¿No tienes cuenta? Regístrate" — violeta discreto. |
| **Animación** | Framer Motion: panel de formulario con `opacity: 0→1` y `x: 20→0`, duración 0.4s. |

### Paleta de colores

| Elemento | Hex |
|---|---|
| Fondo principal | `#FAFAFA` |
| Fondo de tarjetas | `#FFFFFF` |
| Fondo alterno | `#F5F3FF` (violeta 50) |
| Primario (violeta) | `#7C3AED` |
| Acento (rosa) | `#EC4899` |
| Gradiente UI | `from-violet-500 to-pink-400` |
| Texto principal | `#111827` |
| Texto secundario | `#6B7280` |
| Categoría personal | `#7C3AED` (violeta) |
| Categoría trabajo | `#2563EB` (azul) |
| Categoría salud | `#059669` (verde) |
| Categoría educación | `#D97706` (ámbar) |
| Categoría otro | `#6B7280` (gris) |
| Prioridad normal | `#6B7280` |
| Prioridad alta | `#F59E0B` |
| Prioridad urgente | `#EF4444` (con pulso animado) |
| Notificación entregada | `#10B981` |
| Notificación fallida | `#EF4444` |
| Notificación reintentando | `#F59E0B` |
| Bordes | `#E5E7EB` |
| Banner modo seed | Fondo `#FEF3C7`, texto `#92400E`, borde `#F59E0B` |

### Tipografía

Inter para todo el sistema. Títulos: 24px Bold. Cuerpo: 14px Regular. Horas en calendario: 12px Medium Mono-style. Hora del evento en detalle: 18px SemiBold.

### Componentes clave

| Componente | Descripción |
|---|---|
| `MonthView` | Cuadrícula mensual clásica. Cada día tiene un indicador de densidad (punto o número de eventos). Los eventos urgentes tienen borde rojo pulsante. |
| `WeekView` | Cuadrícula de 7 columnas × horas del día. Los eventos aparecen como bloques de color (color por categoría) en su franja horaria real. |
| `DayView` | Línea de tiempo vertical por horas. Bloques de eventos posicionados en su hora exacta. |
| `EventForm` | Formulario con pestañas: Detalles, Recordatorios, Adjuntos. La pestaña de recordatorios permite agregar/quitar recordatorios con los controles de anticipación y canal. |
| `ReminderForm` | Fila inline por cada recordatorio: dropdown de anticipación, badge de canal, input de mensaje opcional. Botón de eliminar. |
| `OverlapWarning` | Banner naranja que aparece en el formulario cuando el sistema detecta solapamiento con otro evento. Muestra el nombre del evento conflictivo. No bloquea el guardado. |
| `NotificationCard` | Card en el historial: nombre del evento, anticipación usada, hora de envío, canal, badge de estado (verde/amarillo/rojo) y mensaje enviado expandible. |
| `SnoozePanel` | Modal o dropdown que aparece desde una notificación en el historial: 4 botones (5, 10, 15, 30 min) para posponer. Deshabilitado si el evento ya comenzó. |
| `QuotaAlert` | Banner informativo en el dashboard cuando el usuario tiene >= 450 eventos activos. |
| `CronTrigger` | Botón en `/admin/db-setup` para disparar el motor manualmente (útil en plan gratuito de Vercel sin cron frecuente). |

### Diseño responsivo

| Dispositivo | Comportamiento |
|---|---|
| Computador (≥1024px) | Sidebar fijo. Calendarios completos. Formulario de evento en panel lateral derecho. |
| Tablet (768–1023px) | Sidebar colapsable. Vista semanal reducida a 5 días. |
| Celular (<768px) | Bottom navigation. Vista mensual por defecto. Vista diaria para detalle. Formulario en pantalla completa. |

---

## 19. Plan de fases de implementación

### Fase 1 — Bootstrap, Login, Registro y `dataService` base
> Rol: Ingeniero Fullstack Senior — Arquitecto del sistema y seguridad

| # | Tarea |
|---|---|
| 1.1 | Instalar: `bcryptjs jose @supabase/supabase-js @vercel/blob pg resend @types/bcryptjs @types/pg` |
| 1.2 | Crear proyecto en Supabase. Crear Blob Store privado en Vercel. Crear cuenta en Resend y obtener API key. Configurar todas las variables de entorno. |
| 1.3 | Crear `data/seed.json` con admin inicial (password `admin123` hasheado) y `system_config` por defecto. |
| 1.4 | Crear `supabase/migrations/0001_init_users.sql` con `users` y `system_config` y `_migrations`. |
| 1.5 | Crear `lib/supabase.ts`, `lib/blobAudit.ts` (getBlobToken lazy, withFileLock, get() del SDK), `lib/blobFiles.ts`, `lib/pgMigrate.ts`, `lib/seedReader.ts`. |
| 1.6 | Crear `lib/dataService.ts` con `getSystemMode`, auth de usuarios, `getSystemConfig` y `recordAudit`. |
| 1.7 | Crear `lib/auth.ts`, `lib/withAuth.ts`, `lib/withRole.ts`. `withAuth` agrega `Cache-Control: no-store`. |
| 1.8 | Crear `next.config.ts` con headers `no-store` para `/api/:path*`. |
| 1.9 | Crear `vercel.json` con la configuración del cron: `"*/5 * * * *"` en `/api/cron/process-reminders`. |
| 1.10 | Crear `lib/types.ts` y `lib/schemas.ts` con tipos y schemas Zod de auth (incluyendo validación de contraseña fuerte — RN-17). |
| 1.11 | Crear API Routes: `POST /api/system/bootstrap`, `GET /api/system/diagnose`, `GET /api/system/mode`, `POST /api/auth/login` (con bloqueo por intentos — RN-13 del doc: 5 intentos → 15 min), `POST /api/auth/register`, `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/change-password`. |
| 1.12 | Crear `lib/emailService.ts` con Resend: función `sendReminderEmail` y función `sendTestEmail`. |
| 1.13 | Crear `app/login/page.tsx` y `app/register/page.tsx` con la identidad visual de AgendaPro: layout dividido con gradiente violeta-rosa. |
| 1.14 | Actualizar `app/page.tsx`: redirige a `/dashboard` o `/login`. |
| 1.15 | `npm run typecheck` sin errores. Probar: registro → login → cookie HttpOnly → /api/system/mode retorna seed. |

---

### Fase 2 — Dashboard, Layout base y página de bootstrap
> Rol: Diseñador Frontend Obsesivo + Ingeniero de Sistemas

| # | Tarea |
|---|---|
| 2.1 | Crear componentes UI base: Button, Card, Badge, Toast, Modal, EmptyState, Table. |
| 2.2 | Configurar variables CSS de la paleta en `globals.css`. Inter con `next/font`. |
| 2.3 | Crear `AppLayout.tsx`: sidebar (desktop) con Inicio, Calendario, Eventos, Notificaciones, Reportes, Perfil. Admin ve además Administración. Bottom nav (mobile). |
| 2.4 | Crear `/admin/db-setup/page.tsx`: diagnóstico (Supabase, Blob, Resend test, migrations, conteos) + bootstrap + botón `CronTrigger` para disparar el motor manualmente. |
| 2.5 | Crear `SeedModeBanner.tsx` y `QuotaAlert.tsx`. |
| 2.6 | Crear `GET /api/dashboard`: próximos 7 días de eventos, recordatorios del día, alerta de cuota si >= 450 eventos activos. En modo seed retorna estructura vacía. |
| 2.7 | Crear `app/dashboard/page.tsx`: próximos eventos con barra de tiempo, recordatorios de hoy y acceso rápido a crear evento. |
| 2.8 | Crear `middleware.ts`: protege rutas privadas, verifica `role = admin` para `/admin/*`. |
| 2.9 | Probar: registro → ver dashboard → login admin → bootstrap → `CronTrigger` en db-setup → verificar que el cron responde correctamente. |

---

### Fase 3 — Gestión de Eventos
> Rol: Ingeniero Fullstack — Módulo central de la agenda

| # | Tarea |
|---|---|
| 3.1 | Crear `supabase/migrations/0002_init_events.sql`. Aplicar desde `/admin/db-setup`. |
| 3.2 | Crear `lib/eventService.ts`: `detectOverlap`. |
| 3.3 | Agregar tipos `Event`, `EventWithDetails`, `EventAttachment`, `CreateEventRequest`, `UpdateEventRequest` y schemas Zod (RN-02 — fecha futura, RN-07 — advertencia solapamiento). |
| 3.4 | Extender `dataService`: `getEvents`, `getEventById`, `createEvent` (verifica cuota RN-15, verifica solapamiento RN-07), `updateEvent`, `deleteEvent` (borra adjuntos de Blob primero — RN-06), `completeEvent` (marca archived_at = NOW() — RN-09), `getActiveEventCount`, `uploadAttachment` (valida tipo y tamaño), `deleteAttachment`. |
| 3.5 | API Routes: `GET/POST /api/events`, `GET/PUT/DELETE /api/events/[id]`, `POST /api/events/[id]/complete`, `POST/DELETE /api/events/[id]/attachments`. |
| 3.6 | Crear `app/events/new/page.tsx` y `app/events/[id]/edit/page.tsx` con `EventForm`: formulario completo por pestañas (Detalles / Recordatorios / Adjuntos). `OverlapWarning` en tiempo real al cambiar la fecha/hora. |
| 3.7 | Crear `app/events/page.tsx`: listado con búsqueda y filtros. Separación entre eventos pendientes y completados. |
| 3.8 | Crear `app/events/[id]/page.tsx`: detalle completo del evento con adjuntos (servidos vía `/api/events/[id]/attachments` que lee de Blob), recordatorios y historial de notificaciones del evento. |
| 3.9 | Verificar que los archivos adjuntos en Blob se sirven siempre a través de la API (nunca exponiendo la URL directa de Blob). |

---

### Fase 4 — Calendario (3 vistas)
> Rol: Diseñador Frontend Obsesivo — Visualización de agenda

| # | Tarea |
|---|---|
| 4.1 | Crear `GET /api/calendar?from=&to=` que devuelve todos los eventos del usuario en el rango (optimizado para el calendario — solo los campos visuales: id, title, start_at, end_at, category, priority, status). |
| 4.2 | Crear `components/calendar/MonthView.tsx`: cuadrícula mensual. Cada día muestra hasta 2 eventos con su color de categoría y un indicador "+N más". Click en el día navega a la vista diaria. |
| 4.3 | Crear `components/calendar/WeekView.tsx`: cuadrícula de 7 columnas × franja horaria. Los eventos son bloques de altura proporcional a su duración. |
| 4.4 | Crear `components/calendar/DayView.tsx`: línea de tiempo por horas del día seleccionado. Los eventos urgentes tienen un borde rojo pulsante (Framer Motion). |
| 4.5 | Crear `app/calendar/page.tsx` (mensual por defecto), `app/calendar/week/page.tsx` y `app/calendar/day/page.tsx`. Incluir navegación entre vistas y entre fechas. |
| 4.6 | Integrar los eventos del calendario en el `EventForm` para que al hacer clic en una franja vacía del calendario abra el formulario pre-llenado con la fecha y hora seleccionada. |

---

### Fase 5 — Recordatorios y Motor de Notificaciones
> Rol: Ingeniero Fullstack Senior — Motor automático y correos transaccionales

| # | Tarea |
|---|---|
| 5.1 | Crear `supabase/migrations/0003_init_reminders.sql`. Aplicar desde `/admin/db-setup`. |
| 5.2 | Crear `lib/reminderEngine.ts`: `selectPendingReminders`, `processReminder`, `buildEmailContent`, `recalculateRemindersForEvent`. |
| 5.3 | Agregar tipos `Reminder`, `NotificationLog`, `CreateReminderRequest` y schemas Zod (RN-03 — máx 5, RN-04 — mín 5 min anticipación, RN-05 — canal obligatorio). |
| 5.4 | Extender `dataService`: `getReminders`, `createReminder` (valida RN-03, RN-04, RN-05, calcula `fire_at = event.start_at - anticipation_min`), `updateReminder`, `deleteReminder`, `snoozeReminder` (valida RN-08 — evento no comenzado, actualiza `fire_at = NOW() + snooze_min`), `getNotificationHistory`, y todas las funciones del motor. |
| 5.5 | En `updateEvent` (cuando cambia `start_at`): llamar `reminderEngine.recalculateRemindersForEvent` para actualizar todos los `fire_at` — RF-05. |
| 5.6 | Crear `app/api/cron/process-reminders/route.ts`: endpoint protegido con `CRON_SECRET`. Llama al motor completo con reintentos. |
| 5.7 | API Routes: `GET/POST /api/reminders` (del evento), `PUT/DELETE /api/reminders/[id]`, `POST /api/reminders/[id]/snooze`, `GET /api/notifications`. |
| 5.8 | El formulario de evento (`EventForm`, Fase 3) ya tiene la pestaña de recordatorios. Conectarla con la API real en esta fase. |
| 5.9 | Crear `app/notifications/page.tsx`: historial con `NotificationCard` y `SnoozePanel`. |
| 5.10 | Probar el flujo completo end-to-end: crear evento con recordatorio de 5 min → esperar o ajustar `fire_at` manualmente → disparar el motor desde el botón de admin → verificar que llega el correo en Resend → verificar el log en la base de datos. |

---

### Fase 6 — Búsqueda, Filtros y Reportes
> Rol: Ingeniero Fullstack + Diseñador Frontend

| # | Tarea |
|---|---|
| 6.1 | Mejorar `GET /api/events` para soportar query params: `search=`, `category=`, `priority=`, `status=`, `from=`, `to=`. La búsqueda por texto usa `ILIKE %query%` en `title` y `description`. |
| 6.2 | Crear `app/events/page.tsx` (actualizar): barra de búsqueda con resultados en tiempo real (debounce 300ms), panel de filtros colapsable. |
| 6.3 | Crear `lib/reportService.ts`: `buildUserReport` (stats del período), `generateCSV` (exporta como string CSV). |
| 6.4 | Extender `dataService`: `getUserReport`, `getGlobalReport` (admin). |
| 6.5 | API Routes: `GET /api/reports/my?from=&to=&category=`, `GET /api/reports/global?from=&to=` (admin), `GET /api/reports/export?from=&to=&format=csv`. |
| 6.6 | Crear `app/reports/page.tsx`: selector de fechas, cards de métricas (eventos creados, completados, cancelados, tasa de cumplimiento, recordatorios enviados), gráfica simple de categorías (barras con Recharts o CSS puro). Botón "Exportar CSV". |
| 6.7 | Instalar `recharts` para la gráfica de distribución por categoría. |

---

### Fase 7 — Administración de Usuarios y Configuración Global
> Rol: Ingeniero Fullstack Senior

| # | Tarea |
|---|---|
| 7.1 | API Routes con `withRole(['admin'])`: `GET/POST /api/users`, `GET/PUT /api/users/[id]`, `GET/PUT /api/admin/config`. |
| 7.2 | El POST de usuario: `crypto.randomBytes` para contraseña temporal, `must_change_password=true`, retorna contraseña en claro una sola vez con modal. |
| 7.3 | Crear `app/admin/users/page.tsx`: tabla de usuarios (sin datos privados de eventos). Acciones: activar/desactivar, crear, restablecer contraseña. |
| 7.4 | Crear `app/admin/config/page.tsx`: formulario con los parámetros de `system_config`. Cualquier cambio actualiza la DB y se refleja en el próximo ciclo del motor. |
| 7.5 | Crear `app/admin/reports/page.tsx`: métricas globales del sistema (usuarios activos, volumen de eventos, tasa de entrega de notificaciones). |
| 7.6 | Crear `app/admin/audit/page.tsx`: `AuditViewer` con selector de mes. |

---

### Fase 8 — Pulido final y Deploy
> Rol: Diseñador Frontend Obsesivo + Ingeniero Fullstack

| # | Tarea |
|---|---|
| 8.1 | Auditoría de empty states: calendario sin eventos (invitación a crear el primero), historial de notificaciones vacío, reportes sin datos para el período. Mensajes acordes al tono de AgendaPro. |
| 8.2 | Manejo de errores global: 401, 403, 409 (conflicto de horario con detalle del evento — no toast genérico), 500. |
| 8.3 | Verificar que el motor de notificaciones funciona correctamente en producción: crear evento con recordatorio de 10 min → esperar → verificar correo en Resend → verificar log. |
| 8.4 | Verificar RN-15 (cuota de 500 eventos): crear eventos hasta 450 → verificar `QuotaAlert` en dashboard → llegar a 500 → verificar que no permite crear más. |
| 8.5 | Verificar ventana horaria (RN-10): crear recordatorio para las 23:30 → disparar motor → verificar que queda en `pendiente_horario` y se despacha a las 06:00 del día siguiente. |
| 8.6 | Verificar que el admin no puede ver el contenido privado de los eventos (RN-12): testear las API routes de admin directamente. |
| 8.7 | `npm run typecheck`, `npm run lint`, `npm run build` — cero errores. |
| 8.8 | Deploy en Vercel con todas las variables de entorno, incluyendo `CRON_SECRET` y `RESEND_API_KEY`. |
| 8.9 | Verificar que el cron aparece en el dashboard de Vercel y se ejecuta correctamente. |
| 8.10 | Probar el flujo completo end-to-end en producción: registro → crear evento → configurar recordatorio → esperar correo → posponer con snooze → marcar evento como completado. |

---

## 20. Estrategia de seguridad

### Flujo de login con bloqueo por intentos

```
1. Validar body con Zod (loginSchema con requisitos de contraseña)
2. dataService.getUserByEmail(email)
3. Verificar is_active (is_active = true)
4. Verificar si locked_until > NOW() → retornar 429 "Cuenta bloqueada por X minutos"
5. Verificar password con bcrypt.compare()
6. Si falla: incrementLoginAttempts(userId)
   Si login_attempts >= 5: SET locked_until = NOW() + 15 min
   Retornar error genérico (nunca especificar si es el correo o la contraseña)
7. Si éxito: resetLoginAttempts(userId)
8. JWT({ userId, role, email, timezone }, '30m') → cookie HttpOnly, Secure, SameSite=Strict
9. recordAudit({ action: 'login' })
10. Retornar SafeUser
```

### Protección del endpoint del cron

```typescript
// Solo Vercel Cron puede llamar este endpoint
if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Privacidad de datos del usuario

Todas las queries de admin que involucran eventos devuelven solo: `id, user_id, start_at, status, category`. Nunca `title, description, location`. Esta restricción está implementada en `dataService` con una función separada `getEventStatsForAdmin` que hace `SELECT id, user_id, start_at, status, category` sin los campos privados.

---

## 21. Restricciones y trabajo futuro

### Restricciones de la v1

| ID | Restricción | Descripción |
|---|---|---|
| RS-01 | Solo notificaciones por correo | SMS y push en v2. El campo `channel` en la BD acepta solo 'email' en v1. |
| RS-02 | Sin verificación de correo | La cuenta se activa inmediatamente al registrarse. Verificación por correo en v2. |
| RS-03 | Sin recuperación de contraseña por email | Solo cambio de contraseña autenticado en v1. Recuperación por link en v2 (mismo flujo que verificación). |
| RS-04 | Sin sincronización con calendarios externos | Google Calendar y Outlook en v2. El campo `is_synced` existe en la BD para cuando se implemente. |
| RS-05 | Cron cada 5 minutos | Requiere Vercel Pro. En Hobby plan, disparar manualmente desde el panel admin. |
| RS-06 | Sin modo offline | No hay PWA ni sincronización local en v1. |
| RS-07 | Sin banner de sesión expirando | JWT de 30 min se maneja silenciosamente. El banner de "2 min antes" es v2. |
| RS-08 | Reportes solo en CSV | Sin PDF en v1. |
| RS-09 | Bootstrap obligatorio | Hasta no aplicar migrations + seed, solo permite login admin. |

---

## 22. Glosario

| Término | Definición |
|---|---|
| **Evento** | Cualquier compromiso programado con fecha, hora y datos asociados. |
| **Recordatorio** | Configuración que define cuándo y cómo alertar al usuario antes de un evento. |
| **fire_at** | Timestamp UTC en el que el motor debe disparar un recordatorio. Calculado como `event.start_at - anticipation_min`. |
| **Motor de notificaciones** | API Route `/api/cron/process-reminders` llamada automáticamente por Vercel Cron cada 5 minutos. |
| **Snooze** | Posponer un recordatorio ya activo por un tiempo adicional. |
| **Ventana horaria** | Período 06:00–22:00 en el que se pueden enviar correos y SMS. |
| **pendiente_horario** | Estado de un recordatorio cuyo `fire_at` calculado está fuera de la ventana horaria. Se reencola para las 06:00 del día siguiente. |
| **is_synced** | Campo en `events` que indica si el evento fue importado de un calendario externo. Los eventos sincronizados no son editables en v1. |
| **archived_at** | Timestamp de cuándo se marcó un evento como completado. Los eventos se conservan 90 días después de ese momento. |
| **Resend** | Servicio de email transaccional usado para enviar los correos de recordatorio. |
| **Vercel Cron** | Tarea programada configurada en `vercel.json` que llama a una API Route de forma periódica. |
| **Bootstrap** | Proceso inicial donde el admin aplica migrations y carga el seed. |
| **Modo seed** | Estado antes del bootstrap. Solo permite login admin. |
| **dataService** | Único punto de acceso a datos. Encapsula Supabase, Blob y el seed reader. |
| **JWT** | JSON Web Token — credencial firmada en cookie HttpOnly. |
| **UTC** | Zona horaria universal en la que se almacenan todas las fechas en Postgres. |

---

> Última actualización: Mayo 2026
> Valerie Samper — Doc: 1128127186
> Curso: Lógica y Programación — SIST0200
