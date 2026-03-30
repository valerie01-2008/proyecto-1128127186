# 🚀 Plan de Implementación por Fases
## Fullstack TypeScript · Next.js · JSON-DB · GitHub · Vercel

> **Documento:** Guía de ejecución técnica paso a paso  
> **Basado en:** Plan de Infraestructura Fullstack TypeScript  
> **Versión objetivo:** v1.0 — Sistema base funcional en producción  
> **Fecha:** 27/03/2026

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Mapa de Fases](#2-mapa-de-fases)
3. [Fase 0 — Prerequisitos y Entorno](#3-fase-0--prerequisitos-y-entorno)
4. [Fase 1 — Scaffold del Proyecto](#4-fase-1--scaffold-del-proyecto)
5. [Fase 2 — Capa de Datos JSON](#5-fase-2--capa-de-datos-json)
6. [Fase 3 — Frontend: Home Hola Mundo](#6-fase-3--frontend-home-hola-mundo)
7. [Fase 4 — API Routes](#7-fase-4--api-routes)
8. [Fase 5 — Integración GitHub + Vercel](#8-fase-5--integración-github--vercel)
9. [Fase 6 — Validación y QA](#9-fase-6--validación-y-qa)
10. [Criterios de Aceptación](#10-criterios-de-aceptación)
11. [Gestión de Riesgos](#11-gestión-de-riesgos)
12. [Convenciones del Proyecto](#12-convenciones-del-proyecto)

---

## 1. Resumen Ejecutivo

Este documento traduce el plan de infraestructura en **acciones concretas y ordenadas**, organizadas en 7 fases (Fase 0 a Fase 6). Cada fase tiene un objetivo claro, tareas atómicas, los archivos que produce y una verificación de éxito antes de avanzar a la siguiente.

### Principios de ejecución

| Principio | Descripción |
|---|---|
| **Verificar antes de avanzar** | Cada fase tiene un checkpoint. No se avanza sin pasarlo. |
| **TypeScript desde el primer commit** | Ningún archivo `.js` en el proyecto. Solo `.ts` y `.tsx`. |
| **Commits semánticos** | Cada tarea se commitea de forma atómica con prefijo (`feat:`, `chore:`, `fix:`). |
| **Los datos viven en `/data`** | Ninguna lógica hardcodeada en componentes. Todo viene del JSON. |
| **Main siempre deployable** | Solo se mergea a `main` lo que esté verificado. |

### Estimación de tiempo

| Fase | Nombre | Tiempo estimado |
|------|--------|-----------------|
| Fase 0 | Prerequisitos | 30 min |
| Fase 1 | Scaffold | 45 min |
| Fase 2 | Capa de datos | 60 min |
| Fase 3 | Frontend Home | 90 min |
| Fase 4 | API Routes | 45 min |
| Fase 5 | GitHub + Vercel | 30 min |
| Fase 6 | Validación | 30 min |
| **Total** | | **~5.5 horas** |

---

## 2. Mapa de Fases

```
FASE 0                FASE 1               FASE 2
Prerequisitos  ──▶   Scaffold        ──▶  Capa JSON
  │                    │                    │
  Node.js              create-next-app      /data/*.json
  Git                  tsconfig.json        reader.ts
  Vercel CLI           estructura dirs      services.ts
  GitHub repo          .gitignore           types.ts
                       .env.example
                            │
                            ▼
FASE 6                FASE 5               FASE 3
Validación     ◀──   GitHub+Vercel   ◀──  Frontend Home
  │                    │                    │
  TypeScript ✓         repo push            globals.css
  Build ✓              vercel.json          layout.tsx
  Deploy ✓             vincular cuenta      page.tsx
  Visual ✓             1er deploy           HeroText.tsx
                                            efecto elegante
                                                 │
                                                 ▼
                                           FASE 4
                                           API Routes
                                                 │
                                            /api/site
                                            /api/home
                                            route.ts
```

---

## 3. Fase 0 — Prerequisitos y Entorno

**Objetivo:** Tener el entorno de desarrollo listo antes de escribir una sola línea del proyecto.

### 3.1 Software requerido

| Herramienta | Versión mínima | Verificación |
|---|---|---|
| Node.js | 18.17.0 LTS | `node --version` |
| npm | 9.0.0 | `npm --version` |
| Git | 2.40.0 | `git --version` |
| VS Code (recomendado) | Cualquier reciente | — |

### 3.2 Extensiones VS Code recomendadas

```
ms-vscode.vscode-typescript-next   ← TypeScript mejorado
bradlc.vscode-tailwindcss          ← Para fases futuras
esbenp.prettier-vscode             ← Formateo automático
dbaeumer.vscode-eslint             ← Linting en tiempo real
```

### 3.3 Cuentas y accesos necesarios

- [ ] **GitHub:** Cuenta activa. Repositorio nuevo creado (vacío, sin README).
- [ ] **Vercel:** Cuenta activa vinculada a GitHub (autorizar OAuth en vercel.com).
- [ ] **Vercel CLI** (opcional pero útil): `npm install -g vercel`

### 3.4 Configuración global de Git

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
git config --global init.defaultBranch main
```

### ✅ Checkpoint Fase 0

```bash
node --version   # debe mostrar v18.x.x o superior
npm --version    # debe mostrar 9.x.x o superior
git --version    # debe mostrar 2.x.x
```

> Si todos los comandos responden sin error, Fase 0 completada. ✓

---

## 4. Fase 1 — Scaffold del Proyecto

**Objetivo:** Crear la estructura base del proyecto con Next.js 14 y TypeScript, lista para desarrollar.

### 4.1 Crear el proyecto con Next.js

Ejecutar en la carpeta donde quieres crear el proyecto:

```bash
npx create-next-app@latest nombre-del-proyecto \
  --typescript \
  --eslint \
  --no-tailwind \
  --src-dir \
  --no-app \
  --import-alias "@/*"
```

> **Nota:** Seleccionar `App Router: Yes` cuando lo pregunte el asistente interactivo, o usar el flag `--app` en lugar de `--no-app`.

```bash
cd nombre-del-proyecto
```

### 4.2 Ajustar la estructura de carpetas

Crear los directorios que `create-next-app` no genera automáticamente:

```bash
# Crear carpetas del proyecto
mkdir -p data/pages
mkdir -p components/ui
mkdir -p components/layout
mkdir -p lib/data
mkdir -p lib/types
```

La estructura resultante debe verse así:

```
nombre-del-proyecto/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   └── layout/
├── data/
│   └── pages/
├── lib/
│   ├── data/
│   └── types/
├── public/
├── .eslintrc.json
├── .gitignore
├── next.config.ts
├── package.json
└── tsconfig.json
```

### 4.3 Reemplazar `tsconfig.json` con configuración estricta

Abrir `tsconfig.json` y reemplazar su contenido por:

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

### 4.4 Actualizar `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

### 4.5 Añadir script de type-check al `package.json`

Abrir `package.json` y agregar dentro de `"scripts"`:

```json
"type-check": "tsc --noEmit"
```

Scripts resultantes:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "type-check": "tsc --noEmit"
}
```

### 4.6 Crear `.env.example`

Crear el archivo `.env.example` en la raíz (este SÍ se commitea):

```bash
# Entorno de la aplicación
NODE_ENV=development

# URL base de la aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Directorio de datos JSON
DATA_DIR=./data
```

Crear `.env.local` (este NO se commitea):

```bash
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATA_DIR=./data
```

### 4.7 Verificar `.gitignore`

`create-next-app` ya genera un `.gitignore` adecuado. Confirmar que contiene:

```
.env.local
.env*.local
.next/
node_modules/
```

### 4.8 Inicializar Git y primer commit

```bash
git init
git remote add origin https://github.com/TU_USUARIO/nombre-del-repositorio.git
git add .
git commit -m "feat: project scaffold — Next.js 14 + TypeScript strict"
git push -u origin main
```

### ✅ Checkpoint Fase 1

```bash
npm run type-check   # debe completar sin errores
npm run dev          # debe abrir localhost:3000 con la página default de Next.js
```

> Si ambos comandos pasan sin error, Fase 1 completada. ✓

---

## 5. Fase 2 — Capa de Datos JSON

**Objetivo:** Construir la "base de datos" en `/data` y el Data Access Layer en `/lib`, completamente tipado con TypeScript.

### 5.1 Crear los archivos JSON de datos

**`data/site.json`** — Configuración global del sitio:

```json
{
  "name": "Mi Proyecto",
  "description": "Sistema Fullstack TypeScript con JSON DB",
  "version": "1.0.0",
  "theme": {
    "primaryColor": "#0a0a0a",
    "accentColor": "#c9a96e",
    "fontFamily": "serif"
  },
  "meta": {
    "title": "Mi Proyecto | Fullstack TypeScript",
    "description": "Sistema Fullstack TypeScript con GitHub y Vercel"
  }
}
```

**`data/pages/home.json`** — Contenido de la página de inicio:

```json
{
  "id": "home",
  "hero": {
    "greeting": "Hola",
    "subject": "Mundo",
    "subtitle": "Sistema Fullstack TypeScript operativo",
    "badge": "TypeScript · Next.js · Vercel",
    "animationStyle": "elegant-fade"
  },
  "meta": {
    "title": "Inicio",
    "description": "Página de inicio del sistema",
    "updatedAt": "2026-03-27"
  }
}
```

### 5.2 Crear los tipos TypeScript

**`lib/types/site.types.ts`**:

```typescript
export interface SiteTheme {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
}

export interface SiteMeta {
  title: string;
  description: string;
}

export interface SiteConfig {
  name: string;
  description: string;
  version: string;
  theme: SiteTheme;
  meta: SiteMeta;
}
```

**`lib/types/page.types.ts`**:

```typescript
export interface PageMeta {
  title: string;
  description: string;
  updatedAt: string;
}

export interface HeroData {
  greeting: string;
  subject: string;
  subtitle: string;
  badge: string;
  animationStyle: string;
}

export interface HomePageData {
  id: string;
  hero: HeroData;
  meta: PageMeta;
}
```

### 5.3 Crear el lector genérico de JSON

**`lib/data/reader.ts`**:

```typescript
import fs from "fs";
import path from "path";

/**
 * Lee un archivo JSON desde la carpeta /data y lo retorna tipado.
 * IMPORTANTE: Esta función solo puede ejecutarse en el servidor
 * (Server Components, API Routes, generateMetadata).
 * Nunca se ejecuta en el cliente.
 *
 * @param relativePath - Ruta relativa desde /data (ej: "site.json", "pages/home.json")
 * @returns El contenido del archivo parseado y tipado como T
 */
export function readJsonData<T>(relativePath: string): T {
  const fullPath = path.join(process.cwd(), "data", relativePath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(
      `[DataReader] Archivo no encontrado: data/${relativePath}`
    );
  }

  const raw = fs.readFileSync(fullPath, "utf-8");

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(
      `[DataReader] Error al parsear JSON: data/${relativePath}`
    );
  }
}
```

### 5.4 Crear los servicios de datos

**`lib/data/site.service.ts`**:

```typescript
import { readJsonData } from "./reader";
import type { SiteConfig } from "../types/site.types";
import type { HomePageData } from "../types/page.types";

/**
 * Retorna la configuración global del sitio desde data/site.json
 */
export function getSiteConfig(): SiteConfig {
  return readJsonData<SiteConfig>("site.json");
}

/**
 * Retorna los datos de la página Home desde data/pages/home.json
 */
export function getHomeData(): HomePageData {
  return readJsonData<HomePageData>("pages/home.json");
}
```

### 5.5 Commit de la capa de datos

```bash
git add data/ lib/
git commit -m "feat: JSON data layer — types, reader, and site service"
```

### ✅ Checkpoint Fase 2

```bash
npm run type-check   # debe pasar sin errores con los nuevos tipos
```

Verificar manualmente que los archivos JSON son válidos pegándolos en [jsonlint.com](https://jsonlint.com) o ejecutando:

```bash
node -e "require('./data/site.json')" && echo "site.json OK"
node -e "require('./data/pages/home.json')" && echo "home.json OK"
```

> Si el type-check pasa y los JSON son válidos, Fase 2 completada. ✓

---

## 6. Fase 3 — Frontend: Home Hola Mundo

**Objetivo:** Construir la página de inicio con el efecto visual elegante, consumiendo datos desde la capa JSON creada en la Fase 2.

### 6.1 Configurar estilos globales

**`app/globals.css`** — Reemplazar el contenido por:

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Space+Mono:wght@400&display=swap');

/* ── Variables del sistema de diseño ──────────────────── */
:root {
  --bg:          #0a0a0a;
  --fg:          #f0ebe1;
  --fg-dim:      rgba(240, 235, 225, 0.45);
  --accent:      #c9a96e;
  --accent-dim:  rgba(201, 169, 110, 0.12);
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-mono:    'Space Mono', 'Courier New', monospace;
  --transition-elegant: cubic-bezier(0.16, 1, 0.3, 1);
}

/* ── Reset base ────────────────────────────────────────── */
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
  -moz-osx-font-smoothing: grayscale;
}

/* ── Efecto de fondo — glow radial ─────────────────────── */
.bg-glow {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 50% at 50% 50%,
      rgba(201, 169, 110, 0.07) 0%, transparent 70%),
    radial-gradient(ellipse 80% 60% at 15% 85%,
      rgba(201, 169, 110, 0.04) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 85% 15%,
      rgba(201, 169, 110, 0.03) 0%, transparent 55%);
  pointer-events: none;
  z-index: 0;
}

/* ── Partículas flotantes (decorativas) ────────────────── */
.particle {
  position: fixed;
  width: 1px;
  height: 1px;
  background: var(--accent);
  border-radius: 50%;
  opacity: 0;
  animation: float-particle 8s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

.particle:nth-child(1) { left: 20%; top: 30%; animation-delay: 0s;   animation-duration: 9s; }
.particle:nth-child(2) { left: 75%; top: 60%; animation-delay: 2s;   animation-duration: 7s; }
.particle:nth-child(3) { left: 40%; top: 80%; animation-delay: 4s;   animation-duration: 11s; }
.particle:nth-child(4) { left: 85%; top: 20%; animation-delay: 1s;   animation-duration: 8s; }
.particle:nth-child(5) { left: 55%; top: 45%; animation-delay: 3s;   animation-duration: 10s; }

@keyframes float-particle {
  0%, 100% { opacity: 0;    transform: translateY(0px) scale(1); }
  20%       { opacity: 0.6; }
  50%       { opacity: 0.3; transform: translateY(-20px) scale(3); }
  80%       { opacity: 0.6; }
}
```

### 6.2 Crear el layout raíz

**`app/layout.tsx`**:

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

### 6.3 Crear el componente HeroText

**`components/ui/HeroText.tsx`**:

```typescript
"use client";

import { useEffect, useState } from "react";
import type { HeroData } from "@/lib/types/page.types";

interface HeroTextProps {
  hero: HeroData;
}

export default function HeroText({ hero }: HeroTextProps) {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const transition = (delay: string) =>
    `opacity 1s var(--transition-elegant) ${delay},
     transform 1s var(--transition-elegant) ${delay}`;

  const fadeIn = (delay: string): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(16px)",
    transition: transition(delay),
  });

  return (
    <section
      style={{
        textAlign: "center",
        zIndex: 1,
        position: "relative",
        padding: "2rem",
      }}
    >
      {/* Línea vertical superior */}
      <div
        aria-hidden="true"
        style={{
          width: "1px",
          height: "64px",
          background: `linear-gradient(to bottom, transparent, var(--accent))`,
          margin: "0 auto 2.5rem",
          ...fadeIn("0.2s"),
        }}
      />

      {/* Badge tecnológico */}
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          letterSpacing: "0.35em",
          color: "var(--accent)",
          textTransform: "uppercase",
          marginBottom: "2rem",
          ...fadeIn("0.4s"),
        }}
      >
        {hero.badge}
      </p>

      {/* Título principal */}
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(4.5rem, 13vw, 10rem)",
          fontWeight: 300,
          lineHeight: 0.95,
          letterSpacing: "-0.025em",
          marginBottom: "0.25rem",
          ...fadeIn("0.6s"),
        }}
      >
        <em
          style={{
            fontStyle: "italic",
            color: "var(--accent)",
            display: "block",
          }}
        >
          {hero.greeting}
        </em>
        <span style={{ display: "block" }}>{hero.subject}</span>
      </h1>

      {/* Divisor ornamental */}
      <div
        aria-hidden="true"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          margin: "2.5rem auto",
          maxWidth: "200px",
          justifyContent: "center",
          ...fadeIn("0.8s"),
        }}
      >
        <div
          style={{
            flex: 1,
            height: "1px",
            background: "var(--accent)",
            opacity: 0.4,
          }}
        />
        <div
          style={{
            width: "4px",
            height: "4px",
            background: "var(--accent)",
            borderRadius: "50%",
            opacity: 0.8,
          }}
        />
        <div
          style={{
            flex: 1,
            height: "1px",
            background: "var(--accent)",
            opacity: 0.4,
          }}
        />
      </div>

      {/* Subtítulo */}
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(0.9rem, 2vw, 1.15rem)",
          fontWeight: 300,
          letterSpacing: "0.1em",
          color: "var(--fg-dim)",
          ...fadeIn("1s"),
        }}
      >
        {hero.subtitle}
      </p>

      {/* Línea vertical inferior */}
      <div
        aria-hidden="true"
        style={{
          width: "1px",
          height: "64px",
          background: `linear-gradient(to bottom, var(--accent), transparent)`,
          margin: "2.5rem auto 0",
          ...fadeIn("1.2s"),
        }}
      />
    </section>
  );
}
```

### 6.4 Crear la página Home

**`app/page.tsx`**:

```typescript
import { getHomeData } from "@/lib/data/site.service";
import HeroText from "@/components/ui/HeroText";

export default function HomePage() {
  // Lectura server-side desde /data/pages/home.json
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
      {/* Fondo con glow */}
      <div className="bg-glow" aria-hidden="true" />

      {/* Partículas decorativas */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="particle" aria-hidden="true" />
      ))}

      {/* Hero principal */}
      <HeroText hero={homeData.hero} />
    </main>
  );
}
```

### 6.5 Commit del frontend

```bash
git add app/ components/
git commit -m "feat: home page — elegant Hola Mundo with animated hero"
```

### ✅ Checkpoint Fase 3

```bash
npm run dev
# Abrir http://localhost:3000
# Debe verse "Hola Mundo" centrado con animación de entrada elegante
# El texto aparece con fade + desplazamiento suave
# Fondo oscuro con glow dorado sutil

npm run type-check   # debe pasar sin errores
```

> Si el Home se ve correctamente y TypeScript compila, Fase 3 completada. ✓

---

## 7. Fase 4 — API Routes

**Objetivo:** Exponer los datos JSON como endpoints REST, permitiendo que el frontend (y consumidores externos futuros) accedan a los datos mediante HTTP.

### 7.1 Crear la API Route de configuración del sitio

**`app/api/site/route.ts`**:

```typescript
import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/data/site.service";
import type { SiteConfig } from "@/lib/types/site.types";

export async function GET(): Promise<NextResponse<SiteConfig>> {
  try {
    const config = getSiteConfig();
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json(
      { error: "No se pudo cargar la configuración del sitio" } as unknown as SiteConfig,
      { status: 500 }
    );
  }
}
```

### 7.2 Crear la API Route de la página Home

**`app/api/pages/home/route.ts`**:

```typescript
import { NextResponse } from "next/server";
import { getHomeData } from "@/lib/data/site.service";
import type { HomePageData } from "@/lib/types/page.types";

export async function GET(): Promise<NextResponse<HomePageData>> {
  try {
    const data = getHomeData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "No se pudo cargar la página home" } as unknown as HomePageData,
      { status: 500 }
    );
  }
}
```

### 7.3 Crear el directorio necesario

```bash
mkdir -p app/api/pages/home
```

### 7.4 Commit de las API Routes

```bash
git add app/api/
git commit -m "feat: API routes — GET /api/site and GET /api/pages/home"
```

### ✅ Checkpoint Fase 4

Con el servidor de desarrollo corriendo (`npm run dev`), verificar en el navegador:

```
http://localhost:3000/api/site
# Debe retornar el JSON de data/site.json

http://localhost:3000/api/pages/home
# Debe retornar el JSON de data/pages/home.json
```

> Si ambos endpoints responden con el JSON correcto, Fase 4 completada. ✓

---

## 8. Fase 5 — Integración GitHub + Vercel

**Objetivo:** Conectar el repositorio GitHub con Vercel para activar el pipeline de deploy automático.

### 8.1 Crear `vercel.json`

En la raíz del proyecto:

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
        { "key": "Cache-Control", "value": "no-store, max-age=0" },
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

> **Región `gru1`:** São Paulo — la más cercana a Colombia (menor latencia).

### 8.2 Push final antes de vincular Vercel

```bash
git add vercel.json .env.example
git commit -m "chore: Vercel config and environment example"
git push origin main
```

### 8.3 Vincular el repositorio en Vercel

Seguir estos pasos en vercel.com:

```
1. Ir a https://vercel.com/new
2. Click en "Import Git Repository"
3. Seleccionar tu cuenta de GitHub
4. Buscar y seleccionar tu repositorio
5. En la pantalla de configuración:
   ┌─────────────────────────────────────────┐
   │ Framework Preset:    Next.js            │
   │ Root Directory:      ./                 │
   │ Build Command:       npm run build      │
   │ Output Directory:    .next              │
   │ Install Command:     npm install        │
   └─────────────────────────────────────────┘
6. En "Environment Variables" agregar:
   NODE_ENV              = production
   NEXT_PUBLIC_APP_URL   = https://TU-PROYECTO.vercel.app
7. Click en "Deploy"
```

### 8.4 Configurar protección de la rama main (GitHub)

En el repositorio de GitHub:

```
Settings → Branches → Add branch protection rule
  ├── Branch name pattern: main
  ├── ✅ Require a pull request before merging
  └── ✅ Require status checks to pass (agregar: Vercel)
```

### 8.5 Verificar el primer deploy automático

```
En el Dashboard de Vercel, el primer deploy debería:
  ✓ Estado: Ready
  ✓ URL:    https://nombre-proyecto.vercel.app
  ✓ Build:  ~2-3 minutos desde el push
```

### 8.6 Commit de validación del pipeline

Hacer un cambio menor para probar el deploy automático:

```bash
# Ejemplo: actualizar la versión en site.json
# Cambiar "version": "1.0.0" por "version": "1.0.1"

git add data/site.json
git commit -m "chore: bump version to validate auto-deploy pipeline"
git push origin main
```

Observar en el Dashboard de Vercel que se inicia un nuevo deploy automáticamente.

### ✅ Checkpoint Fase 5

```
En https://nombre-proyecto.vercel.app:
  ✓ La página Home carga con "Hola Mundo"
  ✓ El efecto de animación funciona
  ✓ https://nombre-proyecto.vercel.app/api/site retorna JSON
  ✓ https://nombre-proyecto.vercel.app/api/pages/home retorna JSON
  ✓ Un push a main dispara un nuevo deploy automáticamente
```

> Si todos los puntos se cumplen, Fase 5 completada. ✓

---

## 9. Fase 6 — Validación y QA

**Objetivo:** Confirmar que el sistema cumple todos los criterios de aceptación definidos antes de declarar la v1.0 como completada.

### 9.1 Validación de TypeScript

```bash
npm run type-check
# Resultado esperado: salida vacía (cero errores)

npm run build
# Resultado esperado:
#   ✓ Compiled successfully
#   ✓ Linting and checking validity of types
#   ✓ Route (app) — / — Static
#   ✓ Route (app) — /api/site — Dynamic
#   ✓ Route (app) — /api/pages/home — Dynamic
```

### 9.2 Validación visual

Abrir la URL de producción en Vercel y verificar:

| Elemento | Descripción | ¿Pasa? |
|---|---|---|
| Fondo | Color oscuro `#0a0a0a` sin flash blanco | ☐ |
| Texto principal | "Hola Mundo" centrado horizontal y verticalmente | ☐ |
| Tipografía | Cormorant Garamond cargada (serif elegante) | ☐ |
| "Hola" | En cursiva, color dorado `#c9a96e` | ☐ |
| Animación entrada | Fade + translateY suave al cargar | ☐ |
| Badge | Texto mono "TypeScript · Next.js · Vercel" visible | ☐ |
| Subtítulo | Texto tenue visible debajo del divisor | ☐ |
| Glow background | Resplandor dorado muy sutil en el centro | ☐ |
| Responsive | Se ve bien en mobile (< 768px) y desktop | ☐ |

### 9.3 Validación de la capa de datos

```bash
# Local
curl http://localhost:3000/api/site
curl http://localhost:3000/api/pages/home

# Producción
curl https://nombre-proyecto.vercel.app/api/site
curl https://nombre-proyecto.vercel.app/api/pages/home
```

Ambos deben retornar JSON válido con los datos correctos.

### 9.4 Validación del pipeline CI/CD

```bash
# Crear una rama de prueba
git checkout -b test/pipeline-validation

# Hacer un cambio menor en datos
# Cambiar subtitle en data/pages/home.json

git add data/pages/home.json
git commit -m "test: validate preview deploy pipeline"
git push origin test/pipeline-validation
```

Verificar en Vercel Dashboard que se creó un **Preview Deploy** automático con URL única.

### 9.5 Tag de versión

Una vez que todos los checklists están en verde:

```bash
git checkout main
git tag -a v1.0.0 -m "v1.0.0 — Sistema base funcional: Hola Mundo en producción"
git push origin v1.0.0
```

### ✅ Checkpoint Fase 6 — Sistema v1.0 Completado

```
✓ TypeScript compila sin errores
✓ Build de Next.js exitoso
✓ Home visible en producción con efecto elegante
✓ API Routes respondiendo en producción
✓ Deploy automático funcionando desde GitHub
✓ Preview deploys activos para feature branches
✓ Tag v1.0.0 creado en GitHub
```

---

## 10. Criterios de Aceptación

El sistema v1.0 se considera **completado y aprobado** cuando:

### Funcionales

- [ ] La URL de producción en Vercel muestra "Hola Mundo" centrado
- [ ] El texto tiene el efecto de aparición elegante (fade + movimiento)
- [ ] Los datos provienen del archivo `data/pages/home.json` (no están hardcodeados)
- [ ] `GET /api/site` retorna el contenido de `data/site.json`
- [ ] `GET /api/pages/home` retorna el contenido de `data/pages/home.json`

### Técnicos

- [ ] `npm run type-check` termina sin errores TypeScript
- [ ] `npm run build` termina sin errores ni warnings críticos
- [ ] No existe ningún archivo `.js` en el proyecto (solo `.ts` y `.tsx`)
- [ ] El modo `strict: true` está activo en `tsconfig.json`

### Infraestructura

- [ ] Cada push a `main` dispara un deploy automático en Vercel
- [ ] Cada push a una rama diferente crea un Preview Deploy
- [ ] Las variables de entorno están configuradas en Vercel Dashboard
- [ ] El archivo `.env.local` está en `.gitignore` y no fue commiteado

---

## 11. Gestión de Riesgos

### Riesgos identificados y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Error de tipos TypeScript en build | Media | Alto | Ejecutar `type-check` antes de cada push |
| JSON malformado rompe el servidor | Baja | Alto | Validar JSON con linter antes de commitear |
| `fs.readFileSync` en cliente | Media | Alto | Verificar que todos los servicios estén en Server Components |
| Fuentes de Google no cargan | Baja | Medio | Tener fallbacks definidos en CSS (`Georgia, serif`) |
| Deploy de Vercel falla por build | Baja | Alto | Verificar build local con `npm run build` antes de push a `main` |
| Variables de entorno faltantes en Vercel | Media | Medio | Documentar en `.env.example` y verificar en Dashboard |

### Señales de alerta a monitorear

```
⚠️  Error: Cannot find module 'fs'
    → Un servicio del Data Layer fue importado en un Client Component ("use client")
    → Solución: Mover la llamada al servicio al Server Component padre

⚠️  TypeError: Cannot read properties of undefined (reading 'hero')
    → El JSON no tiene la estructura esperada o el archivo no existe
    → Solución: Verificar ruta y esquema del archivo JSON

⚠️  Build failed: Type error — Property 'X' does not exist on type 'Y'
    → Los tipos en lib/types/ no coinciden con el JSON actual
    → Solución: Sincronizar tipos con el esquema JSON

⚠️  404 en /api/site en producción pero OK en local
    → El archivo JSON no fue commiteado al repositorio
    → Solución: Verificar que /data está trackeado en Git (no en .gitignore)
```

---

## 12. Convenciones del Proyecto

### Nomenclatura de archivos

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componentes React | PascalCase | `HeroText.tsx` |
| Servicios/utilidades | camelCase | `site.service.ts` |
| Tipos TypeScript | camelCase + `.types.ts` | `site.types.ts` |
| Archivos JSON | kebab-case | `home.json`, `site.json` |
| Rutas de API | kebab-case | `/api/pages/home` |

### Commits semánticos

```
feat:    Nueva funcionalidad
fix:     Corrección de bug
chore:   Tarea de mantenimiento (deps, config)
style:   Cambios de estilos/CSS
refactor: Refactorización sin cambio funcional
docs:    Documentación
test:    Tests
```

**Ejemplos:**
```bash
git commit -m "feat: add home page hero animation"
git commit -m "fix: correct JSON path in site service"
git commit -m "chore: update Next.js to 14.2.5"
git commit -m "style: adjust hero font size for mobile"
```

### Reglas de la capa de datos

1. **Los archivos `.json` en `/data` son la fuente de verdad.** Ningún dato del sitio debe estar hardcodeado en un componente.
2. **Los servicios en `lib/data/` son el único punto de acceso.** Los componentes no importan `reader.ts` directamente.
3. **Los tipos en `lib/types/` deben reflejar exactamente el esquema JSON.** Si el JSON cambia, el tipo cambia, y TypeScript avisará.
4. **Cero acceso al filesystem en Client Components.** Si un componente tiene `"use client"`, no puede llamar a ningún servicio del Data Layer.

---

## Apéndice — Estructura final del proyecto

```
nombre-del-proyecto/
│
├── 📁 app/
│   ├── globals.css              ✓ Variables, fuentes, bg-glow
│   ├── layout.tsx               ✓ Metadata desde site.json
│   ├── page.tsx                 ✓ Home Server Component
│   └── api/
│       ├── site/
│       │   └── route.ts         ✓ GET /api/site
│       └── pages/
│           └── home/
│               └── route.ts     ✓ GET /api/pages/home
│
├── 📁 components/
│   └── ui/
│       └── HeroText.tsx         ✓ Animación elegante
│
├── 📁 lib/
│   ├── data/
│   │   ├── reader.ts            ✓ Lector genérico JSON
│   │   └── site.service.ts      ✓ Servicios tipados
│   └── types/
│       ├── site.types.ts        ✓ Tipos SiteConfig
│       └── page.types.ts        ✓ Tipos HomePageData
│
├── 📁 data/                     ✓ "Base de datos" JSON
│   ├── site.json
│   └── pages/
│       └── home.json
│
├── .env.example                 ✓ Commiteado
├── .env.local                   ✗ En .gitignore
├── .gitignore
├── next.config.ts
├── tsconfig.json                ✓ Modo strict
├── vercel.json                  ✓ Región gru1
└── package.json
```

---

*Plan de Implementación por Fases — v1.0.0*  
*Arquitectura: Fullstack TypeScript · Next.js 14 · JSON-DB · GitHub · Vercel*  
*Generado el 27/03/2026*
