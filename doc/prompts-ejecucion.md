# Prompts de Ejecución — Plan de Infraestructura Fullstack

> Cada prompt debe ejecutarse en orden. Antes de iniciar cualquier prompt, leer los tres documentos base obligatorios. Al iniciar, registrar el estado en `estado-ejecucion.md`. Al completar, documentar lo realizado en ese mismo archivo. Al finalizar cada fase, generar el archivo de resumen correspondiente.

---

## Documentos Base Obligatorios (leer siempre antes de ejecutar)

- `plan-infraestructura-fullstack.md` — Plan general de infraestructura
- `prompts-ejecucion.md` — Este archivo (contexto del flujo)
- `estado-ejecucion.md` — Estado actual de ejecución e historial

---

---

# FASE 1 — Fundamentos y Entorno Local

---

## Prompt 1.1 — Estructura del Repositorio

```
DOCUMENTOS A LEER PRIMERO:
- plan-infraestructura-fullstack.md
- prompts-ejecucion.md
- estado-ejecucion.md

ROL: Actúa como Ingeniero Fullstack Senior con experiencia en arquitectura de monorepos y configuración de entornos de desarrollo modernos.

AL INICIAR: Abre estado-ejecucion.md y registra en la sección "Historial de Ejecución":
- Prompt ID: 1.1
- Nombre: Estructura del Repositorio
- Estado: 🟡 En progreso
- Fecha/hora de inicio: [insertar timestamp]

TAREA:
Crea la estructura completa de carpetas del monorepo según la Fase 1 del plan de infraestructura. Incluye:
- Carpetas: /frontend, /backend, /infra, /docker, /.github, /docs
- Archivos base: README.md raíz, .gitignore global, .env.example con todas las variables necesarias
- Configuración de ESLint y Prettier compartidos en la raíz
- Archivo package.json raíz con scripts de workspace

CRITERIOS DE COMPLETADO:
- Estructura de carpetas creada y documentada
- README.md con guía de onboarding redactada
- .gitignore cubre node_modules, .env, dist, .next, __pycache__
- Scripts npm/yarn workspace funcionales

AL COMPLETAR: Actualiza estado-ejecucion.md:
- Estado del prompt 1.1: ✅ Completado
- Documenta: qué archivos se crearon, decisiones tomadas, problemas encontrados
```

---

## Prompt 1.2 — Contenerización con Docker

```
DOCUMENTOS A LEER PRIMERO:
- plan-infraestructura-fullstack.md
- prompts-ejecucion.md
- estado-ejecucion.md

ROL: Actúa como Ingeniero DevOps y Fullstack Senior especializado en contenerización con Docker y orquestación de servicios en entornos de desarrollo local.

AL INICIAR: Abre estado-ejecucion.md y registra en la sección "Historial de Ejecución":
- Prompt ID: 1.2
- Nombre: Contenerización con Docker
- Estado: 🟡 En progreso
- Fecha/hora de inicio: [insertar timestamp]

TAREA:
Crea la configuración completa de Docker para el entorno local de desarrollo:
- docker-compose.yml con servicios: frontend (Next.js), api (Node.js), db (PostgreSQL 16), redis, adminer
- Dockerfile multi-stage para frontend (dev y prod)
- Dockerfile multi-stage para backend (dev y prod)
- Volúmenes persistentes para PostgreSQL
- Red interna privada entre servicios
- Hot reload habilitado en frontend y backend
- Variables de entorno por archivo: .env.local, .env.staging, .env.production

CRITERIOS DE COMPLETADO:
- docker-compose up levanta todos los servicios sin errores
- Hot reload funciona en frontend y backend
- Base de datos persiste datos entre reinicios
- Adminer accesible en puerto local

AL COMPLETAR: Actualiza estado-ejecucion.md:
- Estado del prompt 1.2: ✅ Completado
- Documenta: servicios configurados, puertos asignados, variables de entorno definidas, problemas encontrados
```

