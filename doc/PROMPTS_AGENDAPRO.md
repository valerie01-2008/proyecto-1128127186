# PROMPTS DE IMPLEMENTACIÓN — AgendaPro
> Prompts secuenciales para construir el sistema fase por fase
> Plan de referencia: `doc/PLAN_AGENDAPRO.md`
> Estado de progreso: `doc/ESTADO_EJECUCION_AGENDAPRO.md`

---

## INSTRUCCIONES DE USO

1. Ejecuta primero el **Prompt 0** — crea el archivo de seguimiento del proyecto.
2. Para cada fase siguiente, copia el bloque completo y pégalo en tu sesión de IA.
3. La IA leerá el plan, ejecutará la fase y dejará el estado actualizado.
4. No avances a la siguiente fase hasta que el resumen esté generado y el estado marcado como completado.

---

## PROTOCOLO DE EJECUCIÓN — APLICA A TODOS LOS PROMPTS

```
ANTES de escribir código:
1. Leer doc/PLAN_AGENDAPRO.md
2. Leer doc/ESTADO_EJECUCION_AGENDAPRO.md
3. Verificar que las fases previas estén completadas
4. Registrar inicio: estado En progreso + fecha y hora

DESPUÉS de completar el trabajo:
5. Registrar cierre: estado Completada + fecha y hora
6. Documentar: acciones ejecutadas, archivos creados/modificados, observaciones
7. Crear doc/RESUMEN_FASE_N_NOMBRE.md con: objetivo, acciones, archivos,
   decisiones técnicas y por qué, problemas encontrados y resolución,
   qué se probó y resultado, estado final EXITOSO / CON OBSERVACIONES / FALLIDO,
   prerrequisitos para la siguiente fase

NUNCA avanzar sin completar este protocolo.
```

---

---

## PROMPT 0 — Crear archivo de estado del proyecto

```
Actúa como Ingeniero de Proyectos. Tu única tarea es leer doc/PLAN_AGENDAPRO.md
y crear el archivo doc/ESTADO_EJECUCION_AGENDAPRO.md.

El archivo debe contener:
- Información del proyecto: nombre, archivos de referencia, estudiante,
  fecha de inicio, estado general
- Dashboard de fases: tabla con todas las fases del plan incluyendo número,
  nombre, rol asignado, estado (todas inician como Pendiente), columnas para
  fecha de inicio, fecha de cierre y archivo de resumen
- Leyenda de estados: Pendiente, En progreso, Completada, Bloqueada, Pausada
- Historial de ejecución: sección append-only con fecha, hora, fase, evento y detalle

Toma los datos directamente del plan. No inventes fases ni cambies nombres ni roles.

Cuando termines escribe en el chat el nombre de cada fase detectada y confirma
que el archivo está listo para comenzar la Fase 1.

Tu trabajo termina aquí.
```

---

---

## PROMPT FASE 1 — Bootstrap, Login, Registro y `dataService` base

### Rol: `Ingeniero Fullstack Senior — Arquitecto del sistema, persistencia, correo y seguridad`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en
arquitectura de persistencia serverless, autenticación segura con JWT,
integración de servicios de correo transaccional y diseño de la primera
experiencia visual del usuario en aplicaciones de productividad personal.

Tu mentalidad: AgendaPro tiene un componente que los demás proyectos no tienen:
el motor de notificaciones. Ese motor depende de que el stack de persistencia
esté perfectamente configurado desde el primer día — si fire_at se guarda en
la zona horaria equivocada, los correos llegarán a la hora equivocada. La
arquitectura UTC + conversión a zona horaria local del usuario es crítica y
debe establecerse en esta fase.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_AGENDAPRO.md — secciones 8 (stack y variables de entorno —
   nota que incluye RESEND_API_KEY, RESEND_FROM_EMAIL y CRON_SECRET además
   de las variables estándar), 9 (reglas de oro de persistencia), 10
   (estructura del seed.json con system_config y la configuración del cron
   en vercel.json), 11 (estructura interna de lib/ — nota lib/emailService.ts
   y lib/reminderEngine.ts), 14 (blobAudit y blobFiles), y 18 (identidad
   visual del login/registro con layout dividido)
2. doc/ESTADO_EJECUCION_AGENDAPRO.md — registra el inicio de la Fase 1

Puntos críticos que no puedes ignorar:

