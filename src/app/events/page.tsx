'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Event } from '@/lib/types';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '' as '' | 'pendiente' | 'completado' | 'cancelado',
    category: '',
    priority: '' as '' | 'normal' | 'alta' | 'urgente',
    search: '',
    from: '',
    to: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.status) params.set('status', filters.status);
      if (filters.category) params.set('category', filters.category);
      if (filters.priority) params.set('priority', filters.priority);
      if (filters.search) params.set('search', filters.search);
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);

      const response = await fetch(`/api/events?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search, fetchEvents]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
      priority: '',
      search: '',
      from: '',
      to: '',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      personal: 'bg-blue-100 text-blue-800',
      trabajo: 'bg-green-100 text-green-800',
      salud: 'bg-red-100 text-red-800',
      educacion: 'bg-purple-100 text-purple-800',
      otro: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.otro;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      normal: 'text-gray-600',
      alta: 'text-orange-600',
      urgente: 'text-red-600',
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Mis Eventos</h1>
        <Link
          href="/events/new"
          className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
        >
          Nuevo Evento
        </Link>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col gap-4">
          {/* Búsqueda */}
          <div className="flex">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Buscar en título y descripción..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Toggle filtros avanzados */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-violet-600 hover:text-violet-700 text-sm font-medium flex items-center gap-1"
            >
              {showFilters ? 'Ocultar' : 'Mostrar'} filtros avanzados
              <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {(filters.status || filters.category || filters.priority || filters.from || filters.to) && (
              <button
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Filtros avanzados */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Todas</option>
                  <option value="personal">Personal</option>
                  <option value="trabajo">Trabajo</option>
                  <option value="salud">Salud</option>
                  <option value="educacion">Educación</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Prioridad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Todas</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              {/* Fecha desde */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => handleFilterChange('from', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Fecha hasta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => handleFilterChange('to', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de eventos */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-12">
            {filters.search ? (
              <div>
                <p className="text-gray-500">No encontramos eventos para '{filters.search}'</p>
                <p className="text-gray-400 text-sm mt-1">Prueba con otras palabras.</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-500">No hay eventos para mostrar</p>
                <Link
                  href="/events/new"
                  className="text-violet-600 hover:text-violet-700 mt-2 inline-block"
                >
                  Crear tu primer evento
                </Link>
              </div>
            )}
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                    <span className={`text-sm font-medium ${getPriorityColor(event.priority)}`}>
                      {event.priority}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Inicio:</span> {formatDate(event.startAt)}
                    </p>
                    {event.endAt && (
                      <p>
                        <span className="font-medium">Fin:</span> {formatDate(event.endAt)}
                      </p>
                    )}
                    {event.location && (
                      <p>
                        <span className="font-medium">Ubicación:</span> {event.location}
                      </p>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-gray-700 mt-2">{event.description}</p>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/events/${event.id}`}
                    className="text-violet-600 hover:text-violet-700 text-sm font-medium"
                  >
                    Ver detalles
                  </Link>
                  <Link
                    href={`/events/${event.id}/edit`}
                    className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}