---

## Prompt 1.3 — Base de Datos y Migraciones

```
DOCUMENTOS A LEER PRIMERO:
- plan-infraestructura-fullstack.md
- prompts-ejecucion.md
- estado-ejecucion.md

ROL: Actúa como Ingeniero Fullstack Senior con especialización en diseño de bases de datos relacionales, modelado de datos y gestión de migraciones con ORMs modernos.

AL INICIAR: Abre estado-ejecucion.md y registra en la sección "Historial de Ejecución":
- Prompt ID: 1.3
- Nombre: Base de Datos y Migraciones
- Estado: 🟡 En progreso
- Fecha/hora de inicio: [insertar timestamp]

TAREA:
Configura la capa de base de datos con Prisma ORM sobre PostgreSQL 16:
- Instalar y configurar Prisma en el backend
- Crear schema.prisma con modelos base: User, Role, Permission, AuditLog, Session
- Primera migración versionada: 001_initial_schema
- Script de seed para datos de desarrollo (usuarios de prueba, roles base)
- Configurar connection pooling básico
- Documentar el modelo de datos en /docs/database.md

CRITERIOS DE COMPLETADO:
- npx prisma migrate dev ejecuta sin errores
- npx prisma db seed puebla la base de datos
- Prisma Studio accesible
- Diagrama ERD generado o documentado

AL COMPLETAR: Actualiza estado-ejecucion.md:
- Estado del prompt 1.3: ✅ Completado
- Documenta: modelos creados, relaciones definidas, datos de seed, decisiones de diseño
```

---

## Prompt 1.4 — Autenticación Base

```
DOCUMENTOS A LEER PRIMERO:
- plan-infraestructura-fullstack.md
- prompts-ejecucion.md
- estado-ejecucion.md

ROL: Actúa como Ingeniero Fullstack Senior con experiencia en seguridad de aplicaciones web, implementación de sistemas de autenticación y gestión de sesiones seguras.

AL INICIAR: Abre estado-ejecucion.md y registra en la sección "Historial de Ejecución":
- Prompt ID: 1.4
- Nombre: Autenticación Base
- Estado: 🟡 En progreso
- Fecha/hora de inicio: [insertar timestamp]

TAREA:
Implementa el sistema de autenticación base:
- JWT con Access Token (15min) + Refresh Token (7 días) en httpOnly cookie
- Endpoints: POST /auth/register, POST /auth/login, POST /auth/refresh, POST /auth/logout
- Middleware de autenticación para rutas protegidas
- Guards de autorización por rol (RBAC básico)
- Hash de contraseñas con bcrypt (salt rounds: 12)
- Manejo seguro de errores sin revelar información sensible

CRITERIOS DE COMPLETADO:
- Login y registro funcionales con Postman/ThunderClient
- Refresh token rota correctamente
- Rutas protegidas rechazan tokens inválidos con 401
- Tests unitarios para los servicios de auth

AL COMPLETAR: Actualiza estado-ejecucion.md:
- Estado del prompt 1.4: ✅ Completado
- Documenta: endpoints creados, estrategia de tokens, roles implementados, tests escritos

AL COMPLETAR TODA LA FASE 1:
Verifica que los 4 prompts anteriores estén en estado ✅ Completado en estado-ejecucion.md.
Luego genera el archivo: resumen-fase-1.md con la siguiente estructura:
  - Resumen ejecutivo de la fase
  - Lista de entregables completados
  - Decisiones técnicas tomadas y su justificación
  - Problemas encontrados y cómo se resolvieron
  - Deuda técnica identificada
  - Métricas (archivos creados, tests escritos, etc.)
  - Próximos pasos (Fase 2)
```

---
---

# FASE 2 — CI/CD y Entornos de Staging

---

## Prompt 2.1 — Pipeline de CI con GitHub Actions

