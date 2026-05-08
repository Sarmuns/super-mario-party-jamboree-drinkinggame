import { Outlet, useOutletContext } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

export interface RootContext {
  showToast: (msg: string) => void;
}

export function Root() {
  const { toasts, showToast, dismissToast } = useToast();

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <Outlet context={{ showToast } satisfies RootContext} />
    </>
  );
}

export function useRootContext() {
  return useOutletContext<RootContext>();
}
