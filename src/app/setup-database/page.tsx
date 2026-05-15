'use client';

import { useState } from 'react';

interface SetupResponse {
  connected: boolean;
  tables?: Record<string, number>;
  error?: string;
}

interface CreateResponse {
  success: boolean;
  results: Array<{
    table: string;
    status: 'success' | 'error';
    message: string;
  }>;
  error?: string;
}

export default function SetupDatabase() {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [tables, setTables] = useState<Record<string, number>>({});
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [createStatus, setCreateStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [createResults, setCreateResults] = useState<CreateResponse['results']>([]);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setConnectionStatus('loading');
    setConnectionError(null);
    setTables({});

    try {
      const response = await fetch('/api/setup-database', {
        method: 'GET',
      });

      const data: SetupResponse = await response.json();

      if (data.connected) {
        setConnectionStatus('success');
        setTables(data.tables || {});
      } else {
        setConnectionStatus('error');
        setConnectionError(data.error || 'No se pudo conectar a la base de datos');
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionError(error instanceof Error ? error.message : 'Error de conexión');
    }
  };

  const handleCreateTables = async () => {
    setCreateStatus('loading');
    setCreateResults([]);
    setCreateError(null);

    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-all' }),
      });

      const data: CreateResponse = await response.json();

      if (response.ok) {
        setCreateStatus('success');
        setCreateResults(data.results || []);
      } else {
        setCreateStatus('error');
        setCreateError(data.error || 'Error al crear las tablas');
        setCreateResults(data.results || []);
      }
    } catch (error) {
      setCreateStatus('error');
      setCreateError(error instanceof Error ? error.message : 'Error de conexión');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Setup Base de Datos</h1>
        <p className="text-slate-400 mb-8">
          Página temporal para probar la conexión a Supabase y crear las tablas iniciales.
        </p>

        {/* Sección 1: Test de Conexión */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
          <h2 className="text-2xl font-semibold text-white mb-4">1. Probar Conexión</h2>

          <button
            onClick={handleTestConnection}
            disabled={connectionStatus === 'loading'}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              connectionStatus === 'loading'
                ? 'bg-slate-600 text-slate-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {connectionStatus === 'loading' ? 'Probando...' : 'Probar Conexión'}
          </button>

          {connectionStatus === 'success' && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded">
              <p className="text-green-400 font-semibold mb-3">✅ Conexión exitosa</p>
              <div className="space-y-2">
                {Object.keys(tables).length > 0 ? (
                  Object.entries(tables).map(([name, count]) => (
                    <div key={name} className="text-slate-300 flex justify-between">
                      <span>{name}</span>
                      <span className="text-slate-500">{count} filas</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">No hay tablas creadas aún</p>
                )}
              </div>
            </div>
          )}

          {connectionStatus === 'error' && connectionError && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded">
              <p className="text-red-400 font-semibold mb-2">❌ Error de conexión</p>
              <p className="text-red-300 text-sm font-mono break-words">{connectionError}</p>
            </div>
          )}
        </div>

        {/* Sección 2: Crear Tablas */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-semibold text-white mb-4">2. Crear Tablas</h2>

          <button
            onClick={handleCreateTables}
            disabled={createStatus === 'loading'}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              createStatus === 'loading'
                ? 'bg-slate-600 text-slate-300 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {createStatus === 'loading' ? 'Creando...' : 'Crear Todas las Tablas'}
          </button>

          {createResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {createResults.map((result, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded border ${
                    result.status === 'success'
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={result.status === 'success' ? 'text-green-400' : 'text-red-400'}>
                      {result.status === 'success' ? '✅' : '❌'}
                    </span>
                    <div className="flex-1">
                      <p className={result.status === 'success' ? 'text-green-400' : 'text-red-400'}>
                        {result.table}
                      </p>
                      <p className="text-slate-400 text-sm mt-1">{result.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {createStatus === 'success' && createError === null && createResults.length > 0 && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded">
              <p className="text-green-400 font-semibold">✅ Tablas creadas exitosamente</p>
            </div>
          )}

          {createStatus === 'error' && createError && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded">
              <p className="text-red-400 font-semibold mb-2">❌ Error al crear tablas</p>
              <p className="text-red-300 text-sm font-mono break-words">{createError}</p>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-8 p-4 bg-slate-700/50 border border-slate-600 rounded text-sm text-slate-400">
          <p>
            Esta página es temporal y debe ser eliminada después de confirmar que la conexión funciona correctamente.
          </p>
        </div>
      </div>
    </div>
  );
}