```
DOCUMENTOS A LEER PRIMERO:
- plan-infraestructura-fullstack.md
- prompts-ejecucion.md
- estado-ejecucion.md

ROL: Actúa como Ingeniero DevOps Senior especializado en automatización de pipelines CI/CD con GitHub Actions, gestión de ambientes y buenas prácticas de integración continua.

AL INICIAR: Abre estado-ejecucion.md y registra en la sección "Historial de Ejecución":
- Prompt ID: 2.1
- Nombre: Pipeline de CI con GitHub Actions
- Estado: 🟡 En progreso
- Fecha/hora de inicio: [insertar timestamp]

TAREA:
Crea los workflows de GitHub Actions para el pipeline de CI:
- .github/workflows/ci.yml — lint, test, build en PRs a develop y main
- .github/workflows/deploy-staging.yml — deploy automático en merge a develop
- .github/workflows/deploy-production.yml — deploy manual con aprobación en merge a main
- Configurar caché de dependencias (node_modules, Docker layers)
- Subir imagen al registry (GHCR) con tags semánticos
- Reportar cobertura de tests como comentario en PRs
- Configurar secrets en GitHub para credenciales

CRITERIOS DE COMPLETADO:
- Pipeline CI pasa en un PR de prueba
- Workflow deploy-staging se activa correctamente
- Imágenes Docker publicadas en GHCR
- Secrets configurados y funcionando

AL COMPLETAR: Actualiza estado-ejecucion.md:
- Estado del prompt 2.1: ✅ Completado
- Documenta: workflows creados, estrategia de branching, secrets configurados, tiempo promedio del pipeline
```

---

## Prompt 2.2 — Escaneo de Seguridad en Pipeline

```
DOCUMENTOS A LEER PRIMERO:
- plan-infraestructura-fullstack.md
- prompts-ejecucion.md
- estado-ejecucion.md

ROL: Actúa como Ingeniero DevSecOps con experiencia en integración de herramientas de análisis estático, escaneo de vulnerabilidades y cumplimiento de estándares de seguridad en pipelines CI/CD.

AL INICIAR: Abre estado-ejecucion.md y registra en la sección "Historial de Ejecución":
- Prompt ID: 2.2
- Nombre: Escaneo de Seguridad en Pipeline
- Estado: 🟡 En progreso
- Fecha/hora de inicio: [insertar timestamp]

TAREA:
Integra herramientas de seguridad en el pipeline:
- Trivy para escaneo de vulnerabilidades en imágenes Docker
- npm audit en dependencias de frontend y backend
- SonarCloud o CodeQL para análisis estático de código
- git-secrets o detect-secrets para prevenir commits con credenciales
- Configurar umbrales: pipeline falla si hay vulnerabilidades CRITICAL
- Generar reporte de seguridad como artefacto del workflow

CRITERIOS DE COMPLETADO:
- Trivy escaneando imágenes en cada build
- npm audit corriendo en CI
- Reporte de seguridad disponible como artifact en GitHub Actions
- Pipeline bloquea merge si hay vulnerabilidades críticas

AL COMPLETAR: Actualiza estado-ejecucion.md:
- Estado del prompt 2.2: ✅ Completado
- Documenta: herramientas integradas, vulnerabilidades encontradas y resueltas, umbrales configurados
```

---

## Prompt 2.3 — Entorno de Staging

