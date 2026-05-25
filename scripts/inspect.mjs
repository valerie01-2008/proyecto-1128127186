import postgres from 'postgres';
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env.local') });

const sql = postgres(process.env.POSTGRES_URL, {
  ssl: 'require',
  max: 1,
});

try {
  const tables = await sql`
    SELECT table_name
      FROM information_schema.tables
     WHERE table_schema = 'public'
     ORDER BY table_name`;
  console.log('Tablas en public:', tables.map((r) => r.table_name).join(', '));

  for (const t of ['users', 'system_config', 'events', 'reminders', 'notification_log']) {
    const cols = await sql`
      SELECT column_name, data_type
        FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = ${t}
       ORDER BY ordinal_position`;
    if (cols.length === 0) {
      console.log(`\n[${t}] (no existe)`);
    } else {
      console.log(`\n[${t}]`);
      for (const c of cols) console.log(`  - ${c.column_name}: ${c.data_type}`);
    }
  }

  const users = await sql`SELECT id, email, role, active FROM users`;
  console.log('\nUsuarios actuales:', users);
} finally {
  await sql.end();
}
