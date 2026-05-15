import { createClient, SupabaseClient } from '@supabase/supabase-js';
import postgres from 'postgres';

let _client: SupabaseClient | null = null;
let _checked = false;

/**
 * Obtiene el cliente de Supabase de forma segura para el build.
 * Retorna null si las variables de entorno no están configuradas (BUILD-SAFE).
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (_client) return _client;
  if (_checked) return null; // Ya verificamos, no hay config

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  _checked = true;

  if (!url || !key) {
    console.warn('[supabase] No configurado');
    return null;
  }

  _client = createClient(url, key, {
    auth: { persistSession: false },
  });

  return _client;
}

/**
 * Requiere un cliente válido de Supabase.
 * Lanza error si no está configurado. Usar solo en endpoints admin.
 */
export function requireSupabaseClient(): SupabaseClient {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error(
      'Supabase no está configurado. Verifica las variables de entorno: ' +
        'SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return client;
}

/**
 * Ejecuta una query SQL directamente a PostgreSQL.
 * Usar solo para DDL (CREATE TABLE, ALTER, etc).
 */
export async function executeSql(query: string): Promise<void> {
  const connString = process.env.POSTGRES_URL;

  if (!connString) {
    throw new Error('POSTGRES_URL no configurado');
  }

  const sql = postgres(connString, {
    ssl: 'require',
    connect_timeout: 10,
    idle_timeout: 5,
    max: 1,
  });

  try {
    await sql.unsafe(query);
  } finally {
    await sql.end();
  }
}

/**
 * Cliente postgres para queries directas (para compatibilidad con código existente)
 */
export const sql = postgres(process.env.POSTGRES_URL || '', {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});