```
DOCUMENTOS A LEER PRIMERO:
- plan-infraestructura-fullstack.md
- prompts-ejecucion.md
- estado-ejecucion.md

ROL: Actúa como Ingeniero Fullstack Senior y DevOps con experiencia en configuración de entornos de staging que replican producción de forma segura y eficiente.

AL INICIAR: Abre estado-ejecucion.md y registra en la sección "Historial de Ejecución":
- Prompt ID: 2.3
- Nombre: Entorno de Staging
- Estado: 🟡 En progreso
- Fecha/hora de inicio: [insertar timestamp]

TAREA:
Configura y despliega el entorno de staging:
- Servidor de staging (VPS o cloud) con Docker instalado
- docker-compose.staging.yml adaptado al entorno
- Variables de entorno de staging separadas y seguras
- URL de staging con autenticación básica (usuario/contraseña)
- Script de deploy: pull imagen → stop → start → health check
- Base de datos staging con datos anonimizados del seed
- Configurar dominio staging.tudominio.com con HTTPS (Let's Encrypt)

CRITERIOS DE COMPLETADO:
- Staging accesible en URL pública con HTTPS
- Deploy automático funciona desde GitHub Actions
- Health check valida que los servicios están corriendo
- Logs accesibles desde el servidor

AL COMPLETAR: Actualiza estado-ejecucion.md:
- Estado del prompt 2.3: ✅ Completado
- Documenta: URL de staging, configuración del servidor, tiempo de deploy, problemas de red o SSL

AL COMPLETAR TODA LA FASE 2:
Verifica que los 3 prompts anteriores estén en estado ✅ Completado en estado-ejecucion.md.
Luego genera el archivo: resumen-fase-2.md con la siguiente estructura:
  - Resumen ejecutivo de la fase
  - Pipeline documentado (diagrama de flujo si aplica)
  - Herramientas de seguridad integradas
  - Configuración del entorno staging
  - Problemas encontrados y resoluciones
  - Métricas del pipeline (tiempo promedio, tasa de éxito)
  - Próximos pasos (Fase 3)
```

---
---

# FASE 3 — Seguridad y Autenticación Robusta

---

## Prompt 3.1 — Seguridad en la API

```
DOCUMENTOS A LEER PRIMERO:
- plan-infraestructura-fullstack.md
- prompts-ejecucion.md
- estado-ejecucion.md

ROL: Actúa como Ingeniero de Seguridad Backend Senior con profundo conocimiento en OWASP Top 10, protección de APIs REST y hardening de aplicaciones Node.js en producción.

AL INICIAR: Abre estado-ejecucion.md y registra en la sección "Historial de Ejecución":
- Prompt ID: 3.1
- Nombre: Seguridad en la API
- Estado: 🟡 En progreso
- Fecha/hora de inicio: [insertar timestamp]

TAREA:
Implementa las capas de seguridad en la API:
- Rate limiting con Redis: 100 req/15min por IP, 1000 req/hora por usuario autenticado
- Helmet.js con configuración estricta de headers HTTP
- Validación de inputs con Zod en todos los endpoints
- Sanitización de datos para prevenir XSS e inyección SQL
- Configuración de CORS por entorno (whitelist de dominios)
- Protección CSRF con tokens para formularios
- Logging de seguridad: intentos fallidos, IPs bloqueadas, endpoints sensibles

CRITERIOS DE COMPLETADO:
- Rate limiting probado con herramienta de carga
- Headers de seguridad validados con securityheaders.com
- Validación rechaza inputs maliciosos con 400
- Tests de seguridad básicos escritos

AL COMPLETAR: Actualiza estado-ejecucion.md:
- Estado del prompt 3.1: ✅ Completado
- Documenta: middlewares implementados, configuración de rate limits, headers configurados, tests de seguridad
```

---

## Prompt 3.2 — Gestión de Secretos

