import postgres from 'postgres';

// Configuración de la base de datos
const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export { sql };