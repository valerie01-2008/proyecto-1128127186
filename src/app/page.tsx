'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-200 via-purple-200 to-indigo-200">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">AgendaPro</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-white text-violet-400 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Ingresar
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 inline-block">
            <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur">
              🚀 Productividad de próxima generación
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Gestiona tu agenda<br />
            <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
              de forma inteligente
            </span>
          </h2>

          <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            AgendaPro es tu asistente personal de productividad. Programa eventos, recibe recordatorios automáticos y 
            mantén todo organizado sin esfuerzo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3 bg-white text-violet-400 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              Comenzar ahora
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-3 bg-white/20 text-white rounded-lg font-semibold border border-white/30 hover:bg-white/30 transition backdrop-blur"
            >
              Más información
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="bg-white/10 backdrop-blur p-6 rounded-xl border border-white/20 hover:bg-white/20 transition">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-white font-bold mb-2">Agenda Inteligente</h3>
              <p className="text-gray-200 text-sm">
                Organiza tus eventos con facilidad y visualiza tu calendario de múltiples formas.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur p-6 rounded-xl border border-white/20 hover:bg-white/20 transition">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-white font-bold mb-2">Recordatorios Automáticos</h3>
              <p className="text-gray-200 text-sm">
                Recibe notificaciones en el momento exacto para nunca perder un evento importante.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur p-6 rounded-xl border border-white/20 hover:bg-white/20 transition">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-white font-bold mb-2">Reportes Detallados</h3>
              <p className="text-gray-200 text-sm">
                Analiza tu productividad con reportes completos de tus actividades.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-300">
          <p>© 2026 AgendaPro. Gestión de agenda inteligente.</p>
        </div>
      </footer>
    </div>
  );
}