```
DOCUMENTOS A LEER PRIMERO:
- plan-infraestructura-fullstack.md
- prompts-ejecucion.md
- estado-ejecucion.md

ROL: Actúa como Ingeniero DevSecOps Senior experto en gestión segura de credenciales, rotación de secretos y cumplimiento de principio de mínimo privilegio en infraestructuras cloud.

AL INICIAR: Abre estado-ejecucion.md y registra en la sección "Historial de Ejecución":
- Prompt ID: 3.2
- Nombre: Gestión de Secretos
- Estado: 🟡 En progreso
- Fecha/hora de inicio: [insertar timestamp]

TAREA:
Implementa la gestión centralizada de secretos:
- Integrar AWS Secrets Manager o HashiCorp Vault para producción
- Migrar todas las credenciales del .env a el gestor de secretos
- Script de rotación automática para contraseñas de base de datos
- Auditoría del repositorio: verificar que no hay credenciales commiteadas (git log + trufflehog)
- Configurar pre-commit hook con detect-secrets
- Documentar el inventario de secretos en /docs/secrets-inventory.md (sin valores)
- IAM roles con mínimo privilegio para acceso a secretos

CRITERIOS DE COMPLETADO:
- Ningún secreto en variables de entorno planas en producción
- Rotación de credenciales probada y documentada
- Pre-commit hook bloqueando commits con secretos
- Inventario de secretos documentado

AL COMPLETAR: Actualiza estado-ejecucion.md:
- Estado del prompt 3.2: ✅ Completado
- Documenta: secretos migrados, herramienta elegida, política de rotación, hallazgos del audit de git
```

---

## Prompt 3.3 — RBAC y Auditoría

```
DOCUMENTOS A LEER PRIMERO:
- plan-infraestructura-fullstack.md
- prompts-ejecucion.md
- estado-ejecucion.md

ROL: Actúa como Ingeniero Fullstack Senior especializado en sistemas de control de acceso, modelado de permisos y cumplimiento de normativas de seguridad (ISO 27001, SOC 2).

AL INICIAR: Abre estado-ejecucion.md y registra en la sección "Historial de Ejecución":
- Prompt ID: 3.3
- Nombre: RBAC y Auditoría
- Estado: 🟡 En progreso
- Fecha/hora de inicio: [insertar timestamp]

TAREA:
Implementa el sistema completo de roles, permisos y auditoría:
- RBAC completo: Roles (Admin, Manager, User, Guest) con permisos granulares
- Middleware de autorización por recurso y acción (read, write, delete, admin)
- Tabla audit_logs: quién hizo qué, cuándo, desde qué IP, resultado (éxito/fallo)
- OAuth 2.0 con al menos un proveedor (Google o GitHub)
- MFA opcional con TOTP (Google Authenticator compatible)
- Endpoint de gestión de sesiones activas para el usuario
- Tests de integración para escenarios de autorización

CRITERIOS DE COMPLETADO:
- Un usuario sin permisos recibe 403 en recursos restringidos
- Audit log registra todas las acciones sensibles
- OAuth login funcional en staging
- Tests de autorización cubriendo casos límite

AL COMPLETAR: Actualiza estado-ejecucion.md:
- Estado del prompt 3.3: ✅ Completado
- Documenta: matriz de permisos implementada, proveedores OAuth configurados, estructura de audit_logs

AL COMPLETAR TODA LA FASE 3:
Verifica que los 3 prompts anteriores estén en estado ✅ Completado en estado-ejecucion.md.
Luego genera el archivo: resumen-fase-3.md con la siguiente estructura:
  - Resumen ejecutivo de la fase
  - Checklist OWASP Top 10 revisado
  - Matriz de roles y permisos implementada
  - Inventario de controles de seguridad activos
  - Hallazgos del audit de seguridad y resoluciones
  - Próximos pasos (Fase 4)
```

---
---

# FASE 4 — Despliegue en Producción (Cloud)

---

## Prompt 4.1 — Infraestructura como Código con Terraform