— AgendaPro tiene registro público — cualquier persona puede crear una cuenta.
  Al registrarse, el rol asignado siempre es 'user'. Nunca permitir que el
  cliente envíe el rol. En v1 la cuenta se activa inmediatamente sin
  verificación de correo (RS-02 del plan).

— El JWT expira en 30 minutos (RN-13). En v1 sin el banner de advertencia
  de "2 min antes" — eso es trabajo futuro. El JWT corto significa que el
  cliente necesita renovar la sesión con frecuencia. Asegurarse de que el
  middleware maneja el 401 con redirect a /login sin perder el contexto.

— RN-17: las contraseñas deben cumplir: mínimo 8 caracteres, 1 mayúscula,
  1 minúscula, 1 número. El schema Zod debe validar con una regex completa
  y mostrar un mensaje descriptivo al usuario cuando no cumple.

— El login tiene bloqueo por intentos (CU-02 del plan): tras 5 intentos
  fallidos consecutivos, SET locked_until = NOW() + 15 min. En cada intento
  de login, verificar si locked_until > NOW() antes de verificar la contraseña.
  La tabla users tiene los campos login_attempts y locked_until para esto.

— El token de Blob se accede siempre con getBlobToken() como función lazy,
  nunca como constante de módulo.

— La auditoría usa get() del SDK de @vercel/blob, nunca fetch(url).

— lib/emailService.ts usa Resend. La función sendReminderEmail recibe
  { to, subject, html } y retorna { success: boolean, error?: string }.
  En esta fase también crear sendTestEmail para poder verificar que la
  integración con Resend funciona desde el panel de admin.

— RN-14: TODAS las fechas se almacenan en UTC en Postgres (TIMESTAMPTZ).
  lib/dateUtils.ts debe tener funciones para: convertir Date a UTC,
  presentar TIMESTAMPTZ al usuario en su timezone en formato DD/MM/AAAA HH:MM,
  y calcular si una hora UTC cae dentro de la ventana 06:00–22:00 en la
  timezone del usuario.

— Crear vercel.json con la configuración del cron:
  { "crons": [{ "path": "/api/cron/process-reminders", "schedule": "*/5 * * * *" }] }
  El endpoint del cron no existe aún en esta fase, pero la configuración
  debe estar desde el principio para que Vercel la reconozca al desplegar.

— La identidad visual del login no es opcional: layout dividido (panel
  izquierdo con gradiente violeta-rosa y features, panel derecho con
  formulario), logo de calendario con rayo. El plan describe todo en
  la sección 18.

Al terminar:
- npm run typecheck — cero errores
- Probar: registro de nuevo usuario → cuenta activa inmediatamente → login →
  cookie HttpOnly con expiración de 30 min → /api/system/mode retorna 'seed'
- Probar bloqueo por intentos: 5 logins fallidos → 6to intento retorna 429
  con "Cuenta bloqueada"
- Verificar que sendTestEmail llega correctamente a Resend
- Registra el cierre en ESTADO_EJECUCION_AGENDAPRO.md
- Crea doc/RESUMEN_FASE_1_BOOTSTRAP.md

