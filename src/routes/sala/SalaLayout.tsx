import { useEffect, useRef, useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { useGameState } from '../../hooks/useGameState';
import { useRoom } from '../../hooks/useRoom';
import { useLog } from '../../hooks/useLog';
import { IncomingEventModal } from '../../components/IncomingEventModal';
import type { RootContext } from '../Root';

// Estados separados para empilhamento simultâneo
interface PrebrewState { hostName: string; turn: number; }
interface ResultState  { hostName: string; turn: number; format?: string; }

export interface SalaContext extends RootContext {
  game: ReturnType<typeof useGameState>;
  room: ReturnType<typeof useRoom>;
  log: ReturnType<typeof useLog>;
  nickname: string;
  setNickname: (n: string) => void;
}

const FORMATS: Record<string, string> = {
  ffa: 'FFA — último lugar bebe +1',
  '2v2': '2v2 — dupla perdedora bebe +1 cada',
  '1v3': '1v3 — lado perdedor bebe +1 cada',
};

export function SalaLayout() {
  const root = useOutletContext<RootContext>();
  const game = useGameState();
  const room = useRoom();
  const log = useLog();

  const [prebrewPending, setPrebrewPending] = useState<PrebrewState | null>(null);
  const [resultPending, setResultPending]   = useState<ResultState | null>(null);
  const [nickname, setNicknameState] = useState(() => localStorage.getItem('smpj-nickname') ?? '');

  function setNickname(n: string) {
    setNicknameState(n);
    localStorage.setItem('smpj-nickname', n);
  }

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

  // Notificações de presença
  useEffect(() => {
    if (!room.presenceNotification) return;
    root.showToast(room.presenceNotification);
    room.dismissPresenceNotification();
  }, [room.presenceNotification]);

  // Incoming events — em useEffect para não causar side effects durante render
  const incomingEvent = room.incomingEvent;
  const multiplier = (game.state.isHomestretch ? 2 : 1) * (game.state.isJamboree ? 2 : 1);

  useEffect(() => {
    if (!incomingEvent) return;

    if (incomingEvent.type === 'activity') {
      root.showToast(`${incomingEvent.emoji ?? '💬'} ${incomingEvent.message}`);
      log.addEntry({
        emoji: incomingEvent.emoji ?? '💬',
        message: incomingEvent.message,
        playerName: incomingEvent.fromPlayerName,
        playerColor: incomingEvent.characterColor,
        source: 'room',
      });
      room.dismissEvent();
      return;
    }

    if (!room.isHost) {
      if (incomingEvent.type === 'minigame_prebrew') {
        setPrebrewPending({ hostName: incomingEvent.fromPlayerName, turn: incomingEvent.turn ?? 1 });
        room.dismissEvent();
        return;
      }
      if (incomingEvent.type === 'minigame_start') {
        // Mantém prebrew ativo se ainda não foi confirmado — os dois ficarão empilhados
        setResultPending({ hostName: incomingEvent.fromPlayerName, turn: incomingEvent.turn ?? 1, format: incomingEvent.minigameFormat });
        room.dismissEvent();
        return;
      }
      if (incomingEvent.type === 'minigame_skip') {
        setPrebrewPending(null);
        setResultPending(null);
        root.showToast('Host cancelou o minigame');
        room.dismissEvent();
        return;
      }
    } else {
      if (['minigame_prebrew', 'minigame_start', 'minigame_skip'].includes(incomingEvent.type)) {
        room.dismissEvent();
        return;
      }
    }
  }, [incomingEvent]);

  const isDrinkEvent = incomingEvent &&
    incomingEvent.type !== 'activity' &&
    incomingEvent.type !== 'minigame_prebrew' &&
    incomingEvent.type !== 'minigame_start' &&
    incomingEvent.type !== 'minigame_skip';

  const showMinigamePanel = !room.isHost && room.status === 'playing' && (prebrewPending || resultPending);
  const loserDrinks = 1 * multiplier;
  const prebrewDrinks = 1 * multiplier;

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

      {/* Painel de minigame do guest — empilhado quando ambos pendentes */}
      {showMinigamePanel && (
        <>
          <div className="fixed inset-0 z-40 bg-black/75" />
          <div className="fixed inset-x-0 bottom-0 z-50 md:inset-0 md:flex md:items-end md:justify-center md:p-4">
            <div className="bg-gray-800 rounded-t-3xl md:rounded-3xl w-full md:max-w-md shadow-2xl overflow-hidden"
              style={{ borderTop: '3px solid var(--accent)' }}>

              <div className="flex justify-center pt-3 pb-1 md:hidden">
                <div className="w-10 h-1 rounded-full bg-gray-600" />
              </div>

              {/* Card de RESULTADO — topo (aparece quando host escolheu formato) */}
              {resultPending && (
                <ResultCard
                  result={resultPending}
                  loserDrinks={loserDrinks}
                  onConfirm={(lost) => {
                    if (lost) {
                      game.addDrinks(loserDrinks);
                      root.showToast(`😅 Perdeu! 🍺 +${loserDrinks}`);
                    } else {
                      root.showToast('🏆 Ganhou o minigame!');
                    }
                    setResultPending(null);
                  }}
                />
              )}

              {/* Separador quando ambos visíveis */}
              {resultPending && prebrewPending && (
                <div className="mx-5 border-t border-gray-600/60" />
              )}

              {/* Card de PREBREW — base (beba antes de jogar) */}
              {prebrewPending && (
                <PrebrewCard
                  prebrew={prebrewPending}
                  drinks={prebrewDrinks}
                  multiplier={multiplier}
                  onConfirm={() => {
                    game.addDrinks(prebrewDrinks);
                    root.showToast(`🍺 +${prebrewDrinks} (pré-minigame)`);
                    setPrebrewPending(null);
                  }}
                />
              )}
            </div>
          </div>
        </>
      )}

      {room.isReconnecting && (
        <div className="fixed inset-0 z-50 bg-gray-900/90 flex flex-col items-center justify-center gap-3">
          <div className="text-3xl animate-spin">🔄</div>
          <div className="text-white font-semibold">Reconectando à sala...</div>
        </div>
      )}

      <Outlet context={{ ...root, game, room, log, nickname, setNickname } satisfies SalaContext} />
    </>
  );
}

