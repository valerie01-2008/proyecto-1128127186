'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          ...(isRegistering && { name }),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Error en autenticación');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center px-4">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-200/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-slate-200/50">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent mb-2">
              AgendaPro
            </h1>
            <p className="text-slate-600">Gestión de agenda inteligente</p>
          </div>

          <div className="mb-4 flex gap-2 border-b border-slate-200">
            <button
              type="button"
              onClick={() => setIsRegistering(false)}
              className={`flex-1 py-2 font-semibold transition-colors ${!isRegistering ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Ingresar
            </button>
            <button
              type="button"
              onClick={() => setIsRegistering(true)}
              className={`flex-1 py-2 font-semibold transition-colors ${isRegistering ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-slate-700 font-semibold mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-900 placeholder-slate-400"
                  placeholder="Tu nombre"
                  required={isRegistering}
                />
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-900 placeholder-slate-400"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-900 placeholder-slate-400"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-bold hover:shadow-md hover:shadow-blue-300/50 disabled:opacity-50 transition-all duration-300"
            >
              {loading ? (isRegistering ? 'Creando cuenta...' : 'Iniciando sesión...') : (isRegistering ? 'Crear cuenta' : 'Iniciar sesión')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/80 text-slate-500">O</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-slate-100 text-slate-700 py-3 rounded-lg font-semibold border border-slate-300 hover:bg-slate-200 transition"
          >
            Continuar como invitado
          </button>

          <p className="text-center text-slate-600 text-sm mt-6">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              Volver a la portada
            </button>
          </p>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-white/80 backdrop-blur rounded-xl p-6 border border-slate-200/50 shadow-md">
          <p className="text-slate-700 text-sm">
            <span className="font-semibold text-slate-900">🎯 Consejo:</span> Prueba la aplicación sin necesidad de credenciales. 
            Solo haz clic en "Continuar como invitado" para explorar todas las funcionalidades.
          </p>
        </div>
      </div>
    </div>
  );
}
