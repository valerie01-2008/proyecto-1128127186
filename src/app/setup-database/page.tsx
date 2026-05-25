import { redirect } from 'next/navigation';

// Página pública de setup oculta tras el seed inicial.
// El endpoint /api/setup-database sigue accesible si se necesita re-correr.
export default function SetupDatabasePage() {
  redirect('/login');
}
