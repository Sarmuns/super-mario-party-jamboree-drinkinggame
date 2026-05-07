import { useEffect } from 'react';
import type { ToastMessage } from '../types';

interface Props {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

export function ToastContainer({ toasts, onDismiss }: Props) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none w-max max-w-[90vw]">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 2500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div className="fade-in bg-gray-700 text-white px-4 py-2 rounded-xl shadow-xl text-sm font-medium pointer-events-auto text-center border border-gray-600">
      {toast.message}
    </div>
  );
}
