import { redirect } from 'next/navigation';

// Página de bootstrap oculta tras el seed inicial.
// Para re-habilitar: borra este redirect y restaura el componente original
// (git log -- src/app/admin/db-setup/page.tsx). Los endpoints
// /api/system/{bootstrap,diagnose,mode} siguen accesibles vía curl.
export default function DbSetupPage() {
  redirect('/dashboard');
}