Tu trabajo termina aquí. No avances a la Fase 2.
```

---

---

## PROMPT FASE 2 — Dashboard, Layout base y página de bootstrap

### Rol: `Diseñador Frontend Obsesivo + Ingeniero de Sistemas`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero de Sistemas
trabajando en conjunto. AgendaPro tiene un solo tipo de usuario (aparte del
admin), pero su dashboard es la vista que verá varias veces al día — al abrir
la app por la mañana, a mitad del día para revisar, y antes de dormir para
planear el día siguiente. Tiene que responder "¿qué tengo hoy y qué viene
pronto?" en segundos.

Tu mentalidad: el dashboard de AgendaPro no es un tablero de métricas. Es
una ventana a la agenda del día. Los próximos eventos y los recordatorios
de hoy son lo primero que debe aparecer, sin tener que navegar.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_AGENDAPRO.md — paleta de colores (sección 18 — violeta y rosa
   como colores primarios, colores por categoría de evento), componentes clave
   (QuotaAlert, CronTrigger, SeedModeBanner), el endpoint /api/dashboard y
   la Fase 2 del plan
2. doc/ESTADO_EJECUCION_AGENDAPRO.md — verifica Fase 1 completada, registra
   inicio de Fase 2

Puntos críticos que no puedes ignorar:

— El sidebar de AgendaPro es el mismo para usuarios y admin, con una sección
  extra "Administración" al final solo para admins. Los ítems son: Inicio,
  Calendario, Eventos, Notificaciones, Reportes, Perfil, y para admin:
  Administración.

— El componente CronTrigger es un botón en /admin/db-setup que llama
  manualmente a POST /api/cron/process-reminders con el CRON_SECRET en el
  header. Sirve para demostrar el motor sin esperar el cron automático y
  es especialmente importante para el plan gratuito de Vercel donde el
  cron es diario. Mostrar el resultado de la petición (cuántos recordatorios
  procesados, cuántos enviados).

— El QuotaAlert aparece en el dashboard cuando el usuario tiene >= 450 eventos
  activos (el 90% del límite de 500). El cálculo lo hace /api/dashboard. En
  este punto no hay eventos aún, pero el componente debe estar listo.

— La página /admin/db-setup también verifica el estado de Resend: un pequeño
  test de conexión (llamada a la API de Resend para verificar que la API key
  es válida, sin enviar correo). Mostrar ✅ "Resend operativo" o ❌ con el error.

— El middleware.ts protege /admin/* para role='admin'. Protege todas las demás
  rutas privadas para cualquier usuario autenticado.

Al terminar:
- Probar el flujo completo: registro → dashboard (debe mostrar estructura vacía
  limpia) → login admin → /admin/db-setup → ejecutar bootstrap → mode=live →
  SeedModeBanner desaparece
- Verificar que CronTrigger funciona y retorna respuesta del motor
- Verificar responsive en 375px, 768px y 1280px
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_2_DASHBOARD.md

Tu trabajo termina aquí. No avances a la Fase 3.
```

---

---

## PROMPT FASE 3 — Gestión de Eventos

### Rol: `Ingeniero Fullstack — Módulo central de la agenda con adjuntos`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack especializado en gestión de
datos de agenda, manejo de archivos binarios en storage serverless y diseño
de formularios complejos con múltiples secciones.

Tu mentalidad: el evento es la entidad central de AgendaPro. Todo lo demás —
recordatorios, notificaciones, calendario, reportes — existe para darle valor
a los eventos. El formulario de creación de evento es el momento más
importante de la experiencia del usuario: complejo pero no intimidante.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_AGENDAPRO.md — migration 0002 con sus dos tablas (events y
   event_attachments), reglas RN-02, RN-06, RN-07, RN-09, RN-11, RN-14,
   RN-15, la API pública del dataService para eventos (sección 11.3),
   lib/eventService.ts (detectOverlap), y la Fase 3 del plan
2. doc/ESTADO_EJECUCION_AGENDAPRO.md — verifica Fases 1 y 2 completadas,
   registra inicio de Fase 3

Puntos críticos que no puedes ignorar:

— RN-14: start_at y end_at se guardan siempre en UTC en la columna
  TIMESTAMPTZ. Cuando el usuario ingresa la fecha y hora en el formulario,
  el cliente envía al servidor la fecha en la timezone del usuario. El servidor
  convierte a UTC antes de guardar. Al mostrar el evento, convierte de UTC a
  la timezone del usuario. dateUtils.ts maneja toda esta conversión. Nunca
  guardar fechas naive sin timezone.

— RN-02: un evento solo puede programarse para fecha igual o posterior al
  momento actual. La validación Zod en el servidor compara start_at (en UTC)
  con Date.now(). El formulario también valida en el cliente para dar feedback
  inmediato, pero la validación del servidor es la que importa.

— RN-07: el solapamiento es una advertencia, no un error. eventService.detectOverlap
  hace una query: SELECT id, title FROM events WHERE user_id=? AND status='pendiente'
  AND start_at < new_end_at AND (end_at IS NULL OR end_at > new_start_at)
  AND id != excludeId. Si el end_at del nuevo evento es null, usar start_at + 1
  hora como end_at estimado para el cálculo. El servidor retorna 200 con el
  evento creado PERO incluye en la respuesta { warnings: [{ type: 'overlap',
  conflictingEvent: { id, title } }] } para que el frontend muestre el
  OverlapWarning.

— RN-15: verificar count antes de crear. Si el usuario tiene >= 500 eventos
  activos (status='pendiente'), retornar 403 con { error: 'QUOTA_EXCEEDED',
  current: N, limit: 500 }.

— Los archivos adjuntos van en Vercel Blob en el path:
  attachments/<userId>/<eventId>/<filename>. Validar antes de subir: máximo
  3 adjuntos por evento, máximo 5 MB por archivo, tipos permitidos: imágenes
  (jpeg, png, gif, webp), PDF, documentos de Office. El endpoint
  POST /api/events/[id]/attachments recibe el archivo, valida, sube a Blob
  via blobFiles.ts, e inserta en event_attachments.

