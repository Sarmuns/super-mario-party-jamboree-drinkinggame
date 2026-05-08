import { useEffect, useRef, useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { useGameState } from '../../hooks/useGameState';
import { useRoom } from '../../hooks/useRoom';
import { useLog } from '../../hooks/useLog';
import { IncomingEventModal } from '../../components/IncomingEventModal';
import { MinigameModal } from '../../components/MinigameModal';
import type { RootContext } from '../Root';

export interface GuestMinigameState {
  phase: 'prebrew' | 'waiting' | 'result';
  hostName: string;
  turn: number;
  format?: string;
}

export interface SalaContext extends RootContext {
  game: ReturnType<typeof useGameState>;
  room: ReturnType<typeof useRoom>;
  log: ReturnType<typeof useLog>;
  guestMinigame: GuestMinigameState | null;
  setGuestMinigame: (s: GuestMinigameState | null) => void;
}

export function SalaLayout() {
  const root = useOutletContext<RootContext>();
  const game = useGameState();
  const room = useRoom();
  const log = useLog();
  const [guestMinigame, setGuestMinigame] = useState<GuestMinigameState | null>(null);

  // Accent color
  useEffect(() => {
    const color = game.state.character?.color ?? '#6366f1';
    document.documentElement.style.setProperty('--accent', color);
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    document.documentElement.style.setProperty('--accent-rgb', `${r} ${g} ${b}`);
  }, [game.state.character?.color]);

  // Sync game state → presence (debounced)
  const syncRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (room.status !== 'playing') return;
    if (syncRef.current) clearTimeout(syncRef.current);
    syncRef.current = setTimeout(() => {
      room.updateMyState({
        totalDrinks: game.state.totalDrinks,
        stars: game.state.stars,
        hasShield: game.state.hasShield,
      });
    }, 400);
    return () => { if (syncRef.current) clearTimeout(syncRef.current); };
  }, [game.state.totalDrinks, game.state.stars, game.state.hasShield, room.status]);

  // Handle incoming events
  const incomingEvent = room.incomingEvent;
  const multiplier = (game.state.isHomestretch ? 2 : 1) * (game.state.isJamboree ? 2 : 1);

  if (incomingEvent?.type === 'activity') {
    root.showToast(`${incomingEvent.emoji ?? '💬'} ${incomingEvent.message}`);
    log.addEntry({
      emoji: incomingEvent.emoji ?? '💬',
      message: incomingEvent.message,
      playerName: incomingEvent.fromPlayerName,
      playerColor: incomingEvent.characterColor,
      source: 'room',
    });
    room.dismissEvent();
  }

  if (incomingEvent?.type === 'minigame_prebrew' && !room.isHost) {
    setGuestMinigame({ phase: 'prebrew', hostName: incomingEvent.fromPlayerName, turn: incomingEvent.turn ?? game.state.turn });
    room.dismissEvent();
  }

  if (incomingEvent?.type === 'minigame_start' && !room.isHost) {
    setGuestMinigame(prev => prev
      ? { ...prev, phase: 'result', format: incomingEvent.minigameFormat }
      : { phase: 'result', hostName: incomingEvent.fromPlayerName, turn: incomingEvent.turn ?? game.state.turn, format: incomingEvent.minigameFormat }
    );
    room.dismissEvent();
  }

  const isDrinkEvent = incomingEvent &&
    incomingEvent.type !== 'activity' &&
    incomingEvent.type !== 'minigame_prebrew' &&
    incomingEvent.type !== 'minigame_start';

  return (
    <>
      {isDrinkEvent && (
        <IncomingEventModal
          event={incomingEvent!}
          hasShield={game.state.hasShield}
          multiplier={multiplier}
          onDrink={game.addDrinks}
          onUseShield={() => { game.useShield(); root.showToast('Escudo usado! 🛡️'); }}
          onDismiss={room.dismissEvent}
        />
      )}

      {guestMinigame && room.status === 'playing' && !room.isHost && (
        <MinigameModal
          mode="guest"
          turn={guestMinigame.turn}
          multiplier={multiplier}
          hostName={guestMinigame.hostName}
          phase={guestMinigame.phase}
          format={guestMinigame.format}
          onConfirmPrebrew={(drinks) => {
            game.addDrinks(drinks);
            root.showToast(`🍺 +${drinks} (pré-minigame)`);
            setGuestMinigame(prev => prev ? { ...prev, phase: 'waiting' } : null);
          }}
          onConfirmResult={(drinks) => {
            if (drinks > 0) game.addDrinks(drinks);
            root.showToast(drinks > 0 ? `😅 Perdeu! 🍺 +${drinks}` : '🏆 Ganhou!');
            setGuestMinigame(null);
          }}
          onClose={() => setGuestMinigame(null)}
        />
      )}

      {room.isReconnecting && (
        <div className="fixed inset-0 z-50 bg-gray-900/90 flex flex-col items-center justify-center gap-3">
          <div className="text-3xl animate-spin">🔄</div>
          <div className="text-white font-semibold">Reconectando à sala...</div>
        </div>
      )}

      <Outlet context={{ ...root, game, room, log, guestMinigame, setGuestMinigame } satisfies SalaContext} />
    </>
  );
}

export function useSalaContext() {
  return useOutletContext<SalaContext>();
}
