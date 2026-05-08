import { useEffect } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { useGameState } from '../../hooks/useGameState';
import { useLog } from '../../hooks/useLog';
import type { RootContext } from '../Root';

export interface OfflineContext extends RootContext {
  game: ReturnType<typeof useGameState>;
  log: ReturnType<typeof useLog>;
}

export function OfflineLayout() {
  const root = useOutletContext<RootContext>();
  const game = useGameState();
  const log = useLog();

  useEffect(() => {
    const color = game.state.character?.color ?? '#6366f1';
    document.documentElement.style.setProperty('--accent', color);
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    document.documentElement.style.setProperty('--accent-rgb', `${r} ${g} ${b}`);
  }, [game.state.character?.color]);

  return <Outlet context={{ ...root, game, log } satisfies OfflineContext} />;
}

export function useOfflineContext() {
  return useOutletContext<OfflineContext>();
}