— Los archivos en Blob son privados. Nunca exponer la URL directa de Blob
  al cliente. Crear un endpoint GET /api/events/[id]/attachments/[attachmentId]
  que lee de Blob via get() del SDK y hace streaming al cliente con el
  Content-Type correcto y autenticación.

— Al eliminar un evento (RN-06): primero obtener todas las rutas de blob
  de event_attachments, eliminar cada archivo con blobFiles.deleteAttachment,
  luego el DELETE CASCADE de Postgres limpia reminders y notification_log.
  Registrar auditoría al final.

— RN-09: archived_at se establece cuando el usuario marca el evento como
  completado. Un cron (o query manual) puede limpiar eventos donde
  archived_at < NOW() - 90 días. En v1 esto no se automatiza — documentar
  como mantenimiento manual del admin.

Al terminar:
- Probar crear evento con solapamiento → verificar warning en respuesta y
  que el evento se creó de todas formas
- Probar cuota: no es fácil crear 500 eventos, pero sí verificar que el
  endpoint retorna 403 al llegar al límite (probar con el límite rebajado
  temporalmente o verificando el código)
- Probar subida de adjunto: subir PDF y imagen → verificar que se pueden
  descargar desde el endpoint de attachments → verificar que no se puede
  acceder a la URL directa de Blob
- Probar eliminar evento: verificar que los archivos se borran de Blob
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_3_EVENTOS.md

Tu trabajo termina aquí. No avances a la Fase 4.
```

---

---

## PROMPT FASE 4 — Calendario (tres vistas)

### Rol: `Diseñador Frontend Obsesivo — Visualización de agenda en diaria, semanal y mensual`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo especializado en
componentes de calendario, visualización de eventos en líneas de tiempo y
diseño de interfaces de agenda que se usan en pantallas pequeñas.

Tu mentalidad: el calendario es la cara pública de la agenda. El usuario
pasa tiempo aquí viendo sus eventos, eligiendo fechas y navegando entre días.
Un calendario con eventos que se superponen mal, colores que no distinguen
categorías o franjas horarias difíciles de leer en mobile es un fracaso de
diseño. Cada vista tiene su propósito y debe ser excelente en él.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_AGENDAPRO.md — paleta de colores por categoría (personal=violeta,
   trabajo=azul, salud=verde, educación=ámbar, otro=gris), los componentes
   MonthView, WeekView y DayView (sección 18), el endpoint /api/calendar
   y la Fase 4 del plan
2. doc/ESTADO_EJECUCION_AGENDAPRO.md — verifica Fases 1 a 3 completadas,
   registra inicio de Fase 4

Puntos críticos que no puedes ignorar:

— GET /api/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD retorna solo los campos
  visuales del evento: { id, title, start_at, end_at, category, priority,
  status }. NUNCA description, location ni attachment_path — no son necesarios
  para el calendario y omitirlos mejora el rendimiento.

— Los eventos urgentes tienen un borde rojo pulsante en todas las vistas
  (Framer Motion: animation pulse continuo con opacity 0.6→1). Es la señal
  visual más importante del sistema — el usuario debe notar los urgentes
  de inmediato.

— MonthView: cada día muestra hasta 2 eventos. Si hay más, muestra "+N más"
  que al hacer clic expande una lista popup. Los días con eventos tienen un
  punto de color por categoría. Al hacer clic en un día vacío, navega a la
  vista diaria de ese día.

— WeekView: los eventos son bloques posicionados con top y height proporcional
  a su duración. Si end_at es null, el bloque tiene altura mínima de 30 min.
  Los eventos que se solapan se muestran en columnas lado a lado (calcular
  las columnas basándose en overlaps).

— DayView: línea de tiempo por horas (00:00 a 23:59). La hora actual se
  muestra con una línea roja horizontal. Los eventos pasados tienen opacity
  reducida (0.6).

— Todas las horas que se muestran al usuario son en su timezone
  (dateUtils.ts). El server retorna UTC, el cliente convierte para mostrar.
  Nunca mostrar horas UTC al usuario.

— Al hacer clic en una franja horaria vacía del calendario (WeekView o
  DayView), navegar a /events/new?date=YYYY-MM-DD&time=HH:MM para
  pre-llenar la fecha y hora en el formulario.

Al terminar:
- Crear varios eventos en distintas categorías → verificar que los colores
  son correctos en las tres vistas
- Crear un evento urgente → verificar el pulso animado
- Probar navegación entre semanas y meses
- Verificar que las horas se muestran en la zona horaria del usuario
  (crear un usuario con timezone America/New_York y verificar que los
  eventos aparecen 5 horas antes que UTC)
- Verificar la vista diaria en 375px: franjas usables con el dedo
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_4_CALENDARIO.md

Tu trabajo termina aquí. No avances a la Fase 5.
```

