'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  IconLogo,
  IconDashboard,
  IconCalendar,
  IconEvents,
  IconBell,
  IconReports,
  IconAdmin,
  IconUser,
  IconLogout,
  IconMenu,
  IconClose,
  IconPlus,
} from './icons';

interface AppLayoutProps {
  children: ReactNode;
  userRole?: string;
  userName?: string;
}

type NavItem = {
  name: string;
  href: string;
  Icon: (p: { size?: number; className?: string }) => React.ReactElement;
};

const primaryNav: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', Icon: IconDashboard },
  { name: 'Calendario', href: '/calendar', Icon: IconCalendar },
  { name: 'Eventos', href: '/events', Icon: IconEvents },
];

const secondaryNav: NavItem[] = [
  { name: 'Notificaciones', href: '/notifications', Icon: IconBell },
  { name: 'Reportes', href: '/reports', Icon: IconReports },
];

const adminNav: NavItem[] = [
  { name: 'Admin · Usuarios', href: '/admin/users', Icon: IconUser },
  { name: 'Admin · Reportes', href: '/admin/reports', Icon: IconReports },
  { name: 'Admin · Config', href: '/admin/config', Icon: IconAdmin },
  { name: 'Admin · BD', href: '/admin/db-setup', Icon: IconAdmin },
];

export function AppLayout({ children, userRole, userName }: AppLayoutProps) {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    router.push('/login');
  }

  const renderItem = (item: NavItem) => {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={[
          'group relative flex items-center gap-3 px-3 h-10 rounded text-[13px] tracking-tight transition-colors',
          active
            ? 'text-bone-0 bg-ink-2'
            : 'text-bone-2 hover:text-bone-0 hover:bg-ink-2/70',
        ].join(' ')}
      >
        <span
          className={[
            'absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-r transition-opacity',
            active ? 'bg-lime opacity-100' : 'opacity-0',
          ].join(' ')}
        />
        <item.Icon size={18} className={active ? 'text-lime' : ''} />
        <span>{item.name}</span>
      </Link>
    );
  };

  const initial = (userName || 'Usuario').trim().charAt(0).toUpperCase();
  const dateLabel = now
    ? now.toLocaleDateString('es-CO', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
      })
    : '';
  const timeLabel = now
    ? now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="min-h-screen bg-ink-0 text-bone-0">
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink-0/80 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — fija en todas las resoluciones, el main usa lg:pl-72 */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 w-72 bg-ink-1 border-r border-ink-3 flex flex-col',
          'transform transition-transform duration-300 ease-out',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-ink-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="text-lime">
              <IconLogo size={22} />
            </span>
            <span className="font-display text-[20px] tracking-editorial">
              Agenda<span className="text-bone-2">·</span>Pro
            </span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-bone-2 hover:text-bone-0 transition-colors"
            aria-label="Cerrar menú"
          >
            <IconClose size={20} />
          </button>
        </div>

        <div className="px-5 pt-5 pb-3">
          <p className="eyebrow mb-1">Hoy</p>
          <p className="font-display text-[19px] capitalize tracking-editorial">
            {dateLabel || '—'}
          </p>
          <p className="font-mono text-xs text-bone-2 mt-0.5">{timeLabel}</p>
        </div>

        <div className="px-3">
          <Link
            href="/events/new"
            className="flex items-center justify-between gap-2 h-10 px-3 rounded bg-lime text-ink-0 hover:bg-bone-0 transition-colors font-medium text-sm"
          >
            <span className="flex items-center gap-2">
              <IconPlus size={16} />
              Nuevo evento
            </span>
            <span className="kbd">N</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 pt-5 pb-2 space-y-0.5 overflow-y-auto">
          <p className="eyebrow px-3 mb-2">Espacio</p>
          {primaryNav.map(renderItem)}

          <p className="eyebrow px-3 mt-6 mb-2">Actividad</p>
          {secondaryNav.map(renderItem)}

          {userRole === 'admin' && (
            <>
              <p className="eyebrow px-3 mt-6 mb-2">Administración</p>
              {adminNav.map(renderItem)}
            </>
          )}
        </nav>

        <div className="border-t border-ink-3 p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-9 w-9 rounded-full bg-ink-3 border border-ink-4 flex items-center justify-center font-mono text-bone-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-bone-0 truncate">{userName || 'Usuario'}</p>
              <p className="font-mono text-[11px] uppercase tracking-ticker text-bone-2">
                {userRole || 'user'}
              </p>
            </div>
            <button
              onClick={logout}
              className="text-bone-2 hover:text-crimson transition-colors p-2 rounded hover:bg-ink-2"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <IconLogout size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-72">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 bg-ink-0/90 backdrop-blur-md border-b border-ink-3 lg:hidden">
          <div className="flex items-center justify-between h-14 px-4">
            <button
              onClick={() => setOpen(true)}
              className="text-bone-1 hover:text-bone-0 transition-colors"
              aria-label="Abrir menú"
            >
              <IconMenu size={22} />
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-lime">
                <IconLogo size={18} />
              </span>
              <span className="font-display text-base">
                Agenda<span className="text-bone-2">·</span>Pro
              </span>
            </Link>
            <span className="w-6" />
          </div>
        </header>

        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
