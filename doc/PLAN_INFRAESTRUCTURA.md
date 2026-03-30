# 🏗️ Plan de Infraestructura — Fullstack TypeScript + GitHub + Vercel

> **Arquitecto:** Plan generado como hoja de ruta técnica completa  
> **Stack:** Next.js 14 · TypeScript · JSON-DB · GitHub · Vercel  
> **Objetivo inicial:** Home "Hola Mundo" con efecto elegante como prueba de concepto

---

## 📋 Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Estructura de Carpetas](#3-estructura-de-carpetas)
4. [Capa de Datos — JSON como Base de Datos](#4-capa-de-datos--json-como-base-de-datos)
5. [Configuración del Proyecto](#5-configuración-del-proyecto)
6. [Implementación del Home — Hola Mundo](#6-implementación-del-home--hola-mundo)
7. [Pipeline CI/CD — GitHub + Vercel](#7-pipeline-cicd--github--vercel)
8. [Configuración de Vercel](#8-configuración-de-vercel)
9. [Variables de Entorno](#9-variables-de-entorno)
10. [Checklist de Implementación](#10-checklist-de-implementación)
11. [Decisiones Arquitectónicas](#11-decisiones-arquitectónicas)
12. [Roadmap Futuro](#12-roadmap-futuro)

---

## 1. Visión General

### ¿Qué construimos?

Un sistema **Fullstack TypeScript** desplegado en Vercel, versionado en GitHub, que utiliza una carpeta `/data` con archivos JSON como capa de persistencia de datos — sin base de datos relacional ni NoSQL externas.

### ¿Por qué este stack?

| Decisión | Justificación |
|---|---|
| **Next.js 14 (App Router)** | Fullstack nativo: frontend + API Routes en un solo proyecto TypeScript |
| **TypeScript estricto** | Tipado end-to-end, errores en tiempo de compilación, mejor DX |
| **JSON como DB** | Cero dependencias externas, control total del esquema, versionable en Git |
| **Vercel** | Deploy automático desde GitHub, edge functions, zero-config con Next.js |
| **GitHub** | Source of truth, integración nativa con Vercel, historial de cambios de datos |

---

## 2. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTE (Browser)                   │
│              React Components + TypeScript              │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP / RSC
┌─────────────────────▼───────────────────────────────────┐
│                  NEXT.JS APP ROUTER                      │
│                                                         │
│  ┌─────────────────┐    ┌──────────────────────────┐    │
│  │  Server Components│   │     API Routes           │    │
│  │  (app/page.tsx)  │   │  (app/api/[...]/route.ts)│    │
│  └────────┬────────┘    └──────────┬───────────────┘    │
│           │                        │                    │
│  ┌────────▼────────────────────────▼───────────────┐    │
│  │              DATA ACCESS LAYER                   │    │
│  │         (lib/data/ — TypeScript services)        │    │
│  └────────────────────┬─────────────────────────────┘    │
└───────────────────────┼─────────────────────────────────┘
                        │ fs.readFileSync / writeFileSync
┌───────────────────────▼─────────────────────────────────┐
│                   CAPA DE DATOS (/data)                  │
│                                                         │
│   data/                                                 │
│   ├── site.json          ← Configuración global        │
│   ├── pages/             ← Contenido por página        │
│   │   └── home.json                                    │
│   └── [futuras entidades].json                         │
└─────────────────────────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│              INFRAESTRUCTURA EXTERNA                     │
│                                                         │
│   GitHub Repo ──── push ──▶ Vercel (auto-deploy)       │
│                             ├── Production (main)      │
│                             └── Preview (PR branches)  │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Estructura de Carpetas

```
proyecto-raiz/
│
├── 📁 app/                          # Next.js App Router
│   ├── layout.tsx                   # Layout raíz con fuentes y metadata
│   ├── page.tsx                     # Home — "Hola Mundo"
│   ├── globals.css                  # Estilos globales + variables CSS
│   └── api/                         # API Routes (Backend)
│       └── site/
│           └── route.ts             # GET /api/site
│
├── 📁 components/                   # Componentes React reutilizables
│   ├── ui/
│   │   ├── HeroText.tsx             # Componente del texto animado
│   │   └── AnimatedBackground.tsx   # Efecto de fondo elegante
│   └── layout/
│       └── PageWrapper.tsx
│
├── 📁 lib/                          # Lógica de negocio y utilidades
│   ├── data/
│   │   ├── reader.ts                # Utilidad genérica para leer JSON
│   │   └── site.service.ts          # Servicio para datos del sitio
│   └── types/
│       ├── site.types.ts            # Tipos TypeScript para site.json
│       └── page.types.ts            # Tipos para páginas
│
├── 📁 data/                         # 🗄️ "BASE DE DATOS" JSON
│   ├── site.json                    # Configuración global del sitio
│   └── pages/
│       └── home.json                # Contenido de la página Home
│
├── 📁 public/                       # Assets estáticos
│   └── fonts/                       # Fuentes locales (opcional)
│
├── .env.local                       # Variables de entorno locales
├── .env.example                     # Plantilla de variables (commiteado)
├── .gitignore
├── next.config.ts                   # Configuración de Next.js
├── tsconfig.json                    # Configuración TypeScript estricta
├── package.json
└── vercel.json                      # Configuración de Vercel
```

---

## 4. Capa de Datos — JSON como Base de Datos

### 4.1 Esquema: `data/site.json`

```json
{
  "name": "Mi Proyecto",
  "description": "Sistema Fullstack TypeScript",
  "version": "1.0.0",
  "theme": {
    "primaryColor": "#0f0f0f",
    "accentColor": "#e8d5b7",
    "fontFamily": "serif"
  },
  "meta": {
    "title": "Mi Proyecto",
    "description": "Sistema Fullstack TypeScript con JSON DB"
  }
}
```

### 4.2 Esquema: `data/pages/home.json`

```json
{
  "id": "home",
  "hero": {
    "greeting": "Hola",
    "subject": "Mundo",
    "subtitle": "Sistema Fullstack TypeScript operativo",
    "animationStyle": "elegant-fade"
  },
  "meta": {
    "title": "Inicio",
    "updatedAt": "2026-03-27"
  }
}
```

### 4.3 Tipos TypeScript: `lib/types/site.types.ts`

```typescript
export interface SiteConfig {
  name: string;
  description: string;
  version: string;
  theme: {
    primaryColor: string;
    accentColor: string;
    fontFamily: string;
  };
  meta: {
    title: string;
    description: string;
  };
}

export interface HomePageData {
  id: string;
  hero: {
    greeting: string;
    subject: string;
    subtitle: string;
    animationStyle: string;
  };
  meta: {
    title: string;
    updatedAt: string;
  };
}
```

### 4.4 Data Access Layer: `lib/data/reader.ts`

```typescript
import fs from "fs";
import path from "path";

/**
 * Lee un archivo JSON desde la carpeta /data y lo tipifica.
 * Solo ejecutable en el servidor (Server Components, API Routes).
 */
export function readJsonData<T>(relativePath: string): T {
  const fullPath = path.join(process.cwd(), "data", relativePath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Archivo de datos no encontrado: ${relativePath}`);
  }

  const raw = fs.readFileSync(fullPath, "utf-8");

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`Error al parsear JSON: ${relativePath}`);
  }
}
```

### 4.5 Servicio: `lib/data/site.service.ts`

```typescript
import { readJsonData } from "./reader";
import type { SiteConfig, HomePageData } from "../types/site.types";

export function getSiteConfig(): SiteConfig {
  return readJsonData<SiteConfig>("site.json");
}

export function getHomeData(): HomePageData {
  return readJsonData<HomePageData>("pages/home.json");
}
```

---

## 5. Configuración del Proyecto

### 5.1 `tsconfig.json` — TypeScript estricto

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 5.2 `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Los archivos JSON en /data se leen desde el servidor,
  // no se exponen al cliente automáticamente.
  serverExternalPackages: [],
};

export default nextConfig;
```

### 5.3 `package.json` — Dependencias esenciales

```json
{
  "name": "mi-proyecto-ts",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0"
  }
}
```

---

## 6. Implementación del Home — Hola Mundo

### 6.1 `app/globals.css` — Variables y reset

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Space+Mono:wght@400&display=swap');

:root {
  --bg: #0a0a0a;
  --fg: #f0ebe1;
  --accent: #c9a96e;
  --accent-dim: rgba(201, 169, 110, 0.15);
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-mono: 'Space Mono', monospace;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  background-color: var(--bg);
  color: var(--fg);
  font-family: var(--font-display);
  -webkit-font-smoothing: antialiased;
}
```

### 6.2 `app/layout.tsx`

```typescript
import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/data/site.service";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteConfig();
  return {
    title: site.meta.title,
    description: site.meta.description,
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
```

### 6.3 `app/page.tsx` — Server Component

```typescript
import { getHomeData } from "@/lib/data/site.service";
import HeroText from "@/components/ui/HeroText";

export default function HomePage() {
  // Lectura desde /data — solo en servidor
  const homeData = getHomeData();

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Fondo animado */}
      <div className="bg-glow" aria-hidden="true" />

      {/* Contenido principal */}
      <HeroText
        greeting={homeData.hero.greeting}
        subject={homeData.hero.subject}
        subtitle={homeData.hero.subtitle}
      />
    </main>
  );
}
```

### 6.4 `components/ui/HeroText.tsx` — Efecto elegante

```typescript
"use client";

import { useEffect, useState } from "react";

interface HeroTextProps {
  greeting: string;
  subject: string;
  subtitle: string;
}

export default function HeroText({ greeting, subject, subtitle }: HeroTextProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      style={{
        textAlign: "center",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
        zIndex: 1,
        position: "relative",
      }}
    >
      {/* Línea decorativa superior */}
      <div
        style={{
          width: "1px",
          height: "60px",
          background: "linear-gradient(to bottom, transparent, var(--accent))",
          margin: "0 auto 2rem",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s ease 0.4s",
        }}
        aria-hidden="true"
      />

      {/* Etiqueta mono */}
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.3em",
          color: "var(--accent)",
          textTransform: "uppercase",
          marginBottom: "1.5rem",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s ease 0.6s",
        }}
      >
        TypeScript · Next.js · Vercel
      </p>

      {/* Título principal */}
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(4rem, 12vw, 9rem)",
          fontWeight: 300,
          lineHeight: 1.0,
          letterSpacing: "-0.02em",
          color: "var(--fg)",
          marginBottom: "0.5rem",
        }}
      >
        <span style={{ fontStyle: "italic", color: "var(--accent)" }}>
          {greeting}
        </span>{" "}
        {subject}
      </h1>

      {/* Línea divisoria */}
      <div
        style={{
          width: "40px",
          height: "1px",
          background: "var(--accent)",
          margin: "2rem auto",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s ease 0.9s",
        }}
        aria-hidden="true"
      />

      {/* Subtítulo */}
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
          fontWeight: 300,
          letterSpacing: "0.08em",
          color: "rgba(240, 235, 225, 0.5)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s ease 1.1s",
        }}
      >
        {subtitle}
      </p>

      {/* Línea decorativa inferior */}
      <div
        style={{
          width: "1px",
          height: "60px",
          background: "linear-gradient(to bottom, var(--accent), transparent)",
          margin: "2rem auto 0",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s ease 1.3s",
        }}
        aria-hidden="true"
      />
    </section>
  );
}
```

### 6.5 Efecto de fondo — `app/globals.css` (añadir)

```css
.bg-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201, 169, 110, 0.06) 0%, transparent 70%),
    radial-gradient(ellipse 80% 60% at 20% 80%, rgba(201, 169, 110, 0.03) 0%, transparent 60%);
  pointer-events: none;
}
```

---

## 7. Pipeline CI/CD — GitHub + Vercel

### 7.1 Flujo de trabajo

```
Desarrollador
     │
     ▼
git commit + push
     │
     ▼
GitHub Repository
     │
     ├── branch: main ──────▶ Vercel Production Deploy
     │                              URL: tudominio.vercel.app
     │
     └── branch: feature/* ──▶ Vercel Preview Deploy
                                    URL: git-hash-proyecto.vercel.app
```

### 7.2 Fases del deploy automático en Vercel

| Fase | Acción | Tiempo estimado |
|------|--------|-----------------|
| **Trigger** | Push a GitHub detectado por webhook | < 5 seg |
| **Install** | `npm install` | 30–60 seg |
| **Type Check** | `tsc --noEmit` (si configurado) | 10–20 seg |
| **Build** | `next build` | 60–120 seg |
| **Deploy** | Subida a Vercel Edge Network | 20–40 seg |
| **Total** | Desde push hasta live | ~3 min |

### 7.3 GitHub Branch Strategy

```
main              ← Producción (protegido)
  └── develop     ← Integración
        └── feature/nombre-feature   ← Desarrollo
```

---

## 8. Configuración de Vercel

### 8.1 `vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["gru1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, max-age=0" }
      ]
    }
  ]
}
```

> **Región `gru1`**: São Paulo — la más cercana a Colombia para menor latencia.

### 8.2 Vinculación GitHub → Vercel (pasos)

```
1. Ir a vercel.com → "Add New Project"
2. Seleccionar "Import Git Repository"
3. Autorizar GitHub y elegir el repositorio
4. Configurar:
   - Framework Preset: Next.js (auto-detectado)
   - Root Directory: ./  (raíz del proyecto)
   - Build Command: npm run build
   - Output Directory: .next (auto-detectado)