---

---

## PROMPT FASE 5 — Recordatorios y Motor de Notificaciones

### Rol: `Ingeniero Fullstack Senior — Motor de recordatorios automáticos por correo`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en sistemas
de notificaciones automáticas, integración de servicios de correo transaccional
y diseño de motores de procesamiento por lotes en entornos serverless.

Tu mentalidad: el motor de notificaciones es la promesa central de AgendaPro.
"Cero olvidos" solo funciona si el motor encuentra los recordatorios correctos,
respeta la ventana horaria del usuario, envía el correo, maneja los fallos con
reintentos y registra todo con precisión. Un recordatorio que se envía a las
3am despierta al usuario. Uno que falla sin retentivas se pierde. La
implementación de este módulo define si el producto cumple su promesa.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_AGENDAPRO.md — migration 0003 con reminders y notification_log,
   reglas RN-03 al RN-05, RN-08, RN-10, RN-13 (ventana horaria), RN-16
   (reintentos), la arquitectura completa del motor (sección 13 — diagrama
   de flujo del procesamiento), lib/reminderEngine.ts (todas las funciones),
   y la Fase 5 del plan
2. doc/ESTADO_EJECUCION_AGENDAPRO.md — verifica Fases 1 a 4 completadas,
   registra inicio de Fase 5

Puntos críticos que no puedes ignorar:

— fire_at se calcula al crear un recordatorio: fire_at = event.start_at -
  anticipation_min (en UTC, ambos son UTC). Cuando el usuario edita la
  fecha/hora del evento, recalculateRemindersForEvent recalcula fire_at para
  cada recordatorio: nuevo_fire_at = new_start_at - anticipation_min.
  Si el nuevo fire_at es en el pasado, ese recordatorio queda obsoleto —
  marcar su status como 'enviado' para que el motor no lo procese.

— La ventana horaria (RN-10) funciona así en el motor:
  (1) Tomar fire_at del recordatorio (UTC).
  (2) Convertir a la timezone del usuario: hora_local = toZonedTime(fire_at, user.timezone).
  (3) Extraer la hora: hora = hora_local.getHours() + minutos/60.
  (4) Si hora < 6.0 (antes de 06:00) o hora >= 22.0 (después de 22:00):
      Calcular la próxima ventana válida: si es antes de las 06:00 del mismo día,
      nuevo_fire_at = start_of_day(fire_at, user.timezone) + 6h (UTC equivalente).
      Si es después de las 22:00, nuevo_fire_at = start_of_next_day(fire_at,
      user.timezone) + 6h (UTC equivalente).
      UPDATE reminders SET fire_at = nuevo_fire_at, status = 'pendiente_horario'
  (5) Si está dentro de la ventana: proceder con el envío.

— El endpoint POST /api/cron/process-reminders:
  PRIMERO verificar el header Authorization: Bearer ${CRON_SECRET}. Si no
  coincide → 401. Sin excepciones.
  LUEGO: getPendingReminders() con fire_at <= NOW() AND status IN
  ('pendiente', 'pendiente_horario'). Para cada uno, processReminder.
  TAMBIÉN: getPendingRetries() con status='reintentando' AND next_retry_at <= NOW().
  Retornar resumen: { processed, sent, postponed_by_window, failed, retried }.

— Los reintentos (RN-16): cuando emailService.sendReminderEmail retorna
  { success: false }, insertar en notification_log con status='reintentando',
  retry_count=1, next_retry_at=NOW()+2min. En el próximo ciclo del cron,
  getPendingRetries los incluye. Si retry_count >= system_config.max_retry_attempts
  (default 3): marcar notification_log.status='no_entregada' y
  reminders.status='no_entregada'.

— El snooze (RN-08): verificar que event.start_at > NOW() antes de posponer.
  Si el evento ya comenzó → 409. Si no: UPDATE reminders SET fire_at =
  NOW() + snooze_minutes, status = 'pendiente'. El snooze reactiva un
  recordatorio ya enviado — verificar que el status actual sea 'enviado'
  antes de permitir el snooze. No se puede snooze un recordatorio 'pendiente'.

