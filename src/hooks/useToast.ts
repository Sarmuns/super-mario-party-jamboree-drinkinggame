import { useState, useCallback } from 'react';
import type { ToastMessage } from '../types';

let nextId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string) => {
    const id = ++nextId;
    setToasts(t => [...t, { id, message }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(t => t.filter(toast => toast.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}
