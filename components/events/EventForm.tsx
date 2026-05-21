'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Event } from '@/lib/types';

interface EventFormProps {
  event?: Event;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export default function EventForm({ event, onSubmit, isLoading = false }: EventFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'details' | 'reminders' | 'attachments'>('details');
  const [overlapWarning, _setOverlapWarning] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: event?.title || '',
    startAt: event?.startAt ? new Date(event.startAt).toISOString().slice(0, 16) : '',
    endAt: event?.endAt ? new Date(event.endAt).toISOString().slice(0, 16) : '',
    location: event?.location || '',
    description: event?.description || '',
    category: event?.category || 'otro',
    priority: event?.priority || 'normal',
  });

  const [_reminders, _setReminders] = useState([]); // TODO: Implementar en Fase 5
  const [_attachments, _setAttachments] = useState([]); // TODO: Implementar adjuntos

  // Verificar solapamiento en tiempo real
  useEffect(() => {
    const checkOverlap = async () => {
      if (!formData.startAt) return;

      try {
        // const _startAt = new Date(formData.startAt);
        // const _endAt = formData.endAt ? new Date(formData.endAt) : null;

        // const response = await fetch('/api/events/check-overlap', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ startAt: startAt.toISOString(), endAt: endAt?.toISOString() }),
        // });
        // const data = await response.json();
        // _setOverlapWarning(data.overlaps?.length > 0 ? `Se solapa con: ${data.overlaps.map((e: any) => e.title).join(', ')}` : null);
      } catch (error) {
        console.error('Error checking overlap:', error);
      }
    };

    const timeoutId = setTimeout(checkOverlap, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.startAt, formData.endAt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (overlapWarning) {
      alert('Por favor, resuelve el conflicto de solapamiento antes de guardar.');
      return;
    }

    const submitData = {
      ...formData,
      startAt: new Date(formData.startAt).toISOString(),
      endAt: formData.endAt ? new Date(formData.endAt).toISOString() : undefined,
    };

    try {
      await onSubmit(submitData);
      router.push('/events');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Tabs */}
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'details'
                  ? 'border-violet-500 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Detalles
            </button>
            <button
              onClick={() => setActiveTab('reminders')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'reminders'
                  ? 'border-violet-500 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Recordatorios
            </button>
            <button
              onClick={() => setActiveTab('attachments')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'attachments'
                  ? 'border-violet-500 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Adjuntos
            </button>
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Tab: Detalles */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Título del evento"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha y hora de inicio *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startAt}
                    onChange={(e) => handleInputChange('startAt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha y hora de fin
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endAt}
                    onChange={(e) => handleInputChange('endAt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {overlapWarning && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Conflicto de horario detectado
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{overlapWarning}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Ubicación del evento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Descripción del evento"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="personal">Personal</option>
                    <option value="trabajo">Trabajo</option>
                    <option value="salud">Salud</option>
                    <option value="educacion">Educación</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridad
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Recordatorios */}
          {activeTab === 'reminders' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <p className="text-gray-500">Los recordatorios se implementarán en la Fase 5</p>
              </div>
            </div>
          )}

          {/* Tab: Adjuntos */}
          {activeTab === 'attachments' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <p className="text-gray-500">Los adjuntos se implementarán próximamente</p>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !!overlapWarning}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Guardando...' : (event ? 'Actualizar Evento' : 'Crear Evento')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}