# Capa de Datos — JSON como Base de Datos

Esta carpeta `/data` contiene la "base de datos" del proyecto, implementada como archivos JSON estáticos. Esta arquitectura permite:

## Ventajas

- **Cero dependencias externas**: No requiere PostgreSQL, MongoDB u otros DB servers
- **Versionable en Git**: Los datos se commitean junto al código
- **Lectura server-side only**: Los archivos se leen exclusivamente en Server Components y API Routes
- **Esquema tipado**: TypeScript garantiza consistencia de datos
- **Escalable para MVP**: Suficiente para prototipos y aplicaciones pequeñas

## Estructura

```
data/
├── config.json        ← Configuración global de la aplicación
├── home.json          ← Datos de la página Home
└── README.md          ← Esta documentación
```

## Propósito de cada archivo JSON

- **config.json**: Contiene configuración global de la aplicación como nombre, versión, locale y tema. Se usa para metadata y configuración del sitio.
- **home.json**: Contiene el contenido de la página principal, incluyendo el hero con título, subtítulo, descripción y estilo de animación, además de metadata de la página.

## Regla de acceso solo desde servidor

Todos los archivos JSON deben leerse exclusivamente desde el servidor (Server Components, API Routes). Nunca se exponen al cliente para mantener la seguridad y el control de datos.

## Instrucción de cómo agregar nuevos archivos JSON en el futuro

1. Crear el archivo JSON en `/data/` con un nombre descriptivo (ej: `about.json` para página About).
2. Definir la estructura JSON clara y documentada.
3. Actualizar este README.md con el propósito del nuevo archivo.
4. Crear funciones en `lib/dataService.ts` para leer el nuevo archivo si es necesario.
5. Asegurarse de que se lea solo desde el servidor.

## Uso en Código

Los datos se leen usando la utilidad `lib/data/reader.ts`:

```typescript
import { readJsonData } from "@/lib/data/reader";

// En Server Components o API Routes
const siteConfig = readJsonData<SiteConfig>("site.json");
```

## Consideraciones de Seguridad

- Los archivos JSON **NO** se exponen al cliente
- Solo accesibles desde el servidor (Server Components, API Routes)
- No contienen información sensible (credenciales, etc.)

## Futuro: Migración a DB Real

Cuando el proyecto crezca, migrar a una DB real es trivial:
1. Reemplazar `lib/data/reader.ts` con un cliente de DB
2. Mantener las mismas firmas de servicios (`site.service.ts`)
3. Los componentes no cambian — desacoplados de la fuente de datos