function PrebrewCard({ prebrew, drinks, multiplier, onConfirm }: {
  prebrew: PrebrewState; drinks: number; multiplier: number; onConfirm: () => void;
}) {
  return (
    <div className="px-5 py-4 flex items-center gap-4">
      <div className="shrink-0 text-center">
        <div className="text-3xl">🍺</div>
        <div className="text-2xl font-black text-white leading-none mt-1">{drinks}</div>
        <div className="text-[10px] text-gray-400">gole{drinks !== 1 ? 's' : ''}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-400 leading-none">{prebrew.hostName} · Turno {prebrew.turn}</div>
        <div className="text-sm font-bold text-white mt-0.5">Beba antes do minigame</div>
        <div className="text-xs text-gray-500">
          {multiplier > 1 ? `(${multiplier}x ativo)` : 'pré-jogo obrigatório'}
        </div>
      </div>
      <button onClick={onConfirm}
        className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold text-white active:scale-95 transition-transform bg-yellow-600">
        Bebi! ✓
      </button>
    </div>
  );
}

function ResultCard({ result, loserDrinks, onConfirm }: {
  result: ResultState; loserDrinks: number; onConfirm: (lost: boolean) => void;
}) {
  const formatLabel = result.format
    ? (FORMATS[result.format] ?? result.format.toUpperCase())
    : 'Aguardando formato...';

  return (
    <div className="px-5 py-4 space-y-3">
      <div>
        <div className="text-xs text-gray-400">🎮 Minigame — Turno {result.turn}</div>
        <div className="text-sm font-bold text-white mt-0.5">{formatLabel}</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => onConfirm(false)}
          className="py-3 rounded-2xl text-sm font-bold border-2 border-green-500/50 bg-green-900/20 text-green-400 active:scale-95 transition-transform">
          🏆 Ganhei
        </button>
        <button onClick={() => onConfirm(true)}
          className="py-3 rounded-2xl text-sm font-bold border-2 border-red-500/50 bg-red-900/20 text-red-400 active:scale-95 transition-transform">
          😅 Perdi +{loserDrinks}
        </button>
      </div>
    </div>
  );
}

export function useSalaContext() {
  return useOutletContext<SalaContext>();
}
