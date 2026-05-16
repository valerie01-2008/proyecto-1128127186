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
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center px-4">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent mb-2">
              AgendaPro
            </h1>
            <p className="text-gray-300">Gestión de agenda inteligente</p>
          </div>

          <div className="mb-4 flex gap-2 border-b border-white/20">
            <button
              type="button"
              onClick={() => setIsRegistering(false)}
              className={`flex-1 py-2 font-semibold transition-colors ${!isRegistering ? 'text-yellow-300 border-b-2 border-yellow-300' : 'text-gray-400 hover:text-white'}`}
            >
              Ingresar
            </button>
            <button
              type="button"
              onClick={() => setIsRegistering(true)}
              className={`flex-1 py-2 font-semibold transition-colors ${isRegistering ? 'text-yellow-300 border-b-2 border-yellow-300' : 'text-gray-400 hover:text-white'}`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-white font-semibold mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 text-white placeholder-gray-400 backdrop-blur"
                  placeholder="Tu nombre"
                  required={isRegistering}
                />
              </div>
            )}

            <div>
              <label className="block text-white font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 text-white placeholder-gray-400 backdrop-blur"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 text-white placeholder-gray-400 backdrop-blur"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm backdrop-blur">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-300 to-pink-300 text-violet-700 py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-yellow-300/50 disabled:opacity-50 transition-all duration-300"
            >
              {loading ? (isRegistering ? 'Creando cuenta...' : 'Iniciando sesión...') : (isRegistering ? 'Crear cuenta' : 'Iniciar sesión')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/5 text-gray-300">O</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-white/20 text-white py-3 rounded-lg font-semibold border border-white/30 hover:bg-white/30 transition backdrop-blur"
          >
            Continuar como invitado
          </button>

          <p className="text-center text-gray-300 text-sm mt-6">
            <button
              onClick={() => router.push('/')}
              className="text-yellow-200 font-semibold hover:text-yellow-100"
            >
              Volver a la portada
            </button>
          </p>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
          <p className="text-gray-200 text-sm">
            <span className="font-semibold text-white">🎯 Consejo:</span> Prueba la aplicación sin necesidad de credenciales. 
            Solo haz clic en "Continuar como invitado" para explorar todas las funcionalidades.
          </p>
        </div>
      </div>
    </div>
  );
}
