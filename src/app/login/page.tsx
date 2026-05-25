'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { IconLogo, IconArrowRight, IconSparkle, IconClock } from '@/components/icons';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          ...(mode === 'register' ? { name } : {}),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'No fue posible autenticar');
      }
    } catch {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(var(--ink-3) 1px, transparent 1px), linear-gradient(90deg, var(--ink-3) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div
        aria-hidden
        className="absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(253,224,71,0.18), transparent 60%)' }}
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -left-40 h-[460px] w-[460px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.18), transparent 60%)' }}
      />

      <div className="relative grid lg:grid-cols-[1.05fr_1fr] min-h-screen">
        {/* LEFT — editorial column */}
        <section className="hidden lg:flex flex-col justify-between p-12 xl:p-16 border-r border-ink-3">
          <header className="flex items-center gap-3">
            <span className="text-lime">
              <IconLogo size={28} />
            </span>
            <span className="font-display text-2xl tracking-editorial">
              Agenda<span className="text-bone-2">·</span>Pro
            </span>
          </header>

          <div className="ap-fade-up">
            <p className="eyebrow mb-6">N° 01 · agenda editorial</p>
            <h1 className="font-display text-[clamp(3rem,6vw,5.25rem)] leading-[0.95] tracking-editorial mb-8">
              Cero
              <br />
              olvidos.{' '}
              <span className="italic text-lime relative">
                Cero
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-lime"
                />
              </span>
              <br />
              ruido.
            </h1>
            <p className="text-bone-1 text-[17px] leading-relaxed max-w-md">
              Una agenda con carácter. Calendario en tres vistas, motor de
              recordatorios cada 5&nbsp;minutos y un correo que llega&nbsp;
              <span className="text-bone-0 underline decoration-lime decoration-2 underline-offset-4">
                cuando importa
              </span>
              .
            </p>

            <ul className="mt-10 space-y-3 max-w-md">
              {[
                { Icon: IconSparkle, label: 'Tres vistas: día, semana, mes' },
                { Icon: IconClock, label: 'Recordatorios anticipados de 5 min a 1 semana' },
                { Icon: IconArrowRight, label: 'Snooze de 5, 10, 15 o 30 minutos' },
              ].map(({ Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 text-sm text-bone-1"
                >
                  <span className="text-lime">
                    <Icon size={16} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <footer className="font-mono text-[11px] uppercase tracking-ticker text-bone-3">
            v1 · supabase postgres · vercel cron · resend
          </footer>
        </section>

        {/* RIGHT — form */}
        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <span className="text-lime">
                <IconLogo size={26} />
              </span>
              <span className="font-display text-xl tracking-editorial">
                Agenda<span className="text-bone-2">·</span>Pro
              </span>
            </div>

            <div className="ap-fade-up">
              <p className="eyebrow mb-2">
                {mode === 'login' ? 'Acceder · sección 01' : 'Crear cuenta · sección 02'}
              </p>
              <h2 className="font-display text-4xl tracking-editorial mb-8">
                {mode === 'login' ? (
                  <>
                    Bienvenido
                    <br />
                    de vuelta.
                  </>
                ) : (
                  <>
                    Empieza
                    <br />
                    tu agenda.
                  </>
                )}
              </h2>

              <div className="inline-flex p-1 bg-ink-1 border border-ink-3 rounded mb-8">
                {(['login', 'register'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMode(m);
                      setError('');
                    }}
                    className={[
                      'px-4 h-8 text-[13px] rounded-sm transition-colors',
                      mode === m
                        ? 'bg-ink-3 text-bone-0'
                        : 'text-bone-2 hover:text-bone-0',
                    ].join(' ')}
                  >
                    {m === 'login' ? 'Ingresar' : 'Registrarse'}
                  </button>
                ))}
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                {mode === 'register' && (
                  <Field
                    label="Nombre"
                    htmlFor="name"
                    counter={`${name.length}/80`}
                  >
                    <input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      maxLength={80}
                      required
                      className="w-full bg-transparent text-bone-0 placeholder:text-bone-3 outline-none"
                    />
                  </Field>
                )}

                <Field label="Correo" htmlFor="email">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@dominio.com"
                    required
                    className="w-full bg-transparent text-bone-0 placeholder:text-bone-3 outline-none"
                  />
                </Field>

                <Field
                  label="Contraseña"
                  htmlFor="password"
                  hint={mode === 'register' ? '8+ caracteres · 1 mayúscula · 1 número' : undefined}
                >
                  <input
                    id="password"
                    type="password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-transparent text-bone-0 placeholder:text-bone-3 outline-none tracking-widest"
                  />
                </Field>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-crimson bg-crimson-soft border border-crimson/30 rounded px-3 py-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-crimson ap-pulse-dot" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full h-12 bg-lime text-ink-0 font-medium rounded inline-flex items-center justify-center gap-2 hover:bg-bone-0 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  {loading
                    ? mode === 'login'
                      ? 'Verificando…'
                      : 'Creando cuenta…'
                    : mode === 'login'
                    ? 'Iniciar sesión'
                    : 'Crear cuenta'}
                  <span className="transition-transform group-hover:translate-x-0.5">
                    <IconArrowRight size={18} />
                  </span>
                </button>
              </form>

              <div className="mt-10 pt-6 border-t border-ink-3">
                <p className="font-mono text-[11px] uppercase tracking-ticker text-bone-3 mb-3">
                  Cuenta demo de administrador
                </p>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <div className="bg-ink-1 border border-ink-3 rounded p-2.5">
                    <p className="text-bone-3 text-[10px] uppercase mb-1">Correo</p>
                    <p className="text-bone-0">admin@agendapro.app</p>
                  </div>
                  <div className="bg-ink-1 border border-ink-3 rounded p-2.5">
                    <p className="text-bone-3 text-[10px] uppercase mb-1">Password</p>
                    <p className="text-bone-0">Admin123!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  counter,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  counter?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="font-mono text-[11px] uppercase tracking-ticker text-bone-2">
          {label}
        </span>
        {counter && (
          <span className="font-mono text-[10px] text-bone-3">{counter}</span>
        )}
      </div>
      <div className="bg-ink-1 border border-ink-3 rounded h-12 px-3.5 flex items-center transition-colors focus-within:border-lime/60">
        {children}
      </div>
      {hint && (
        <p className="mt-1.5 text-[11px] text-bone-3 font-mono">{hint}</p>
      )}
    </label>
  );
}
