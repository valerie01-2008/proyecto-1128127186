'use client';

import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';

export function useGlobalErrorHandler() {
  const router = useRouter();
  const { showToast } = useToast();

  const handleResponse = async (response: Response) => {
    if (response.ok) return response;

    const contentType = response.headers.get('content-type');
    let errorData: any = {};
    if (contentType && contentType.includes('application/json')) {
      try {
        errorData = await response.json();
      } catch (e) {
        // Ignore parse error
      }
    }

    switch (response.status) {
      case 401:
        showToast('Tu sesión expiró', 'error');
        // Redirect to login with current URL
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        break;

      case 403:
        if (errorData.code === 'QUOTA_EXCEEDED') {
          // Trigger modal - handled by component
          window.dispatchEvent(new CustomEvent('showQuotaModal'));
        } else {
          showToast('Acceso denegado', 'error');
        }
        break;

      case 409:
        // This is a warning, not an error - handled by the component
        break;

      case 429:
        const retryAfter = response.headers.get('Retry-After');
        const message = retryAfter
          ? `Cuenta bloqueada. Intenta de nuevo en ${retryAfter} segundos.`
          : 'Cuenta bloqueada temporalmente.';
        showToast(message, 'warning');
        break;

      case 500:
        showToast('Ha ocurrido un error interno. Inténtalo de nuevo.', 'error');
        break;

      default:
        showToast('Ha ocurrido un error inesperado.', 'error');
    }

    // Throw to prevent further processing
    throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
  };

  return { handleResponse };
}