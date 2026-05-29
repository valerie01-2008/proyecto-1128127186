'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  IconLogo,
  IconArrowRight,
  IconArrowUpRight,
  IconCalendar,
  IconBell,
  IconReports,
  IconSparkle,
  IconClock,
  IconShield,
} from '@/components/icons';

export default function Home() {
  const [time, setTime] = useState<Date | null>(null);
  useEffect(() => {
    setTime(new Date());
    const id = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="min-h-screen relative overflow-x-hidden bg-ink-0 text-bone-0">
      {/* Background grid + glow */}
      <div
        aria-hidden
        className="fixed inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(var(--ink-3) 1px, transparent 1px), linear-gradient(90deg, var(--ink-3) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
      <div
        aria-hidden
        className="absolute -top-32 right-[-20%] h-[700px] w-[700px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(253,224,71,0.18), transparent 60%)' }}
      />
      <div
        aria-hidden
        className="absolute top-[60vh] -left-[20%] h-[600px] w-[600px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.16), transparent 60%)' }}
      />

      {/* NAV */}
      <header className="relative z-20 max-w-[1280px] mx-auto px-6 lg:px-10 pt-6 lg:pt-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-lime">
            <IconLogo size={26} />
          </span>
          <span className="font-display text-2xl tracking-editorial">
            Agenda<span className="text-bone-2">·</span>Pro
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 font-mono text-[11px] uppercase tracking-ticker">
          <a href="#features" className="px-3 py-1.5 text-bone-2 hover:text-bone-0">
            Capítulos
          </a>
          <a href="#engine" className="px-3 py-1.5 text-bone-2 hover:text-bone-0">
            Motor
          </a>
          <a href="#stack" className="px-3 py-1.5 text-bone-2 hover:text-bone-0">
            Stack
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:inline-flex h-10 px-4 items-center text-sm text-bone-1 hover:text-bone-0 transition-colors"
          >
            Ingresar
          </Link>
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 h-10 px-4 rounded bg-lime text-ink-0 text-sm font-medium hover:bg-bone-0 transition-colors"
          >
            Empezar
            <span className="transition-transform group-hover:translate-x-0.5">
              <IconArrowRight size={16} />
            </span>
          </Link>
        </div>
      </header>

      {/* DATELINE */}
      <div className="relative z-20 max-w-[1280px] mx-auto px-6 lg:px-10 mt-10 flex items-center justify-between font-mono text-[11px] uppercase tracking-ticker text-bone-3 border-y border-ink-3 py-3">
        <span>
          Vol. 01 ·{' '}
          {time
            ? time.toLocaleDateString('es-CO', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })
            : '—'}
        </span>
        <span className="hidden md:inline">No&nbsp;01 — Agenda Editorial</span>
        <span>v1.0 · activa</span>
      </div>

      {/* HERO */}
      <section className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-10 pt-16 lg:pt-24 pb-20">
        <p className="eyebrow mb-6 ap-fade-up">Manifiesto · agenda editorial</p>

        <h1
          className="ap-fade-up font-display tracking-editorial leading-[0.9] mb-10"
          style={{
            fontSize: 'clamp(3rem, 9vw, 8rem)',
            animationDelay: '60ms',
          }}
        >
          Cero olvidos.
          <br />
          Cero ruido.
          <br />
          <span className="italic text-bone-2">Solo</span>{' '}
          <span className="relative inline-block">
            <span className="text-lime">lo importante</span>
            <span
              aria-hidden
              className="absolute -bottom-1 left-0 right-0 h-[3px] bg-lime"
            />
          </span>
          .
        </h1>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-end">
          <div>
            <p
              className="ap-fade-up text-bone-1 text-[18px] lg:text-[20px] leading-relaxed max-w-2xl"
              style={{ animationDelay: '120ms' }}
            >
              AgendaPro es una agenda con carácter. Calendario en tres vistas,
              recordatorios automáticos que se evalúan cada cinco minutos y un
              motor que respeta tu ventana horaria. Sin gradientes innecesarios,
              sin colores que gritan, sin emojis decorativos.
            </p>

            <div
              className="ap-fade-up flex flex-wrap gap-3 mt-8"
              style={{ animationDelay: '180ms' }}
            >
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 h-12 px-6 rounded bg-lime text-ink-0 font-medium hover:bg-bone-0 transition-colors"
              >
                Ingresar a la agenda
                <span className="transition-transform group-hover:translate-x-0.5">
                  <IconArrowRight size={18} />
                </span>
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 h-12 px-6 rounded border border-ink-3 text-bone-1 hover:text-bone-0 hover:border-ink-4 hover:bg-ink-1 transition-colors"
              >
                Leer capítulos
                <IconArrowUpRight size={16} />
              </a>
            </div>
          </div>

          <div
            className="ap-fade-up hidden lg:block"
            style={{ animationDelay: '240ms' }}
          >
            <img
              src="/agendapro.png"
              alt="AgendaPro - Vista de calendario y recordatorios"
              className="w-full h-auto rounded-lg border border-ink-3 shadow-lg"
            />
          </div>
        </div>

        {/* Stat strip */}
        <ul
          className="ap-fade-up grid grid-cols-2 md:grid-cols-4 gap-px bg-ink-3 border border-ink-3 rounded-lg overflow-hidden mt-20"
          style={{ animationDelay: '240ms' }}
        >
          {[
            ['3 vistas', 'día · semana · mes'],
            ['5 min', 'frecuencia del motor'],
            ['hasta 5', 'recordatorios por evento'],
            ['06–22', 'ventana horaria por defecto'],
          ].map(([head, sub]) => (
            <li key={head} className="bg-ink-1 p-5 lg:p-6">
              <p className="font-display text-2xl lg:text-3xl tracking-editorial text-bone-0">
                {head}
              </p>
              <p className="font-mono text-[11px] uppercase tracking-ticker text-bone-3 mt-2">
                {sub}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-10 py-20 border-t border-ink-3"
      >
        <header className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="eyebrow mb-3">Sección 01 · capítulos</p>
            <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] tracking-editorial leading-none">
              Lo que vas a usar
              <span className="text-lime">.</span>
            </h2>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-ticker text-bone-3">
            3 features · 1 manifesto
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-px bg-ink-3 border border-ink-3 rounded-lg overflow-hidden">
          {[
            {
              n: '01',
              Icon: IconCalendar,
              title: 'Calendario editorial',
              body: 'Tres vistas (día, semana, mes) con tipografía display y categorías por color. Sin animaciones gratuitas — solo las que comunican.',
            },
            {
              n: '02',
              Icon: IconBell,
              title: 'Motor de recordatorios',
              body: 'Cada cinco minutos evalúa qué recordatorios disparar. Reintentos automáticos hasta 3 veces. Snooze de 5, 10, 15 o 30 minutos.',
            },
            {
              n: '03',
              Icon: IconReports,
              title: 'Reportes propios',
              body: 'Eventos creados, completados, tasa de cumplimiento y volumen de notificaciones — exportables en CSV.',
            },
          ].map(({ n, Icon, title, body }) => (
            <article key={n} className="bg-ink-1 p-7 lg:p-8 group">
              <div className="flex items-start justify-between mb-8">
                <span className="font-mono text-[11px] uppercase tracking-ticker text-bone-3">
                  {n}
                </span>
                <span className="text-bone-3 group-hover:text-lime transition-colors">
                  <Icon size={22} />
                </span>
              </div>
              <h3 className="font-display text-2xl tracking-editorial mb-3 text-bone-0">
                {title}
              </h3>
              <p className="text-bone-2 text-[14px] leading-relaxed">{body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ENGINE */}
      <section
        id="engine"
        className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-10 py-20 border-t border-ink-3"
      >
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-start">
          <div>
            <p className="eyebrow mb-3">Sección 02 · motor</p>
            <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] tracking-editorial leading-[1.02] mb-6">
              El correo llega
              <br />
              <span className="italic text-bone-2">cuando importa.</span>
            </h2>
            <p className="text-bone-1 text-[16px] leading-relaxed mb-8 max-w-lg">
              Un cron de Vercel ejecuta el motor cada 5 minutos. Lee los
              recordatorios pendientes, respeta la ventana horaria del usuario
              (06:00–22:00 por defecto) y despacha el correo con Resend. Si
              algo falla, reintenta hasta tres veces antes de marcarlo como no
              entregado.
            </p>
            <ul className="space-y-3 text-sm">
              {[
                { Icon: IconClock, text: 'Frecuencia: cada 5 minutos · 06:00–22:00 user TZ' },
                { Icon: IconSparkle, text: 'Anticipaciones: 5m · 15m · 30m · 1h · 3h · 1d · 2d · 1sem' },
                { Icon: IconShield, text: 'Reintentos automáticos · log con estado entregada / reintentando / no_entregada' },
              ].map(({ Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-bone-1">
                  <span className="text-lime mt-0.5 shrink-0">
                    <Icon size={16} />
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-ink-1 border border-ink-3 rounded-lg p-6 lg:p-8 font-mono text-[12px] leading-relaxed">
            <div className="flex items-center justify-between border-b border-ink-3 pb-3 mb-4 text-bone-3 uppercase tracking-ticker">
              <span>cron · process-reminders</span>
              <span className="flex items-center gap-2 text-lime">
                <span className="h-1.5 w-1.5 rounded-full bg-lime ap-pulse-dot" />
                vivo
              </span>
            </div>
            <pre className="text-bone-1 whitespace-pre-wrap">
{`schedule  */5 * * * *
endpoint  POST /api/cron/process-reminders
auth      Authorization: Bearer \${CRON_SECRET}

resp 200  { processed, sent, skipped, failed }
window    06:00–22:00  ·  user timezone
retries   3 max · 2 min entre intentos
channel   email  →  Resend  →  fallback log`}
            </pre>
          </div>
        </div>
      </section>

      {/* STACK */}
      <section
        id="stack"
        className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-10 py-20 border-t border-ink-3"
      >
        <p className="eyebrow mb-3">Sección 03 · stack</p>
        <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] tracking-editorial leading-none mb-10">
          Construido con
          <span className="text-lime">.</span>
        </h2>

        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            ['Next.js 15.5', 'app router'],
            ['React 19', 'server components'],
            ['Tailwind v3', 'design tokens'],
            ['Supabase', 'postgres + auth'],
            ['Vercel Cron', '*/5 min'],
            ['Resend', 'email transaccional'],
            ['Vercel Blob', 'adjuntos + auditoría'],
            ['JWT (jose) + bcrypt', 'sesiones HttpOnly'],
          ].map(([name, sub]) => (
            <li
              key={name}
              className="bg-ink-1 border border-ink-3 rounded p-4 hover:border-ink-4 hover:bg-ink-2 transition-colors"
            >
              <p className="font-display text-lg tracking-editorial text-bone-0">
                {name}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-ticker text-bone-3 mt-1">
                {sub}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-10 py-20 border-t border-ink-3">
        <div className="bg-ink-1 border border-ink-3 rounded-lg p-10 lg:p-16 text-center">
          <p className="eyebrow mb-4">Cierre · capítulo final</p>
          <h2 className="font-display tracking-editorial leading-[0.95] mb-6 text-[clamp(2.25rem,5vw,4.5rem)]">
            ¿Listo para
            <br />
            <span className="italic">empezar tu agenda</span>
            <span className="text-lime">?</span>
          </h2>
          <p className="text-bone-1 mb-8 max-w-md mx-auto">
            La cuenta demo está lista. Te toma 10 segundos verlo en marcha.
          </p>
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 h-12 px-7 rounded bg-lime text-ink-0 font-medium hover:bg-bone-0 transition-colors"
          >
            Ingresar a la agenda
            <span className="transition-transform group-hover:translate-x-0.5">
              <IconArrowRight size={18} />
            </span>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-10 pb-10">
        <div className="border-t border-ink-3 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-ticker text-bone-3">
          <p>© {new Date().getFullYear()} agenda·pro</p>
          <p>valerie samper · 1128127186 · proyecto académico</p>
          <p>vol. 01 · ed. 2026</p>
        </div>
      </footer>
    </main>
  );
}
