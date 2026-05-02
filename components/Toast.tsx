'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${typeClasses[type]} shadow-lg max-w-sm`}>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// Simple toast context for global toasts
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'onClose'>) => {
    const newToast = { ...toast, onClose: () => removeToast(toast) };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (toastToRemove: ToastProps) => {
    setToasts(prev => prev.filter(t => t !== toastToRemove));
  };

  return { toasts, addToast };
}