— buildEmailContent usa el custom_message si está definido, o la plantilla
  automática. La plantilla incluye: título del evento, la anticipación en
  lenguaje natural ("en 1 hora", "en 30 minutos", "mañana"), la hora formateada
  en la timezone del usuario, el lugar si existe, y un pie con "AgendaPro".
  El HTML debe verse bien en clientes de correo (tablas simples, sin flexbox,
  sin grid). Probar en Gmail al menos.

— En /api/events/[id]/PUT (editar evento), si cambia start_at:
  llamar reminderEngine.recalculateRemindersForEvent(eventId, newStartAt)
  ANTES de retornar la respuesta. Si algún recordatorio recalculado quedó
  en el pasado, informar en los warnings de la respuesta.

Al terminar:
- El test más importante: crear evento con recordatorio de 10 minutos →
  esperar → disparar manualmente el motor con CronTrigger o ajustando
  fire_at en la DB → verificar que llega el correo en el inbox → verificar
  notification_log con status='entregada'
- Probar ventana horaria: crear recordatorio con fire_at a las 23:30 UTC
  (que sea noche en la timezone del usuario) → disparar motor → verificar
  que cambia a pendiente_horario y el fire_at se recalcula para las 06:00
- Probar reintento: forzar un fallo en Resend (API key incorrecta temporalmente)
  → disparar motor → verificar notification_log con status='reintentando' →
  restaurar API key → disparar de nuevo → verificar entrega
- Probar snooze: evento futuro, recordatorio enviado → snooze 15 min → verificar
  nuevo fire_at → probar snooze en evento ya comenzado → debe retornar 409
- Probar recalculación: crear evento con recordatorio → editar la hora del
  evento → verificar que fire_at del recordatorio se actualizó correctamente
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_5_RECORDATORIOS.md

Tu trabajo termina aquí. No avances a la Fase 6.
```

---

---

## PROMPT FASE 6 — Búsqueda, Filtros y Reportes

### Rol: `Ingeniero Fullstack + Diseñador Frontend — Consulta y métricas personales`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack y Diseñador Frontend trabajando
en conjunto. La búsqueda y los reportes son las herramientas que le dan al
usuario visibilidad de su productividad. El reporte de tasa de cumplimiento
le dice si AgendaPro está ayudando o solo acumulando eventos sin completar.

Tu mentalidad: la búsqueda debe ser rápida y tolerante. El usuario busca
"reunión cliente" sin saber el título exacto. Los filtros deben ser intuitivos
y no obstaculizar — un filtro mal diseñado hace que el usuario prefiera no
usarlo. El reporte debe ser honesto y motivador al mismo tiempo.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_AGENDAPRO.md — los campos searchables (title, description),
   los filtros disponibles (category, priority, status, rango de fechas),
   el reporte personal y sus métricas (sección 5 CU-17), lib/reportService.ts
   y la Fase 6 del plan
2. doc/ESTADO_EJECUCION_AGENDAPRO.md — verifica Fases 1 a 5 completadas,
   registra inicio de Fase 6

Puntos críticos que no puedes ignorar:

— La búsqueda por texto usa ILIKE en Postgres: WHERE (title ILIKE '%query%'
  OR description ILIKE '%query%') AND user_id = ?. Los eventos sincronizados
  (is_synced=true) también aparecen en la búsqueda — no hay razón para
  excluirlos.

— Los filtros se combinan con AND. Una query con category='salud' AND
  priority='urgente' AND status='pendiente' retorna solo eventos que cumplen
  los tres. Si el usuario no aplica un filtro, ese campo no va en la query.

— Debounce de 300ms en el input de búsqueda para no hacer query en cada
  keystroke. Usar useTransition de React o un setTimeout simple.

— La tasa de cumplimiento es: eventos_completados / (eventos_creados - eventos_cancelados) × 100.
  Si no hay eventos creados en el período, la tasa es null (no 0%).

— El CSV del reporte tiene estas columnas: ID, Título (omitido para admin),
  Categoría, Prioridad, Estado, Fecha de inicio, Fecha completado, Recordatorios
  enviados, Tasa de cumplimiento del período. Para el usuario propio, incluir
  el título. Para admin (reporte global), nunca incluir el título.

— El reporte de admin (GET /api/reports/global) retorna métricas agregadas:
  total de usuarios activos, total de eventos creados en el período, total
  de notificaciones enviadas, tasa de entrega (entregadas / total × 100),
  distribución por categoría. NUNCA retornar títulos ni descripciones de
  eventos individuales.

Al terminar:
- Crear varios eventos con distintas categorías, prioridades y estados
- Probar búsqueda: "reunión" → debe encontrar eventos con esa palabra en
  título o descripción
- Probar filtros combinados: category=trabajo AND status=completado
- Generar reporte propio y verificar las métricas
- Exportar CSV y verificar que se abre correctamente en Excel
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_6_BUSQUEDA_REPORTES.md

Tu trabajo termina aquí. No avances a la Fase 7.
```

