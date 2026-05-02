'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { EventWithDetails } from '@/lib/types';

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (response.ok) {
        const eventData = await response.json();
        setEvent(eventData);
      } else if (response.status === 404) {
        setError('Evento no encontrado');
      } else {
        setError('Error al cargar el evento');
      }
    } catch (err) {
      setError('Error al cargar el evento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!confirm('¿Estás seguro de que quieres marcar este evento como completado?')) {
      return;
    }

    setIsCompleting(true);
    try {
      const response = await fetch(`/api/events/${eventId}/complete`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchEvent(); // Recargar el evento
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al completar el evento');
      }
    } catch (err) {
      setError('Error al completar el evento');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/events');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al eliminar el evento');
      }
    } catch (err) {
      setError('Error al eliminar el evento');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
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

  const getStatusColor = (status: string) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      completado: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.pendiente;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => router.push('/events')}
          className="mt-4 text-violet-600 hover:text-violet-700"
        >
          Volver a la lista de eventos
        </button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Evento no encontrado</p>
        <button
          onClick={() => router.push('/events')}
          className="mt-4 text-violet-600 hover:text-violet-700"
        >
          Volver a la lista de eventos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
              {event.category}
            </span>
            <span className={`text-sm font-medium ${getPriorityColor(event.priority)}`}>
              Prioridad: {event.priority}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
              {event.status}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/events/${event.id}/edit`}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Editar
          </Link>
          {event.status === 'pendiente' && (
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isCompleting ? 'Completando...' : 'Marcar como completado'}
            </button>
          )}
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>

      {/* Detalles */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalles del Evento</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Fecha y hora de inicio</h3>
            <p className="text-gray-900">{formatDate(event.startAt)}</p>
          </div>

          {event.endAt && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Fecha y hora de fin</h3>
              <p className="text-gray-900">{formatDate(event.endAt)}</p>
            </div>
          )}

          {event.location && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Ubicación</h3>
              <p className="text-gray-900">{event.location}</p>
            </div>
          )}

          {event.description && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Descripción</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Adjuntos */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Adjuntos</h2>

        {event.attachments.length === 0 ? (
          <p className="text-gray-500">No hay adjuntos para este evento</p>
        ) : (
          <div className="space-y-3">
            {event.attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{attachment.filename}</p>
                    <p className="text-xs text-gray-500">
                      {(attachment.fileSize / 1024).toFixed(1)} KB • {attachment.contentType}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => window.open(`/api/events/${event.id}/attachments?attachmentId=${attachment.id}`, '_blank')}
                  className="text-violet-600 hover:text-violet-700 text-sm font-medium"
                >
                  Descargar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recordatorios (placeholder para Fase 5) */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recordatorios</h2>
        <p className="text-gray-500">Los recordatorios se implementarán en la Fase 5</p>
      </div>

      {/* Historial de notificaciones (placeholder para Fase 5) */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Historial de Notificaciones</h2>
        <p className="text-gray-500">El historial de notificaciones se implementará en la Fase 5</p>
      </div>
    </div>
  );
}