```
DOCUMENTOS A LEER PRIMERO:
- plan-infraestructura-fullstack.md
- prompts-ejecucion.md
- estado-ejecucion.md

ROL: Actúa como Ingeniero de Infraestructura Cloud Senior con experiencia en Terraform, AWS y diseño de arquitecturas de alta disponibilidad siguiendo el AWS Well-Architected Framework.

AL INICIAR: Abre estado-ejecucion.md y registra en la sección "Historial de Ejecución":
- Prompt ID: 4.1
- Nombre: Infraestructura como Código con Terraform
- Estado: 🟡 En progreso
- Fecha/hora de inicio: [insertar timestamp]

TAREA:
Crea la infraestructura cloud con Terraform:
- Módulo VPC: subnets públicas y privadas, NAT Gateway, Internet Gateway
- Módulo ECS Fargate: cluster, task definitions, services para frontend y api
- Módulo RDS: PostgreSQL Multi-AZ con réplica de lectura, subnet group privado
- Módulo ElastiCache: Redis en subred privada
- Módulo S3 + CloudFront: bucket para assets, distribución CDN
- Load Balancer (ALB) con target groups y health checks
- Estado remoto en S3 + DynamoDB locking
- Workspaces separados: staging y production

CRITERIOS DE COMPLETADO:
- terraform plan no muestra errores
- terraform apply crea todos los recursos exitosamente
- VPC con subnets correctamente configuradas
- Diagrama de arquitectura generado en /docs/architecture.md

AL COMPLETAR: Actualiza estado-ejecucion.md:
- Estado del prompt 4.1: ✅ Completado
- Documenta: recursos creados, costos estimados mensuales, decisiones de arquitectura, regiones usadas
```

---

## Prompt 4.2 — Base de Datos en Producción

```
DOCUMENTOS A LEER PRIMERO:
- plan-infraestructura-fullstack.md
- prompts-ejecucion.md
- estado-ejecucion.md

ROL: Actúa como DBA (Database Administrator) Senior y Ingeniero Backend con experiencia en PostgreSQL en producción, estrategias de backup, recuperación ante desastres y optimización de rendimiento.

AL INICIAR: Abre estado-ejecucion.md y registra en la sección "Historial de Ejecución":
- Prompt ID: 4.2
- Nombre: Base de Datos en Producción
- Estado: 🟡 En progreso
- Fecha/hora de inicio: [insertar timestamp]

TAREA:
Configura la base de datos para producción:
- RDS PostgreSQL con Multi-AZ habilitado
- Backups automáticos diarios con retención de 30 días
- Snapshot manual antes del primer deploy de producción
- PgBouncer para connection pooling (modo transaction)
- Réplica de lectura para queries de reporting
- Migraciones ejecutadas de forma segura con rollback plan
- Alertas de CloudWatch: CPU > 70%, conexiones > 80%, storage < 20%
- Procedimiento de restauración de backup documentado y probado

CRITERIOS DE COMPLETADO:
- RDS accesible desde la API en subred privada
- Backup restaurado exitosamente en ambiente de prueba
- PgBouncer reduciendo conexiones directas
- Alertas activas en CloudWatch

AL COMPLETAR: Actualiza estado-ejecucion.md:
- Estado del prompt 4.2: ✅ Completado
- Documenta: configuración de RDS, política de backups, resultados del test de restauración, métricas baseline
```

---

## Prompt 4.3 — Dominio, DNS, SSL y CDN