---

---

## PROMPT FASE 7 — Administración de Usuarios y Configuración Global

### Rol: `Ingeniero Fullstack Senior — Panel admin y parámetros del motor`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en paneles
de administración de plataformas web con énfasis en privacidad de datos de
usuarios y configuración de sistemas automatizados.

Tu mentalidad: el admin de AgendaPro tiene una responsabilidad doble. Por un
lado, gestiona los usuarios de la plataforma. Por otro, controla los parámetros
del motor de notificaciones — si configura mal la ventana horaria o los
reintentos, afecta a todos los usuarios. Esa responsabilidad debe reflejarse
en la UI: confirmaciones antes de cambios que impacten el motor.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_AGENDAPRO.md — regla RN-12 (admin no puede ver contenido privado
   de eventos), RF-17 y RF-18, la tabla system_config y sus campos,
   y la Fase 7 del plan
2. doc/ESTADO_EJECUCION_AGENDAPRO.md — verifica Fases 1 a 6 completadas,
   registra inicio de Fase 7

Puntos críticos que no puedes ignorar:

— RN-12 es la restricción más crítica del módulo admin. Las API routes de
  admin que involucran eventos solo deben retornar:
  { id, user_id, start_at, end_at, category, priority, status, created_at }
  NUNCA { title, description, location, is_synced }. Implementar una función
  separada getEventStatsForAdmin en dataService que hace SELECT solo de esos
  campos. Prohibir explícitamente que el admin pueda llamar getEventById
  (que sí incluye título y descripción).

— El panel de gestión de usuarios muestra, por cada usuario: nombre, correo,
  timezone, plan (siempre 'user' o 'admin'), fecha de registro, total de
  eventos activos (COUNT, no el contenido), última sesión y estado.

— La configuración global (system_config) tiene campos sensibles para el
  motor: max_retry_attempts y retry_interval_minutes. Cambiar estos afecta
  a todos los recordatorios en cola. Mostrar una advertencia al guardar:
  "Los cambios en los parámetros del motor se aplicarán en el próximo ciclo
  del cron." El endpoint PUT /api/admin/config requiere withRole(['admin'])
  y registra auditoría.

— El admin también tiene acceso a /api/notifications (sin filtrar por userId
  cuando es admin) para ver el log global de notificaciones. Agregar un
  parámetro ?global=true que el admin puede pasar — verificar role='admin'
  en el endpoint antes de retornar datos de todos los usuarios.

— Crear usuario desde admin: mismo patrón que los demás proyectos — contraseña
  temporal con crypto.randomBytes, must_change_password=true, retornar en
  claro una sola vez con modal de advertencia.

Al terminar:
- Verificar que el admin no puede ver el título de los eventos de otros usuarios
  (testear directamente el endpoint /api/reports/global y cualquier otro
  endpoint de admin)
- Probar cambio de system_config → disparar CronTrigger → verificar que el
  motor usa los nuevos parámetros
- Probar crear usuario desde admin → usuario cambia contraseña en primer login
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_7_ADMIN.md

