import { createClient, SupabaseClient } from '@supabase/supabase-js';
import postgres, { Sql } from 'postgres';

let _client: SupabaseClient | null = null;
let _checked = false;

/**
 * Cliente Supabase build-safe.
 * Retorna null si no hay variables — NUNCA lanza al cargar el módulo.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (_client) return _client;
  if (_checked) return null;

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  _checked = true;

  if (!url || !key) {
    console.warn('[supabase] No configurado — retornando null (build-safe)');
    return null;
  }

  _client = createClient(url, key, {
    auth: { persistSession: false },
  });

  return _client;
}

export function requireSupabaseClient(): SupabaseClient {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error(
      'Supabase no está configurado. Verifica NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
  return client;
}

/**
 * Ejecuta SQL crudo (DDL). Solo bootstrap/admin.
 */
export async function executeSql(query: string): Promise<void> {
  const connString = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
  if (!connString) {
    throw new Error('POSTGRES_URL no configurado');
  }
  const client = postgres(connString, {
    ssl: 'require',
    connect_timeout: 10,
    idle_timeout: 5,
    max: 1,
  });
  try {
    await client.unsafe(query);
  } finally {
    await client.end();
  }
}

/**
 * Cliente postgres compartido (build-safe + lazy).
 * Se inicializa en la primera invocación de `sql\`...\``,
 * por lo que el módulo carga sin envs durante `next build`.
 */
let _sql: Sql | null = null;

function getSql(): Sql {
  if (_sql) return _sql;
  const connString =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (!connString) {
    throw new Error(
      'POSTGRES_URL no configurado. Verifica las variables de entorno.'
    );
  }
  _sql = postgres(connString, {
    ssl: 'require',
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return _sql;
}

const sqlProxyTarget = function () {} as unknown as Sql;

export const sql: Sql = new Proxy(sqlProxyTarget, {
  apply(_target, _thisArg, args: unknown[]) {
    const instance = getSql() as unknown as (...a: unknown[]) => unknown;
    return instance(...args);
  },
  get(_target, prop, receiver) {
    const instance = getSql();
    const value = Reflect.get(instance as object, prop, receiver);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
}) as Sql;
