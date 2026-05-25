// One-shot bootstrap: applies migrations + creates admin + inserts system_config.
// Usage: node scripts/seed.mjs

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { config as loadEnv } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

loadEnv({ path: path.join(projectRoot, '.env.local') });

const connString =
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!connString) {
  console.error('❌ POSTGRES_URL no está definido en .env.local');
  process.exit(1);
}

const sql = postgres(connString, {
  ssl: 'require',
  max: 1,
  idle_timeout: 5,
  connect_timeout: 15,
});

const ADMIN_EMAIL = 'admin@agendapro.app';
const ADMIN_PASSWORD = 'Admin123!';
const ADMIN_NAME = 'Administrador';

async function applyMigrations() {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id serial PRIMARY KEY,
      name text NOT NULL UNIQUE,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  const dir = path.join(projectRoot, 'supabase', 'migrations');
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const applied = await sql`SELECT 1 FROM _migrations WHERE name = ${file}`;
    if (applied.length > 0) {
      console.log(`  ⏭  ${file} (ya aplicada)`);
      continue;
    }
    const ddl = await fs.readFile(path.join(dir, file), 'utf8');
    await sql.unsafe(ddl);
    await sql`INSERT INTO _migrations (name) VALUES (${file})`;
    console.log(`  ✅ ${file}`);
  }

  // PostgREST schema refresh
  await sql.unsafe(`NOTIFY pgrst, 'reload schema';`);
}

async function seedAdmin() {
  const existing = await sql`SELECT id, email FROM users WHERE email = ${ADMIN_EMAIL}`;
  if (existing.length > 0) {
    console.log(`  ⏭  Admin ya existe (${ADMIN_EMAIL}). Reseteando password…`);
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await sql`
      UPDATE users
         SET password_hash = ${hash},
             role = 'admin',
             active = true,
             login_attempts = 0,
             locked_until = NULL
       WHERE email = ${ADMIN_EMAIL}
    `;
    return;
  }
  const id = randomUUID();
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await sql`
    INSERT INTO users (id, name, email, password_hash, role, timezone, active)
    VALUES (${id}, ${ADMIN_NAME}, ${ADMIN_EMAIL}, ${hash}, 'admin', 'America/Bogota', true)
  `;
  console.log(`  ✅ Admin creado: ${ADMIN_EMAIL}`);
}

async function seedSystemConfig() {
  // El esquema real en Supabase usa columnas con valores fijos (no key/value JSON).
  const existing = await sql`SELECT id FROM system_config LIMIT 1`;
  if (existing.length > 0) {
    console.log(`  ⏭  system_config ya tiene 1 fila`);
    return;
  }
  await sql`
    INSERT INTO system_config
      (max_events_per_user, notification_window_start_hour, notification_window_end_hour, default_timezone)
    VALUES
      (500, 6, 22, 'America/Bogota')
  `;
  console.log(`  ✅ system_config sembrado`);
}

async function main() {
  console.log('🔧 Aplicando migrations…');
  await applyMigrations();
  console.log('👤 Sembrando admin…');
  await seedAdmin();
  console.log('⚙️  Sembrando system_config…');
  await seedSystemConfig();

  console.log('\n🎉 Listo. Credenciales del administrador:');
  console.log(`   📧 Email:    ${ADMIN_EMAIL}`);
  console.log(`   🔑 Password: ${ADMIN_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error('\n❌ Falló el seed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end();
  });