5. Agregar variables de entorno (ver sección 9)
6. Click "Deploy"
```

---

## 9. Variables de Entorno

### `.env.example` (commiteado en GitHub)

```bash
# Entorno de la aplicación
NODE_ENV=development

# URL base (Vercel la provee automáticamente en producción)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Configuración de la "DB" JSON
DATA_DIR=./data
```

### `.env.local` (NO commiteado — agregar a .gitignore)

```bash
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATA_DIR=./data
```

### Variables automáticas de Vercel (no requieren configuración manual)

| Variable | Valor en producción |
|---|---|
| `VERCEL` | `1` |
| `VERCEL_ENV` | `production` / `preview` |
| `VERCEL_URL` | URL del deploy actual |
| `NEXT_PUBLIC_VERCEL_URL` | Accesible desde cliente |

---

## 10. Checklist de Implementación

### Fase 1 — Setup del repositorio

- [ ] Crear repositorio en GitHub (público o privado)
- [ ] Inicializar con `npx create-next-app@latest --typescript`
- [ ] Configurar `tsconfig.json` con modo estricto
- [ ] Crear estructura de carpetas según el plan
- [ ] Commit inicial: `feat: project scaffold`

### Fase 2 — Capa de datos JSON

- [ ] Crear carpeta `/data`
- [ ] Crear `data/site.json` con el esquema definido
- [ ] Crear `data/pages/home.json`
- [ ] Implementar `lib/data/reader.ts`
- [ ] Implementar `lib/types/site.types.ts`
- [ ] Implementar `lib/data/site.service.ts`
- [ ] Verificar tipos con `npm run type-check`

### Fase 3 — Frontend Home

- [ ] Configurar `app/globals.css` con variables y fuentes
- [ ] Implementar `app/layout.tsx` con metadata dinámica
- [ ] Implementar `app/page.tsx` como Server Component
- [ ] Implementar `components/ui/HeroText.tsx` con animación
- [ ] Prueba local: `npm run dev` → verificar en localhost:3000
- [ ] Verificar que TypeScript compile sin errores

### Fase 4 — Deploy a Vercel

- [ ] Crear cuenta en Vercel (si no existe)
- [ ] Vincular repositorio GitHub en Vercel
- [ ] Configurar variables de entorno en Vercel Dashboard
- [ ] Crear `vercel.json` con configuración de región
- [ ] Push a `main` → verificar deploy automático
- [ ] Validar URL de producción en Vercel

### Fase 5 — Validación final

- [ ] Home visible con "Hola Mundo" centrado y efecto elegante ✓
- [ ] Sin errores de TypeScript en build ✓
- [ ] Deploy automático ante cada push a `main` ✓
- [ ] Preview deploy en branches de feature ✓
- [ ] Datos leídos desde `/data/*.json` correctamente ✓

---

## 11. Decisiones Arquitectónicas

### ¿Por qué Next.js App Router y no Pages Router?

El App Router es el estándar actual de Next.js 14+. Permite Server Components nativos, que es exactamente lo que necesitamos para leer los archivos JSON en el servidor sin exponer la lógica al cliente. Los `fs.readFileSync` solo corren en el servidor.

### ¿Por qué JSON y no SQLite o similar?

| Criterio | JSON files | SQLite |
|---|---|---|
| Setup | Cero dependencias | Requiere driver |
| Versionamiento | Commiteado en Git | Binario, no diffable |
| Legibilidad | Editable en cualquier editor | Requiere herramienta |
| Vercel compatible | ✅ Read-only en serverless | ⚠️ Limitaciones en edge |
| Escalabilidad | Limitada (suficiente para este scope) | Mayor |

**Conclusión:** Para el scope definido, JSON es la opción más pragmática y mantenible.

### ¿Por qué leer JSON solo en Server Components?

Los archivos JSON en `/data` pueden contener información sensible futura. Al leerlos exclusivamente en Server Components y API Routes, garantizamos que nunca se expongan al bundle del cliente. El cliente solo recibe los datos que explícitamente le pasamos como props.

### ¿Cómo escala la "JSON DB" en el futuro?

Si el proyecto crece y se necesita una base de datos real, la transición es mínima:
1. Reemplazar `lib/data/reader.ts` con un cliente de DB
2. Mantener los mismos servicios (`site.service.ts`) con la misma firma
3. Los componentes no cambian — están desacoplados de la fuente de datos

---

## 12. Roadmap Futuro

```
v1.0  ──▶  Hola Mundo + validación TypeScript        ← ESTE PLAN
v1.1  ──▶  Routing entre páginas + nav dinámico desde JSON
v1.2  ──▶  API REST completa sobre /data (CRUD simulado)
v1.3  ──▶  Autenticación básica (NextAuth.js)
v1.4  ──▶  Panel de administración para editar JSON
v2.0  ──▶  Migración opcional a DB real (si escala)
```

---

## Referencias Técnicas

| Recurso | URL |
|---|---|
| Next.js 14 Docs | https://nextjs.org/docs |
| TypeScript Handbook | https://www.typescriptlang.org/docs |
| Vercel Deployment Docs | https://vercel.com/docs/deployments/overview |
| Next.js App Router | https://nextjs.org/docs/app |
| Vercel Environment Variables | https://vercel.com/docs/projects/environment-variables |

---

*Plan generado el 27/03/2026 — Arquitectura diseñada para escalar desde MVP hasta sistema de producción.*