Tu trabajo termina aquí. No avances a la Fase 8.
```

---

---

## PROMPT FASE 8 — Pulido final y Deploy

### Rol: `Diseñador Frontend Obsesivo + Ingeniero Fullstack — Cierre del proyecto`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero Fullstack
trabajando en conjunto. Esta es la fase de cierre de AgendaPro.

Tu mentalidad: AgendaPro le promete al usuario "cero olvidos". Esa promesa
necesita que el sistema sea confiable en producción, que los correos lleguen,
que el motor procese los recordatorios correctamente y que la interfaz sea
clara en cualquier dispositivo. Esta fase no termina hasta que la promesa
del producto sea verificable de extremo a extremo en producción.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_AGENDAPRO.md — Fase 8 completa, requerimientos no funcionales
   (RNF-01 al RNF-08) y restricciones del sistema (sección 21)
2. doc/ESTADO_EJECUCION_AGENDAPRO.md — verifica Fases 1 a 7 completadas,
   registra inicio de Fase 8

Lo que debes completar en esta fase:

Empty states con mensajes de bienvenida acordes al tono del producto:
- Dashboard sin eventos próximos: "Tu agenda está despejada. ¿Qué tienes
  planeado?" con botón "+ Nuevo Evento".
- Calendario sin eventos en el período visible: mensaje sutil en los días
  vacíos, sin interferir con la grilla del calendario.
- Historial de notificaciones vacío: "Cuando tus recordatorios se envíen,
  los verás aquí."
- Búsqueda sin resultados: "No encontramos eventos para '[query]'. Prueba
  con otras palabras."
- Reporte sin datos en el período: "No hay eventos en este período. Crea
  tu primer evento y empieza a llevar el control de tu agenda."

Manejo de errores global:
- 401 (sesión expirada — JWT de 30 min puede expirar durante el uso):
  toast "Tu sesión expiró" + redirect a /login sin perder la URL actual.
- 403 QUOTA_EXCEEDED: modal (no toast) con: "Has alcanzado el límite de 500
  eventos activos. Archiva o elimina eventos para continuar." Con botón que
  lleva a /events?status=completado para facilitar el archivado.
- 409 de solapamiento de evento: no es un error, es un warning — mostrar
  con estilo visual distinto (naranja, no rojo).
- 429 de cuenta bloqueada: mensaje con cuánto tiempo falta para el desbloqueo.
- 500: toast genérico.

Verificación del motor end-to-end en producción:
Este es el test más importante de todo el proyecto. Ejecutarlo en producción,
no en local.
1. Crear evento para dentro de 10 minutos
2. Agregar recordatorio de 5 minutos antes (fire_at = event.start_at - 5 min)
3. Esperar a que el cron dispare (o usar CronTrigger)
4. Verificar que el correo llega al inbox del usuario
5. Verificar notification_log con status='entregada'
6. En la página de Notificaciones, verificar que aparece el registro con
   todos los datos correctos

Verificación de la ventana horaria en producción:
1. Crear recordatorio para las 23:00 en la timezone del usuario
2. Disparar el motor
3. Verificar que cambia a pendiente_horario y fire_at se actualiza a 06:00
4. Esperar o ajustar la hora del sistema → disparar motor → verificar envío

Verificación de timezone en la UI:
- Crear usuario con timezone America/New_York (UTC-5)
- Crear evento a las 10:00 AM New York (= 15:00 UTC)
- Verificar que el calendario muestra 10:00 AM, no 15:00

Para el cierre técnico:
- npm run typecheck — cero errores
- npm run lint — cero warnings
- npm run build — build exitoso
- Verificar que ningún componente cliente importa variables privadas ni
  módulos de lib/ directamente
- Verificar que el endpoint /api/cron/process-reminders retorna 401 si se
  llama sin el CRON_SECRET correcto
- Verificar que el admin no puede ver el título de eventos de otros usuarios
  probando los endpoints directamente

Deploy en Vercel con todas las variables de entorno:
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, BLOB_READ_WRITE_TOKEN,
JWT_SECRET, ADMIN_BOOTSTRAP_SECRET, RESEND_API_KEY, RESEND_FROM_EMAIL,
CRON_SECRET

Verificar que el cron aparece registrado en el dashboard de Vercel
(Settings → Cron Jobs). Si el plan es gratuito, el cron está limitado
a ejecuciones diarias — documentar este comportamiento en el RESUMEN
final y confirmar que el CronTrigger del admin sirve para la demo.

Al cerrar el proyecto:
- Registra la Fase 8 como Completada en ESTADO_EJECUCION_AGENDAPRO.md
  con la URL de producción en el historial
- Crea doc/RESUMEN_FASE_8_PULIDO_FINAL.md con: URL de producción, URL del
  repositorio, funcionalidades implementadas, stack (incluyendo Resend y
  Vercel Cron), tablas de Supabase creadas, decisiones técnicas destacadas
  (motor de notificaciones, ventana horaria UTC→local, bloqueo por intentos,
  privacidad del admin) y estado final del proyecto

El proyecto AgendaPro está terminado. Tu trabajo en este repositorio
concluye aquí.
```

---

> Valerie Samper — Doc: 1128127186
> Curso: Lógica y Programación — SIST0200