```
DOCUMENTOS A LEER PRIMERO:
- plan-infraestructura-fullstack.md
- prompts-ejecucion.md
- estado-ejecucion.md

ROL: Actúa como Ingeniero de Infraestructura y Redes Senior con experiencia en configuración de DNS, certificados SSL/TLS, distribuciones CDN y optimización de entrega de contenido global.

AL INICIAR: Abre estado-ejecucion.md y registra en la sección "Historial de Ejecución":
- Prompt ID: 4.3
- Nombre: Dominio, DNS, SSL y CDN
- Estado: 🟡 En progreso
- Fecha/hora de inicio: [insertar timestamp]

TAREA:
Configura el dominio y la entrega de contenido:
- DNS en Route 53 o Cloudflare con registros A, CNAME, MX
- Certificado SSL/TLS en AWS ACM (wildcard *.tudominio.com)
- Redirección HTTP → HTTPS y www → apex
- CloudFront configurado para el frontend con cache policies
- Invalidación de caché automática en cada deploy del frontend
- Headers de seguridad en CloudFront (HSTS, X-Frame-Options, CSP)
- Registro SPF/DKIM si se usa email transaccional

CRITERIOS DE COMPLETADO:
- HTTPS funcionando en dominio principal y subdominio api
- Score A+ en SSL Labs
- Assets estáticos servidos desde CDN
- Tiempo de carga < 2s en prueba de PageSpeed

AL COMPLETAR: Actualiza estado-ejecucion.md:
- Estado del prompt 4.3: ✅ Completado
- Documenta: dominios configurados, score SSL Labs, métricas de CDN, configuración de headers

AL COMPLETAR TODA LA FASE 4:
Verifica que los 3 prompts anteriores estén en estado ✅ Completado en estado-ejecucion.md.
Luego genera el archivo: resumen-fase-4.md con la siguiente estructura:
  - Resumen ejecutivo de la fase
  - Diagrama de arquitectura cloud final
  - Inventario de recursos cloud (con costos estimados)
  - Configuración de dominio y certificados
  - Procedimientos de backup y recuperación
  - Próximos pasos (Fase 5)
```

---
---

# FASE 5 — Observabilidad, Escalabilidad y Optimización

---

## Prompt 5.1 — Stack de Monitoreo y Logs

```
DOCUMENTOS A LEER PRIMERO:
- plan-infraestructura-fullstack.md
- prompts-ejecucion.md
- estado-ejecucion.md

ROL: Actúa como Ingeniero SRE (Site Reliability Engineer) Senior con experiencia en implementación de stacks de observabilidad, definición de SLOs, gestión de alertas y cultura de confiabilidad en sistemas distribuidos.

AL INICIAR: Abre estado-ejecucion.md y registra en la sección "Historial de Ejecución":
- Prompt ID: 5.1
- Nombre: Stack de Monitoreo y Logs
- Estado: 🟡 En progreso
- Fecha/hora de inicio: [insertar timestamp]

TAREA:
Implementa el stack completo de observabilidad:
- Sentry para captura de errores en frontend (Next.js) y backend (Node.js)
- OpenTelemetry para trazas distribuidas entre servicios
- Prometheus + Grafana o CloudWatch Dashboards para métricas
- Loki o CloudWatch Logs para centralización de logs estructurados
- Endpoints /health y /ready en la API con checks de DB y Redis
- Dashboard Grafana con: latencia P50/P95/P99, tasa de errores, throughput, uso de recursos
- Alertas configuradas: error rate > 1%, latencia P95 > 500ms, uptime < 99.9%

CRITERIOS DE COMPLETADO:
- Errores de producción visibles en Sentry con stack trace
- Dashboard de Grafana mostrando métricas en tiempo real
- Alertas llegan a Slack o email
- /health retorna estado de todos los servicios dependientes

AL COMPLETAR: Actualiza estado-ejecucion.md:
- Estado del prompt 5.1: ✅ Completado
- Documenta: herramientas configuradas, SLOs definidos, canales de alerta, baseline de métricas iniciales
```

---

## Prompt 5.2 — Auto Scaling y Optimización de Performance

```
DOCUMENTOS A LEER PRIMERO:
- plan-infraestructura-fullstack.md
- prompts-ejecucion.md
- estado-ejecucion.md

ROL: Actúa como Ingeniero Fullstack y SRE Senior con expertise en optimización de rendimiento de aplicaciones web, configuración de auto scaling en cloud y análisis de cuellos de botella en sistemas de alta carga.

AL INICIAR: Abre estado-ejecucion.md y registra en la sección "Historial de Ejecución":
- Prompt ID: 5.2
- Nombre: Auto Scaling y Optimización de Performance
- Estado: 🟡 En progreso
- Fecha/hora de inicio: [insertar timestamp]

TAREA:
Configura escalabilidad y optimiza el rendimiento:
- Auto Scaling en ECS: escalar entre 2–10 instancias basado en CPU > 60%
- Caché de respuestas API con Redis (TTL por tipo de recurso)
- Optimización de queries PostgreSQL: EXPLAIN ANALYZE en queries lentas, índices faltantes
- Code splitting y lazy loading en Next.js
- Optimización de imágenes con next/image
- Compresión gzip/brotli en el API gateway
- Load testing con k6 o Artillery: simular 500 usuarios concurrentes
- Documentar resultados del load test y mejoras aplicadas

CRITERIOS DE COMPLETADO:
- Auto scaling probado: instancias escalan y reducen automáticamente
- Load test: sistema soporta 500 usuarios sin degradación > 10%
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Queries más lentas optimizadas documentadas

AL COMPLETAR: Actualiza estado-ejecucion.md:
- Estado del prompt 5.2: ✅ Completado
- Documenta: configuración de auto scaling, resultados de load test, mejoras de performance medidas, índices creados
```

---

## Prompt 5.3 — Documentación Final y Runbooks

```
DOCUMENTOS A LEER PRIMERO:
- plan-infraestructura-fullstack.md
- prompts-ejecucion.md
- estado-ejecucion.md

ROL: Actúa como Ingeniero Fullstack Senior y Tech Lead con experiencia en documentación técnica de sistemas en producción, creación de runbooks operacionales y procesos de handoff de infraestructura.

AL INICIAR: Abre estado-ejecucion.md y registra en la sección "Historial de Ejecución":
- Prompt ID: 5.3
- Nombre: Documentación Final y Runbooks
- Estado: 🟡 En progreso
- Fecha/hora de inicio: [insertar timestamp]

TAREA:
Crea la documentación operacional completa del sistema:
- Runbook de deploy a producción (paso a paso con rollback)
- Runbook de incidentes: P1 (caída total), P2 (degradación), P3 (bug en producción)
- Runbook de backup y restauración de base de datos
- Guía de onboarding para nuevos desarrolladores
- Arquitectura del sistema documentada con diagramas actualizados
- Inventario de servicios: URLs, credenciales (referencias, no valores), contactos
- Post-mortem template para futuros incidentes
- Checklist de release para nuevas versiones

CRITERIOS DE COMPLETADO:
- Runbooks revisados por al menos otro miembro del equipo
- Un desarrollador nuevo puede configurar el entorno local siguiendo el README
- Todos los documentos en /docs/ con tabla de contenidos actualizada

AL COMPLETAR: Actualiza estado-ejecucion.md:
- Estado del prompt 5.3: ✅ Completado
- Documenta: documentos creados, revisores, gaps de documentación identificados

AL COMPLETAR TODA LA FASE 5:
Verifica que los 3 prompts anteriores estén en estado ✅ Completado en estado-ejecucion.md.
Luego genera el archivo: resumen-fase-5.md con la siguiente estructura:
  - Resumen ejecutivo de la fase
  - Stack de observabilidad completo documentado
  - Resultados de load testing
  - Métricas de performance antes y después
  - SLOs definidos y línea base establecida
  - Inventario de documentación generada
  - Retrospectiva del proyecto completo
  - Recomendaciones para iteraciones futuras
```

---
---

## Instrucciones Generales de Uso

1. **Siempre leer los 3 documentos base** antes de ejecutar cualquier prompt
2. **Registrar inicio y fin** en `estado-ejecucion.md` sin excepción
3. **No saltar prompts**: cada uno depende del anterior
4. **Si un prompt falla**, documentar el error en `estado-ejecucion.md` con estado 🔴 Bloqueado y la causa
5. **Los resúmenes de fase** se generan solo cuando todos los prompts de esa fase están ✅ Completado
6. **Los archivos de resumen** (`resumen-fase-N.md`) son independientes del estado de ejecución y contienen solo el resultado final limpio

---

*Plan de prompts generado: Marzo 2026*
